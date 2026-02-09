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

class ScheduleWeeklyNewsletters implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(NewsletterService $newsletters): void
    {
        $schedules = NewsletterSchedule::where('weekly_enabled', true)->get();
        
        foreach ($schedules as $schedule) {
            try {
                // Check if today is the send day
                $today = now($schedule->timezone);
                if ($today->dayOfWeek !== $schedule->weekly_send_day) {
                    continue;
                }
                
                // Calculate send time in community's timezone
                $sendTime = $today
                    ->setTimeFromTimeString($schedule->weekly_send_time)
                    ->setTimezone('UTC');
                
                // Check if newsletter already exists for this week
                $weekStart = $today->startOfWeek();
                $exists = Newsletter::where('community_id', $schedule->community_id)
                    ->where('newsletter_type', 'weekly')
                    ->where('issue_date', '>=', $weekStart)
                    ->where('issue_date', '<=', $weekStart->copy()->endOfWeek())
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
                    'newsletter_type' => 'weekly',
                    'issue_date' => $today->toDateString(),
                    'subject' => $this->generateSubject($community, 'weekly'),
                ]);
                
                // Build content
                $newsletters->build($newsletter->id);
                
                // Schedule send
                $newsletters->schedule($newsletter->id, $sendTime);
                
                Log::info('Weekly newsletter scheduled', [
                    'newsletter_id' => $newsletter->id,
                    'community_id' => $schedule->community_id,
                    'scheduled_for' => $sendTime->toIso8601String(),
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to schedule weekly newsletter', [
                    'community_id' => $schedule->community_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
    
    private function generateSubject(Community $community, string $type): string
    {
        $date = now()->format('M j');
        return "{$community->name} Weekly - {$date}";
    }
}



