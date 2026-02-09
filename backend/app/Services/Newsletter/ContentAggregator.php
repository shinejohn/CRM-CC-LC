<?php

namespace App\Services\Newsletter;

use App\Models\Article;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ContentAggregator
{
    public function aggregate(int $communityId, string $type, Carbon $date): array
    {
        $content = [
            'sections' => [],
        ];
        
        // Top Stories
        $content['sections']['top_stories'] = $this->getTopStories($communityId, $date, 5);
        
        // Local News
        $content['sections']['local_news'] = $this->getLocalNews($communityId, $date, 8);
        
        // Events (if weekly or has events)
        if ($type === 'weekly' || $this->hasUpcomingEvents($communityId)) {
            $content['sections']['events'] = $this->getUpcomingEvents($communityId, 5);
        }
        
        // Business Spotlight (weekly only)
        if ($type === 'weekly') {
            $content['sections']['business_spotlight'] = $this->getBusinessSpotlight($communityId);
        }
        
        // Weather
        $content['sections']['weather'] = $this->getWeather($communityId);
        
        return $content;
    }
    
    private function getTopStories(int $communityId, Carbon $date, int $limit): array
    {
        // Note: Article model may need community_id field or tenant_id
        // Adjust based on actual schema
        $articles = Article::where('status', 'published')
            ->where('published_at', '>=', $date->copy()->subDay())
            ->orderByDesc('view_count')
            ->limit($limit)
            ->get();
        
        return $articles->map(function ($article) {
            return [
                'type' => 'article',
                'id' => $article->id,
                'headline' => $article->title,
                'summary' => $article->excerpt,
                'image_url' => $article->featured_image,
                'link_url' => $article->slug ? "/articles/{$article->slug}" : null,
                'author' => null, // Add if available
                'published_at' => $article->published_at?->toIso8601String(),
            ];
        })->toArray();
    }
    
    private function getLocalNews(int $communityId, Carbon $date, int $limit): array
    {
        // Similar to top stories but broader scope
        $articles = Article::where('status', 'published')
            ->where('published_at', '>=', $date->copy()->subDays(2))
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get();
        
        return $articles->map(function ($article) {
            return [
                'type' => 'article',
                'id' => $article->id,
                'headline' => $article->title,
                'summary' => $article->excerpt,
                'image_url' => $article->featured_image,
                'link_url' => $article->slug ? "/articles/{$article->slug}" : null,
                'published_at' => $article->published_at?->toIso8601String(),
            ];
        })->toArray();
    }
    
    private function hasUpcomingEvents(int $communityId): bool
    {
        // Check if there are upcoming events
        // This would query an events table if it exists
        // For now, return false
        return false;
    }
    
    private function getUpcomingEvents(int $communityId, int $limit): array
    {
        // Placeholder - would query events table
        return [];
    }
    
    private function getBusinessSpotlight(int $communityId): ?array
    {
        // Placeholder - would feature a local business
        return null;
    }
    
    private function getWeather(int $communityId): ?array
    {
        // Placeholder - would fetch weather data
        return [
            'type' => 'weather',
            'location' => 'Local Area',
            'temperature' => null,
            'condition' => null,
        ];
    }
}



