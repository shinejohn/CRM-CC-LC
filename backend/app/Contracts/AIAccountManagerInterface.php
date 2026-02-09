<?php

namespace App\Contracts;

use App\Models\Customer;

interface AIAccountManagerInterface
{
    public function generateResponse(string $systemContext, string $userInput, array $history = []): string;

    public function suggestNextTask(Customer $customer): ?array;
    public function generateTaskContent(int $customerId, string $taskType): array;
    public function executeTask(int $taskId): void;

    public function generateProactiveOutreach(int $customerId, string $outreachType): array;
    public function personalizeRVMScript(int $customerId, string $baseScript): string;

    public function analyzeEngagement(int $customerId): array;
    public function recommendUpsells(int $customerId): array;
}

