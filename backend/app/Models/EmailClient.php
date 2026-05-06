<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class EmailClient extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'api_token_hash',
        'rate_limits',
    ];

    protected function casts(): array
    {
        return [
            'rate_limits' => 'array',
        ];
    }

    public function senders(): HasMany
    {
        return $this->hasMany(EmailSender::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(EmailMessage::class);
    }
}
