<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class EmailTemplate extends Model
{
    use \App\Traits\HasTenantScope, HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'subject',
        'html_content',
        'text_content',
        'variables',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'variables' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Replace template variables with actual values
     */
    public function render(array $variables): array
    {
        $subject = $this->subject;
        $htmlContent = $this->html_content;
        $textContent = $this->text_content;

        foreach ($variables as $key => $value) {
            $placeholder = "{{{$key}}}";
            $subject = str_replace($placeholder, $value, $subject);
            $htmlContent = str_replace($placeholder, $value, $htmlContent);
            if ($textContent) {
                $textContent = str_replace($placeholder, $value, $textContent);
            }
        }

        // Append unsubscribe footer if not already present and variable is available
        if (! str_contains($htmlContent, 'unsubscribe') && isset($variables['unsubscribe_url'])) {
            $htmlContent .= '<p style="margin-top:24px;font-size:12px;color:#999;text-align:center;">You are receiving this because your business is listed in your community\'s Day.News directory. <a href="' . $variables['unsubscribe_url'] . '" style="color:#999;">Unsubscribe</a></p>';
            if ($textContent) {
                $textContent .= "\n\n---\nUnsubscribe: " . $variables['unsubscribe_url'];
            }
        }

        return [
            'subject' => $subject,
            'html' => $htmlContent,
            'text' => $textContent,
        ];
    }
}
