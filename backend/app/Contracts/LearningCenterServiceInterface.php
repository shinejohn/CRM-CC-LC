<?php

namespace App\Contracts;

use App\Models\Content;
use App\Models\Customer;

interface LearningCenterServiceInterface
{
    public function getContent(string $slug): ?Content;
    public function getContentByCampaign(string $campaignId): ?Content;

    public function personalize(Content $content, Customer $customer): array;

    public function trackViewStart(int $smbId, string $slug, array $context): int;
    public function trackSlideView(int $viewId, int $slideNumber): void;
    public function trackViewComplete(int $viewId): void;
    public function trackApprovalClick(int $viewId): void;
    public function trackDownload(int $viewId): void;
}

