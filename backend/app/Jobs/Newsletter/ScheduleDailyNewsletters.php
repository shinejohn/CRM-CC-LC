<?php

namespace App\Jobs\Newsletter;

use App\Models\Community;
use App\Models\Newsletter\Newsletter;
use App\Models\Newsletter\NewsletterSchedule;
use App\Services\Newsletter\NewsletterService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ScheduleDailyNewsletters implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(NewsletterService $newsletters): void
    {
        $schedules = NewsletterSchedule::where('daily_enabled', true)->get();
        
        foreach ($schedules as $schedule) {
            try {
                // Calculate send time in community's timezone
                $sendTime = now($schedule->timezone)
                    ->setTimeFromTimeString($schedule->daily_send_time)
                    ->setTimezone('UTC');
                
                // If send time has passed for today, skip
                if ($sendTime->isPast()) {
                    continue;
                }
                
                // Check if newsletter already exists for today
                $exists = Newsletter::where('community_id', $schedule->community_id)
                    ->where('newsletter_type', 'daily')
                    ->where('issue_date', today())
                    ->exists();
                
                if ($exists) {
                    continue;
                }
                
                // Get community for subject generation
                $community = Community::find($schedule->community_id);
                if (!$community) {
                    continue;
                }
                
                // Create newsletter
                $newsletter = $newsletters->create([
                    'community_id' => $schedule->community_id,
                    'newsletter_type' => 'daily',
                    'issue_date' => today(),
                    'subject' => $this->generateSubject($community, 'daily'),
                ]);
                
                // Build content
                $newsletters->build($newsletter->id);
                
                // Schedule send
                $newsletters->schedule($newsletter->id, $sendTime);
                
                Log::info('Daily newsletter scheduled', [
                    'newsletter_id' => $newsletter->id,
                    'community_id' => $schedule->community_id,
                    'scheduled_for' => $sendTime->toIso8601String(),
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to schedule daily newsletter', [
                    'community_id' => $schedule->community_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
    
    private function generateSubject(Community $community, string $type): string
    {
        $date = now()->format('M j');
        return "{$community->name} Daily - {$date}";
    }
}



