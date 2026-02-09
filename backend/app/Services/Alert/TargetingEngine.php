<?php

namespace App\Services\Alert;

use App\Models\Alert\Alert;
use App\Models\Alert\AlertCategory;
use App\Models\Subscriber\Subscriber;
use Illuminate\Support\Facades\DB;

class TargetingEngine
{
    /**
     * Get recipients for an alert based on targeting criteria
     */
    public function getRecipients(Alert $alert): array
    {
        $query = Subscriber::query()
            ->where('status', 'active')
            ->where(function ($q) {
                $q->where('email_opted_in', true)
                  ->orWhere('sms_opted_in', true)
                  ->orWhereNotNull('device_tokens');
            });
        
        // Apply targeting
        $query = match ($alert->target_type) {
            'all' => $query,
            'communities' => $this->filterByCommunities($query, $alert->target_community_ids ?? []),
            'geo' => $this->filterByGeo($query, $alert),
            default => throw new \InvalidArgumentException("Invalid target type: {$alert->target_type}"),
        };
        
        // Filter by category preferences (unless category doesn't allow opt-out)
        $category = AlertCategory::where('slug', $alert->category)->first();
        if ($category && $category->allow_opt_out) {
            $query = $this->filterByPreferences($query, $alert->category);
        }
        
        return $query->get()->map(fn($s) => [
            'id' => $s->id,
            'email' => $s->email,
            'phone' => $s->phone,
            'device_tokens' => $s->device_tokens ?? [],
            'first_name' => $s->first_name,
        ])->toArray();
    }
    
    /**
     * Filter by communities
     */
    private function filterByCommunities($query, array $communityIds)
    {
        if (empty($communityIds)) {
            return $query->whereRaw('1 = 0'); // No results
        }
        
        return $query->whereHas('communities', function ($q) use ($communityIds) {
            $q->whereIn('communities.id', $communityIds);
        });
    }
    
    /**
     * Filter by geo location
     */
    private function filterByGeo($query, Alert $alert)
    {
        if ($alert->target_geo_json && DB::getDriverName() === 'pgsql') {
            // PostGIS query for GeoJSON polygon
            $geoJson = json_encode($alert->target_geo_json);
            return $query->whereRaw(
                "ST_Contains(ST_GeomFromGeoJSON(?), location)",
                [$geoJson]
            );
        }
        
        // Fallback: if no geo targeting, return all
        return $query;
    }
    
    /**
     * Filter by subscriber preferences
     */
    private function filterByPreferences($query, string $category)
    {
        // Exclude subscribers who have explicitly disabled this category for all channels
        return $query->whereDoesntHave('alertPreferences', function ($q) use ($category) {
            $q->where('category_slug', $category)
              ->where('email_enabled', false)
              ->where('sms_enabled', false)
              ->where('push_enabled', false);
        });
    }
    
    /**
     * Estimate recipient count (optimized count query)
     */
    public function estimateCount(Alert $alert): int
    {
        $query = Subscriber::query()
            ->where('status', 'active')
            ->where(function ($q) {
                $q->where('email_opted_in', true)
                  ->orWhere('sms_opted_in', true)
                  ->orWhereNotNull('device_tokens');
            });
        
        // Apply targeting
        $query = match ($alert->target_type) {
            'all' => $query,
            'communities' => $this->filterByCommunities($query, $alert->target_community_ids ?? []),
            'geo' => $this->filterByGeo($query, $alert),
            default => throw new \InvalidArgumentException("Invalid target type: {$alert->target_type}"),
        };
        
        // Filter by category preferences
        $category = AlertCategory::where('slug', $alert->category)->first();
        if ($category && $category->allow_opt_out) {
            $query = $this->filterByPreferences($query, $alert->category);
        }
        
        return $query->count();
    }
}



