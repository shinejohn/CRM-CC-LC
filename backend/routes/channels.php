<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

// AI task status channel — private per user
// Channel: private-cc.user.{userId}.ai-tasks
Broadcast::channel('cc.user.{userId}.ai-tasks', function (object $user, string $userId): bool {
    return (string) $user->id === $userId;
});
