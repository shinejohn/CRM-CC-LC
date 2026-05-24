<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class AiTaskStarted implements ShouldBroadcast
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public readonly string $userId,
        public readonly string $taskId,
        public readonly string $taskTitle,
        public readonly string $actionName,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("cc.user.{$this->userId}.ai-tasks")];
    }

    public function broadcastAs(): string
    {
        return 'ai.task.started';
    }

    public function broadcastWith(): array
    {
        return [
            'task_id'     => $this->taskId,
            'title'       => $this->taskTitle,
            'action'      => $this->actionName,
            'status'      => 'pending',
            'timestamp'   => now()->toIso8601String(),
        ];
    }
}
