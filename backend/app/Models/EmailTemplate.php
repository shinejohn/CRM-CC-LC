<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use HasFactory, HasUuids;

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

        return [
            'subject' => $subject,
            'html' => $htmlContent,
            'text' => $textContent,
        ];
    }
}
