<?php

namespace App\Models;

use App\Enums\PoolType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailPool extends Model
{
    use HasUuids;

    protected $fillable = [
        'pool_type',
        'provider',
        'host',
        'port',
        'api_url',
        'api_key',
        'username',
        'password',
    ];

    protected function casts(): array
    {
        return [
            'pool_type' => PoolType::class,
            'port' => 'integer',
        ];
    }

    public function messages(): HasMany
    {
        return $this->hasMany(EmailMessage::class);
    }
}
