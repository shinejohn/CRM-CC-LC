<?php

namespace App\Contracts\Subscriber;

interface ListServiceInterface
{
    /**
     * Get subscribers for newsletter send
     */
    public function getNewsletterRecipients(string $communityId, string $frequency): array;
    
    /**
     * Get subscribers for alert send
     */
    public function getAlertRecipients(string $communityId, string $category): array;
    
    /**
     * Get subscribers for emergency broadcast
     */
    public function getEmergencyRecipients(array $communityIds): array;
    
    /**
     * Compile and cache community lists
     */
    public function compileLists(string $communityId): void;
    
    /**
     * Compile all community lists
     */
    public function compileAllLists(): void;
}



