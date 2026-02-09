<?php

namespace App\Services\Newsletter;

use App\Models\Community;
use App\Models\Newsletter\Newsletter;
use App\Models\Newsletter\NewsletterSchedule;
use App\Models\Newsletter\NewsletterTemplate;
use Illuminate\Support\Facades\View;

class NewsletterBuilder
{
    public function build(Newsletter $newsletter, array $content): string
    {
        // Get template
        $schedule = NewsletterSchedule::where('community_id', $newsletter->community_id)->first();
        $templateId = $newsletter->newsletter_type === 'daily' 
            ? ($schedule->daily_template_id ?? null)
            : ($schedule->weekly_template_id ?? null);
        
        $template = null;
        if ($templateId) {
            $template = NewsletterTemplate::find($templateId);
        }
        
        if (!$template) {
            $template = NewsletterTemplate::where('is_default', true)
                ->where('newsletter_type', $newsletter->newsletter_type)
                ->first();
        }
        
        // Fallback to basic template if none found
        if (!$template) {
            return $this->buildBasicTemplate($newsletter, $content);
        }
        
        // Get community info
        $community = Community::find($newsletter->community_id);
        
        // Build data for template
        $data = [
            'newsletter' => $newsletter,
            'community' => $community,
            'content' => $content,
            'date' => $newsletter->issue_date->format('F j, Y'),
            'unsubscribe_url' => $this->getUnsubscribeUrl($newsletter),
            'web_view_url' => $this->getWebViewUrl($newsletter),
            'tracking_pixel' => $this->getTrackingPixel($newsletter),
        ];
        
        // Render template
        try {
            $view = View::make('newsletters.templates.' . $template->slug, $data);
            return $view->render();
        } catch (\Exception $e) {
            // Fallback to basic template if view doesn't exist
            return $this->buildBasicTemplate($newsletter, $content);
        }
    }
    
    private function buildBasicTemplate(Newsletter $newsletter, array $content): string
    {
        $html = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">';
        $html .= '<title>' . htmlspecialchars($newsletter->subject) . '</title></head><body>';
        $html .= '<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">';
        $html .= '<h1>' . htmlspecialchars($newsletter->subject) . '</h1>';
        
        if (!empty($content['sections'])) {
            foreach ($content['sections'] as $sectionName => $items) {
                if (empty($items)) {
                    continue;
                }
                
                $html .= '<h2>' . ucfirst(str_replace('_', ' ', $sectionName)) . '</h2>';
                
                foreach ($items as $item) {
                    if (isset($item['headline'])) {
                        $html .= '<h3>' . htmlspecialchars($item['headline']) . '</h3>';
                    }
                    if (isset($item['summary'])) {
                        $html .= '<p>' . htmlspecialchars($item['summary']) . '</p>';
                    }
                    if (isset($item['link_url'])) {
                        $html .= '<a href="' . htmlspecialchars($item['link_url']) . '">Read more</a>';
                    }
                    $html .= '<hr>';
                }
            }
        }
        
        $html .= $this->getTrackingPixel($newsletter);
        $html .= '<p><a href="' . $this->getUnsubscribeUrl($newsletter) . '">Unsubscribe</a></p>';
        $html .= '</div></body></html>';
        
        return $html;
    }
    
    private function getTrackingPixel(Newsletter $newsletter): string
    {
        $url = route('newsletter.track.open', ['uuid' => $newsletter->uuid]);
        return '<img src="' . $url . '" width="1" height="1" alt="" style="display:none;" />';
    }
    
    private function getUnsubscribeUrl(Newsletter $newsletter): string
    {
        return route('newsletter.unsubscribe', [
            'community' => $newsletter->community_id,
            'token' => '{{unsubscribe_token}}', // Replaced per-recipient
        ]);
    }
    
    private function getWebViewUrl(Newsletter $newsletter): string
    {
        return route('newsletter.view', ['uuid' => $newsletter->uuid]);
    }
}



