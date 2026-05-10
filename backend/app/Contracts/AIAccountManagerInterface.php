<?php

namespace App\Contracts;

use App\Models\Customer;

interface AIAccountManagerInterface
{
    public function generateResponse(string $systemContext, string $userInput, array $history = []): string;

    public function suggestNextTask(Customer $customer): ?array;
    public function generateTaskContent(string $customerId, string $taskType): array;
    public function executeTask(string $taskId): void;

    public function generateProactiveOutreach(string $customerId, string $outreachType): array;
    public function personalizeRVMScript(string $customerId, string $baseScript): string;

    public function analyzeEngagement(string $customerId): array;
    public function recommendUpsells(string $customerId): array;
}

