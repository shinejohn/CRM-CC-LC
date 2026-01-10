<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContentTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'type',
        'description',
        'prompt_template',
        'variables',
        'structure',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'variables' => 'array',
            'structure' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Render template with variables
     */
    public function renderPrompt(array $variables): string
    {
        $prompt = $this->prompt_template;

        foreach ($variables as $key => $value) {
            $placeholder = "{{{$key}}}";
            $prompt = str_replace($placeholder, $value, $prompt);
        }

        return $prompt;
    }
}
