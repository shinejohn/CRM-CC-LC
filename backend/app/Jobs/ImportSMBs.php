<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Models\Community;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImportSMBs implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $filePath,
        public string $tenantId,
        public ?string $communityId = null,
        public array $options = []
    ) {}

    public function handle(): void
    {
        $file = Storage::get($this->filePath);
        $extension = pathinfo($this->filePath, PATHINFO_EXTENSION);

        if ($extension === 'json') {
            $data = json_decode($file, true);
            $this->importFromJson($data);
        } else {
            $this->importFromCsv($file);
        }

        // Clean up file
        Storage::delete($this->filePath);
    }

    private function importFromJson(array $data): void
    {
        foreach ($data as $row) {
            $this->createCustomer($row);
        }
    }

    private function importFromCsv(string $file): void
    {
        $lines = explode("\n", $file);
        $headers = str_getcsv(array_shift($lines));

        foreach ($lines as $line) {
            if (empty(trim($line))) {
                continue;
            }

            $values = str_getcsv($line);
            $row = array_combine($headers, $values);
            $this->createCustomer($row);
        }
    }

    private function createCustomer(array $row): void
    {
        Customer::create([
            'tenant_id' => $this->tenantId,
            'community_id' => $this->communityId,
            'business_name' => $row['business_name'] ?? '',
            'email' => $row['email'] ?? null,
            'phone' => $row['phone'] ?? null,
            'address_line1' => $row['address'] ?? null,
            'city' => $row['city'] ?? null,
            'state' => $row['state'] ?? null,
            'zip' => $row['zip'] ?? null,
            'industry_category' => $row['industry'] ?? null,
            'engagement_tier' => 4,
            'engagement_score' => 0,
            'campaign_status' => 'draft',
        ]);
    }
}
