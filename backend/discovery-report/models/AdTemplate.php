<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'platform',
        'ad_type',
        'description',
        'structure',
        'prompt_template',
        'variables',
        'specs',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'structure' => 'array',
            'variables' => 'array',
            'specs' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Render template with variables
     */
    public function renderPrompt(array $variables): string
    {
        if (!$this->prompt_template) {
            return '';
        }

        $prompt = $this->prompt_template;

        foreach ($variables as $key => $value) {
            $placeholder = "{{{$key}}}";
            $prompt = str_replace($placeholder, $value, $prompt);
        }

        return $prompt;
    }
}
