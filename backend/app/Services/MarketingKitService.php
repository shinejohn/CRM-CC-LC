<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\MarketingKitAsset;
use App\Models\SMB;
use Illuminate\Support\Facades\Log;

final class MarketingKitService
{
    public function __construct(
        private PublishingPlatformService $publishingPlatform
    ) {}

    /**
     * Get full marketing profile data for an SMB.
     */
    public function getMarketingProfile(SMB $smb): array
    {
        $community = $smb->community;

        return [
            'business' => [
                'name' => $smb->business_name,
                'dba' => $smb->dba_name,
                'category' => $smb->category,
                'contact' => $smb->primary_contact_name,
                'phone' => $smb->primary_phone,
                'email' => $smb->primary_email,
                'address' => $smb->address,
                'city' => $smb->city,
                'state' => $smb->state,
                'zip' => $smb->zip,
                'hours' => $smb->metadata['hours'] ?? null,
                'website' => $smb->metadata['website'] ?? null,
            ],
            'community' => $community ? [
                'name' => $community->name,
                'slug' => $community->slug,
                'state' => $community->state,
            ] : null,
            'alphasite_url' => $this->getAlphasiteUrl($smb),
            'current_promo' => $smb->metadata['current_promo'] ?? null,
            'assets_count' => $smb->marketingKitAssets()->where('is_active', true)->count(),
        ];
    }

    /**
     * Save a marketing kit asset.
     */
    public function saveAsset(SMB $smb, string $type, array $config, ?string $html = null, ?string $svg = null): MarketingKitAsset
    {
        return MarketingKitAsset::create([
            'smb_id' => $smb->id,
            'asset_type' => $type,
            'title' => $config['title'] ?? ucfirst(str_replace('_', ' ', $type)),
            'platform' => $config['platform'] ?? null,
            'config' => $config,
            'generated_html' => $html,
            'generated_svg' => $svg,
            'is_active' => true,
        ]);
    }

    /**
     * Generate embed code snippet for a widget asset.
     */
    public function generateEmbedCode(MarketingKitAsset $asset): string
    {
        $baseUrl = config('app.url');
        $assetId = $asset->id;

        $embedCode = "<script src=\"{$baseUrl}/api/v1/embed/widget/{$assetId}.js\" async></script>";

        $asset->update(['embed_code' => $embedCode, 'published_at' => now()]);

        return $embedCode;
    }

    /**
     * Generate email-client-compatible HTML signature.
     */
    public function generateEmailSignatureHTML(array $businessData): string
    {
        $name = htmlspecialchars($businessData['name'] ?? '', ENT_QUOTES, 'UTF-8');
        $phone = htmlspecialchars($businessData['phone'] ?? '', ENT_QUOTES, 'UTF-8');
        $email = htmlspecialchars($businessData['email'] ?? '', ENT_QUOTES, 'UTF-8');
        $website = htmlspecialchars($businessData['website'] ?? '', ENT_QUOTES, 'UTF-8');
        $address = htmlspecialchars($businessData['address'] ?? '', ENT_QUOTES, 'UTF-8');
        $city = htmlspecialchars($businessData['city'] ?? '', ENT_QUOTES, 'UTF-8');
        $state = htmlspecialchars($businessData['state'] ?? '', ENT_QUOTES, 'UTF-8');
        $zip = htmlspecialchars($businessData['zip'] ?? '', ENT_QUOTES, 'UTF-8');
        $contact = htmlspecialchars($businessData['contact_name'] ?? '', ENT_QUOTES, 'UTF-8');
        $contactTitle = htmlspecialchars($businessData['contact_title'] ?? '', ENT_QUOTES, 'UTF-8');
        $alphasiteUrl = htmlspecialchars($businessData['alphasite_url'] ?? '', ENT_QUOTES, 'UTF-8');
        $accentColor = $businessData['accent_color'] ?? '#2563eb';

        $locationLine = trim("{$address} {$city}, {$state} {$zip}");

        return <<<HTML
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333333;max-width:600px;">
  <tr>
    <td style="padding:0 0 8px 0;border-bottom:3px solid {$accentColor};">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right:16px;vertical-align:top;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr><td style="font-size:18px;font-weight:bold;color:#111111;padding-bottom:2px;">{$name}</td></tr>
              {$this->signatureContactRow($contact, $contactTitle)}
              <tr><td style="font-size:12px;color:#666666;padding-top:6px;">{$locationLine}</td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-top:8px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          {$this->signatureLink($phone, "tel:{$phone}", $accentColor)}
          {$this->signatureLink($email, "mailto:{$email}", $accentColor)}
          {$this->signatureLink($website, $website, $accentColor)}
        </tr>
      </table>
    </td>
  </tr>
  {$this->signatureAlphasiteRow($alphasiteUrl, $accentColor)}
</table>
HTML;
    }

    private function signatureContactRow(string $contact, string $title): string
    {
        if ($contact === '') {
            return '';
        }
        $line = $contact;
        if ($title !== '') {
            $line .= " &mdash; {$title}";
        }
        return "<tr><td style=\"font-size:13px;color:#444444;\">{$line}</td></tr>";
    }

    private function signatureLink(string $text, string $href, string $color): string
    {
        if ($text === '') {
            return '';
        }
        return "<td style=\"padding-right:16px;\"><a href=\"{$href}\" style=\"color:{$color};text-decoration:none;font-size:12px;\">{$text}</a></td>";
    }

    private function signatureAlphasiteRow(string $url, string $color): string
    {
        if ($url === '') {
            return '';
        }
        return <<<HTML
<tr>
  <td style="padding-top:10px;">
    <a href="{$url}" style="display:inline-block;padding:6px 16px;background-color:{$color};color:#ffffff;text-decoration:none;font-size:12px;font-weight:bold;border-radius:4px;">Visit Our Page</a>
  </td>
</tr>
HTML;
    }

    private function getAlphasiteUrl(SMB $smb): ?string
    {
        $community = $smb->community;
        if (!$community) {
            return null;
        }

        $slug = strtolower(str_replace(' ', '-', $smb->business_name));
        return "https://day.news/{$community->slug}/business/{$slug}";
    }
}
