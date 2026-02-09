<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Newsletter\Newsletter;
use App\Models\Newsletter\NewsletterContentItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NewsletterTrackingController extends Controller
{
    /**
     * Track newsletter open (pixel)
     */
    public function open(string $uuid): \Illuminate\Http\Response
    {
        $newsletter = Newsletter::where('uuid', $uuid)->first();

        if ($newsletter) {
            DB::transaction(function () use ($newsletter) {
                $newsletter->increment('open_count');
                $newsletter->increment('unique_open_count');
            });
        }

        // Return 1x1 transparent pixel
        $pixel = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        
        return response($pixel, 200)
            ->header('Content-Type', 'image/gif')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }

    /**
     * Track newsletter click
     */
    public function click(string $uuid, int $itemId): \Illuminate\Http\RedirectResponse
    {
        $newsletter = Newsletter::where('uuid', $uuid)->first();
        $item = NewsletterContentItem::find($itemId);

        if ($newsletter && $item && $item->newsletter_id === $newsletter->id) {
            DB::transaction(function () use ($newsletter, $item) {
                $newsletter->increment('click_count');
                $newsletter->increment('unique_click_count');
                $item->increment('click_count');

                // If it's a sponsor item, record sponsor click
                if ($item->content_type === 'sponsor' && $item->content_id) {
                    app(\App\Services\Newsletter\SponsorService::class)
                        ->recordClick($item->content_id);
                }
            });
        }

        $url = $item->link_url ?? '/';
        
        return redirect($url);
    }
}



