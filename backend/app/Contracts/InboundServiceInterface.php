<?php

namespace App\Contracts;

interface InboundServiceInterface
{
    public function parseInboundEmail(array $rawEmail): array;
    public function classifyEmailIntent(string $body): string;
    public function generateEmailResponse(int $smbId, string $intent, string $body): string;
    public function sendEmailResponse(int $smbId, string $response, string $inReplyTo): void;

    public function handleCallback(array $callData): void;
    public function transcribeCall(string $audioUrl): string;
    public function generateCallSummary(string $transcript): string;

    public function handleChatMessage(string $sessionId, ?int $smbId, string $message): string;
}



