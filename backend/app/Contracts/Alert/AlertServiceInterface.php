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
    public function submitForApproval(int $alertId): Alert;
    
    /**
     * Approve alert (triggers send if not scheduled)
     */
    public function approve(int $alertId, int $approvedBy): Alert;
    
    /**
     * Send alert immediately
     */
    public function send(int $alertId): array;
    
    /**
     * Cancel alert
     */
    public function cancel(int $alertId): bool;
    
    /**
     * Get recipient count estimate
     */
    public function estimateRecipients(int $alertId): int;
}



