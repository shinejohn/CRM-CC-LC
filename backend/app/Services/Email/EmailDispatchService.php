<?php

declare(strict_types=1);

namespace App\Services\Email;

use App\Enums\EmailClass;
use App\Enums\EmailStatus;
use App\Enums\PoolType;
use App\Jobs\DispatchEmailJob;
use App\Models\EmailClient;
use App\Models\EmailMessage;
use App\Models\EmailPool;
use App\Models\EmailSender;
use Exception;

final class EmailDispatchService
{
    private SuppressionService $suppressor;

    public function __construct(SuppressionService $suppressor)
    {
        $this->suppressor = $suppressor;
    }

    /**
     * The 8-step pipeline to dispatch an email.
     */
    public function dispatch(EmailClient $client, array $data): array
    {
        $toAddress = $data['to'];

        // Step 1: Check suppression
        if ($this->suppressor->isSuppressed($toAddress, $client)) {
            return ['status' => 'suppressed', 'message' => 'Email is suppressed.'];
        }

        // Step 2: Validate sender
        $sender = EmailSender::where('email_address', $data['from'])->first();
        if (! $sender || $sender->email_client_id !== $client->id) {
            // Alternatively fallback to a default client sender if allowed, but strict rules say reject
            throw new Exception('Unauthorized or missing sender address.');
        }

        // Step 3: Determine class and pool
        $emailClass = EmailClass::tryFrom($data['class'] ?? 'transactional') ?? EmailClass::Transactional;
        $poolType = $this->determinePool($emailClass);

        $pool = EmailPool::where('pool_type', $poolType)->first();
        if (! $pool) {
            throw new Exception("No execution pool found for class {$emailClass->value}.");
        }

        // Step 4: Record Message
        $message = EmailMessage::create([
            'email_client_id' => $client->id,
            'email_sender_id' => $sender->id,
            'email_pool_id' => $pool->id,
            'to_address' => $toAddress,
            'subject' => $data['subject'],
            'email_class' => $emailClass,
            'status' => EmailStatus::Pending,
            'payload_log' => [
                'plain_body' => $data['plain_body'] ?? null,
                'html_body' => $data['html_body'] ?? null,
                'metadata' => $data['metadata'] ?? [],
            ],
        ]);

        // Step 5: Dispatch to specific queue
        $queueName = 'email-'.str_replace('_', '-', $emailClass->value);
        DispatchEmailJob::dispatch($message)->onQueue($queueName);

        return [
            'status' => 'queued',
            'message_id' => $message->id,
            'queue' => $queueName,
        ];
    }

    private function determinePool(EmailClass $class): PoolType
    {
        return match ($class) {
            EmailClass::Transactional, EmailClass::Notification, EmailClass::System => PoolType::Transactional,
            EmailClass::Broadcast => PoolType::Broadcast,
            EmailClass::SmbCampaign => PoolType::SmbCampaign,
            default => PoolType::Transactional,
        };
    }
}
