<?php

namespace App\Contracts\Subscriber;

use App\Models\Subscriber\Subscriber;
use Illuminate\Http\Request;

interface SubscriberServiceInterface
{
    /**
     * Register new subscriber
     */
    public function register(array $data): Subscriber;
    
    /**
     * Verify email address
     */
    public function verifyEmail(string $token): Subscriber;
    
    /**
     * Update subscriber profile
     */
    public function updateProfile(int $subscriberId, array $data): Subscriber;
    
    /**
     * Update channel preferences
     */
    public function updatePreferences(int $subscriberId, array $data): Subscriber;
    
    /**
     * Subscribe to community
     */
    public function subscribeToCommunity(int $subscriberId, string $communityId): void;
    
    /**
     * Unsubscribe from community
     */
    public function unsubscribeFromCommunity(int $subscriberId, string $communityId): void;
    
    /**
     * Handle one-click unsubscribe
     */
    public function unsubscribe(string $token): array;
    
    /**
     * Get subscriber with all preferences
     */
    public function getWithPreferences(int $subscriberId): Subscriber;
}



