<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmsTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'message',
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
    public function render(array $variables): string
    {
        $message = $this->message;

        foreach ($variables as $key => $value) {
            $placeholder = "{{{$key}}}";
            $message = str_replace($placeholder, $value, $message);
        }

        return $message;
    }
}
