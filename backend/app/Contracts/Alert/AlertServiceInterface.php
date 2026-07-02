<?php

namespace App\Contracts\Alert;

use App\Models\Alert\Alert;

interface AlertServiceInterface
{
    /**
     * Create a new alert
     */
    public function create(array $data): Alert;
    
    /**
     * Submit alert for approval
     */
    public function submitForApproval(string $alertId): Alert;
    
    /**
     * Approve alert (triggers send if not scheduled)
     */
    public function approve(string $alertId, string $approvedBy): Alert;
    
    /**
     * Send alert immediately
     */
    public function send(string $alertId): array;
    
    /**
     * Cancel alert
     */
    public function cancel(string $alertId): bool;
    
    /**
     * Get recipient count estimate
     */
    public function estimateRecipients(string $alertId): int;
}



