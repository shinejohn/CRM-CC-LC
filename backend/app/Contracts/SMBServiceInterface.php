<?php

namespace App\Contracts;

use App\Models\Customer;
use Illuminate\Contracts\Pagination\Paginator;

interface SMBServiceInterface
{
    public function list(array $filters = [], int $perPage = 20): Paginator;
    public function find(string $id): ?Customer;
    public function findBySlug(string $slug): ?Customer;
    public function create(array $data): Customer;
    public function update(Customer $customer, array $data): Customer;
    public function delete(Customer $customer): bool;
    public function calculateEngagementScore(Customer $customer): int;
    public function updateTier(Customer $customer, int $newTier): void;
    public function startCampaign(Customer $customer): void;
    public function pauseCampaign(Customer $customer, string $reason): void;
    public function resumeCampaign(Customer $customer): void;
}
