<?php

namespace App\Services\Subscriber;

use App\Contracts\Subscriber\ListServiceInterface;
use App\Models\Subscriber\Subscriber;
use App\Models\Subscriber\CommunityEmailList;
use App\Models\Subscriber\CommunitySmsList;
use App\Models\Subscriber\SubscriberAlertPreference;
use App\Models\Community;

class ListService implements ListServiceInterface
{
    public function getNewsletterRecipients(string $communityId, string $frequency): array
    {
        // Try cached list first
        $cached = CommunityEmailList::find($communityId);
        
        if ($cached && $cached->compiled_at && $cached->compiled_at->gt(now()->subHours(1))) {
            return $frequency === 'daily' 
                ? $cached->daily_newsletter_emails 
                : $cached->weekly_newsletter_emails;
        }
        
        // Fall back to query
        return $this->queryNewsletterRecipients($communityId, $frequency);
    }
    
    public function getAlertRecipients(string $communityId, string $category): array
    {
        return Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->leftJoin('subscriber_alert_preferences', function ($join) use ($category) {
                $join->on('subscribers.id', '=', 'subscriber_alert_preferences.subscriber_id')
                     ->where('subscriber_alert_preferences.category_slug', '=', $category);
            })
            ->where('subscriber_communities.community_id', $communityId)
            ->where('subscriber_communities.alerts_enabled', true)
            ->where('subscribers.status', 'active')
            ->where('subscribers.alerts_enabled', true)
            ->where(function ($q) {
                // Email recipients
                $q->where(function ($q2) {
                    $q2->where('subscribers.email_opted_in', true)
                       ->where(function ($q3) {
                           $q3->whereNull('subscriber_alert_preferences.email_enabled')
                              ->orWhere('subscriber_alert_preferences.email_enabled', true);
                       });
                });
            })
            ->select([
                'subscribers.id',
                'subscribers.email',
                'subscribers.phone',
                'subscribers.device_tokens',
                'subscribers.first_name',
                'subscriber_alert_preferences.email_enabled',
                'subscriber_alert_preferences.sms_enabled',
                'subscriber_alert_preferences.push_enabled',
            ])
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'email' => $s->email_enabled !== false ? $s->email : null,
                'phone' => $s->sms_enabled ? $s->phone : null,
                'device_tokens' => $s->push_enabled !== false ? ($s->device_tokens ?? []) : [],
                'first_name' => $s->first_name,
            ])
            ->toArray();
    }
    
    public function getEmergencyRecipients(array $communityIds): array
    {
        // Emergency broadcasts go to EVERYONE - no preference filtering
        return Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->whereIn('subscriber_communities.community_id', $communityIds)
            ->where('subscribers.status', 'active')
            ->select([
                'subscribers.id',
                'subscribers.email',
                'subscribers.phone',
                'subscribers.device_tokens',
                'subscribers.first_name',
            ])
            ->distinct()
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'email' => $s->email,
                'phone' => $s->phone,
                'device_tokens' => $s->device_tokens ?? [],
                'first_name' => $s->first_name,
            ])
            ->toArray();
    }
    
    public function compileLists(string $communityId): void
    {
        // Daily newsletter subscribers
        $daily = Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->where('subscriber_communities.community_id', $communityId)
            ->where('subscriber_communities.newsletters_enabled', true)
            ->where('subscribers.status', 'active')
            ->where('subscribers.email_opted_in', true)
            ->where('subscribers.email_verified_at', '!=', null)
            ->where('subscribers.newsletter_frequency', 'daily')
            ->pluck('subscribers.email')
            ->toArray();
        
        // Weekly newsletter subscribers (includes daily)
        $weekly = Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->where('subscriber_communities.community_id', $communityId)
            ->where('subscriber_communities.newsletters_enabled', true)
            ->where('subscribers.status', 'active')
            ->where('subscribers.email_opted_in', true)
            ->where('subscribers.email_verified_at', '!=', null)
            ->whereIn('subscribers.newsletter_frequency', ['daily', 'weekly'])
            ->pluck('subscribers.email')
            ->toArray();
        
        // Alert subscribers
        $alerts = Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->where('subscriber_communities.community_id', $communityId)
            ->where('subscriber_communities.alerts_enabled', true)
            ->where('subscribers.status', 'active')
            ->where('subscribers.email_opted_in', true)
            ->where('subscribers.email_verified_at', '!=', null)
            ->where('subscribers.alerts_enabled', true)
            ->pluck('subscribers.email')
            ->toArray();
        
        // Emergency subscribers (all active)
        $emergency = Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->where('subscriber_communities.community_id', $communityId)
            ->where('subscribers.status', 'active')
            ->where('subscribers.email_verified_at', '!=', null)
            ->pluck('subscribers.email')
            ->toArray();
        
        // Update or create list
        CommunityEmailList::updateOrCreate(
            ['community_id' => $communityId],
            [
                'daily_newsletter_emails' => $daily,
                'weekly_newsletter_emails' => $weekly,
                'alert_emails' => $alerts,
                'emergency_emails' => $emergency,
                'daily_count' => count($daily),
                'weekly_count' => count($weekly),
                'alert_count' => count($alerts),
                'emergency_count' => count($emergency),
                'compiled_at' => now(),
            ]
        );
        
        // Compile SMS lists too
        $alertPhones = Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->where('subscriber_communities.community_id', $communityId)
            ->where('subscribers.status', 'active')
            ->where('subscribers.sms_opted_in', true)
            ->where('subscribers.alerts_enabled', true)
            ->whereNotNull('subscribers.phone')
            ->pluck('subscribers.phone')
            ->toArray();
        
        $emergencyPhones = Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->where('subscriber_communities.community_id', $communityId)
            ->where('subscribers.status', 'active')
            ->whereNotNull('subscribers.phone')
            ->pluck('subscribers.phone')
            ->toArray();
        
        CommunitySmsList::updateOrCreate(
            ['community_id' => $communityId],
            [
                'alert_phones' => $alertPhones,
                'emergency_phones' => $emergencyPhones,
                'alert_count' => count($alertPhones),
                'emergency_count' => count($emergencyPhones),
                'compiled_at' => now(),
            ]
        );
    }
    
    public function compileAllLists(): void
    {
        $communities = Community::pluck('id');
        
        foreach ($communities as $communityId) {
            $this->compileLists($communityId);
        }
    }
    
    private function queryNewsletterRecipients(string $communityId, string $frequency): array
    {
        $query = Subscriber::query()
            ->join('subscriber_communities', 'subscribers.id', '=', 'subscriber_communities.subscriber_id')
            ->where('subscriber_communities.community_id', $communityId)
            ->where('subscriber_communities.newsletters_enabled', true)
            ->where('subscribers.status', 'active')
            ->where('subscribers.email_opted_in', true)
            ->where('subscribers.email_verified_at', '!=', null);
        
        if ($frequency === 'daily') {
            $query->where('subscribers.newsletter_frequency', 'daily');
        } else {
            $query->whereIn('subscribers.newsletter_frequency', ['daily', 'weekly']);
        }
        
        return $query->pluck('subscribers.email')->toArray();
    }
}

