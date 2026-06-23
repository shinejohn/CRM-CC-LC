<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

/**
 * UUID-keyed Sanctum personal access token (the personal_access_tokens table
 * uses a uuid primary key, matching this app's UUID convention).
 */
final class PersonalAccessToken extends SanctumPersonalAccessToken
{
    use HasUuids;
}
