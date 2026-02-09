<?php

namespace App\Contracts\Newsletter;

use App\Models\Newsletter\Newsletter;
use Carbon\Carbon;

interface NewsletterServiceInterface
{
    /**
     * Create a new newsletter
     */
    public function create(array $data): Newsletter;
    
    /**
     * Build newsletter content from sources
     */
    public function build(int $newsletterId): Newsletter;
    
    /**
     * Schedule newsletter for sending
     */
    public function schedule(int $newsletterId, Carbon $sendAt): Newsletter;
    
    /**
     * Send newsletter immediately
     */
    public function send(int $newsletterId): array;
    
    /**
     * Get newsletter with stats
     */
    public function getWithStats(int $newsletterId): Newsletter;
    
    /**
     * Cancel scheduled newsletter
     */
    public function cancel(int $newsletterId): bool;
}



