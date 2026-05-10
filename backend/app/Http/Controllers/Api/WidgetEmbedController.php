<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MarketingKitAsset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

final class WidgetEmbedController extends Controller
{
    public function widgetJs(string $assetId): Response
    {
        $asset = MarketingKitAsset::with('smb.community')->find($assetId);

        if (!$asset || !$asset->is_active) {
            return response('/* Widget not found */', 404)
                ->header('Content-Type', 'application/javascript');
        }

        $dataUrl = config('app.url') . "/api/v1/embed/data/{$assetId}";

        $js = <<<JS
(function(){
  var container = document.createElement('div');
  container.id = 'fbc-widget-{$assetId}';
  var shadow = container.attachShadow({mode:'closed'});

  var style = document.createElement('style');
  style.textContent = `
    .fbc-widget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #fff; }
    .fbc-header { padding: 16px; background: linear-gradient(135deg, #1e40af, #3b82f6); color: #fff; }
    .fbc-header h3 { margin: 0 0 4px; font-size: 16px; font-weight: 600; }
    .fbc-header p { margin: 0; font-size: 12px; opacity: 0.9; }
    .fbc-tabs { display: flex; border-bottom: 1px solid #e5e7eb; }
    .fbc-tab { flex: 1; padding: 10px; text-align: center; font-size: 13px; cursor: pointer; border: none; background: none; color: #6b7280; }
    .fbc-tab.active { color: #2563eb; border-bottom: 2px solid #2563eb; font-weight: 600; }
    .fbc-content { padding: 16px; min-height: 120px; }
    .fbc-item { padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #374151; }
    .fbc-footer { padding: 12px 16px; background: #f9fafb; text-align: center; }
    .fbc-footer a { color: #2563eb; text-decoration: none; font-size: 12px; font-weight: 500; }
  `;
  shadow.appendChild(style);

  var widget = document.createElement('div');
  widget.className = 'fbc-widget';
  widget.innerHTML = '<div class="fbc-header"><h3>Loading...</h3></div>';
  shadow.appendChild(widget);

  fetch('{$dataUrl}')
    .then(function(r){return r.json()})
    .then(function(data){
      widget.innerHTML = '<div class="fbc-header"><h3>'+data.business_name+'</h3><p>'+data.community_name+'</p></div>'
        + '<div class="fbc-tabs"><button class="fbc-tab active">Community</button><button class="fbc-tab">Promos</button><button class="fbc-tab">Reviews</button></div>'
        + '<div class="fbc-content"><div class="fbc-item">'+(data.promo||'Check back for updates!')+'</div></div>'
        + '<div class="fbc-footer"><a href="'+(data.alphasite_url||'#')+'">Visit Our Page &rarr;</a></div>';
    })
    .catch(function(){
      widget.innerHTML = '<div class="fbc-content" style="text-align:center;color:#999;padding:24px;">Widget unavailable</div>';
    });

  var scripts = document.getElementsByTagName('script');
  var currentScript = scripts[scripts.length-1];
  currentScript.parentNode.insertBefore(container, currentScript);
})();
JS;

        return response($js, 200)
            ->header('Content-Type', 'application/javascript')
            ->header('Cache-Control', 'public, max-age=300');
    }

    public function widgetData(string $assetId): JsonResponse
    {
        $asset = MarketingKitAsset::with('smb.community')->find($assetId);

        if (!$asset || !$asset->is_active) {
            return response()->json(['error' => 'Widget not found'], 404);
        }

        $smb = $asset->smb;
        $community = $smb?->community;

        return response()->json([
            'business_name' => $smb?->business_name ?? 'Business',
            'community_name' => $community?->name ?? '',
            'promo' => $smb?->metadata['current_promo'] ?? null,
            'alphasite_url' => $community
                ? 'https://day.news/' . $community->slug . '/business/' . strtolower(str_replace(' ', '-', $smb?->business_name ?? ''))
                : null,
            'config' => $asset->config,
        ]);
    }
}
