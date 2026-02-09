<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\Customer;
use Fibonacco\AiToolsCore\Tools\BaseTool;

class CustomerUpdateTool extends BaseTool
{
    protected string $toolCategory = 'domain';
    protected bool $authRequired = true;

    public function name(): string
    {
        return 'update_customer_data';
    }

    public function description(): string
    {
        return 'Update customer business information when new details are discovered.';
    }

    public function parameters(): array
    {
        return [
            'tenant_id' => [
                'type' => 'string',
                'description' => 'The tenant UUID',
                'required' => true,
            ],
            'customer_id' => [
                'type' => 'string',
                'description' => 'The customer UUID',
                'required' => true,
            ],
            'data' => [
                'type' => 'array',
                'description' => 'Key-value pairs of data to update (business_name, industry, size, etc)',
                'required' => true,
            ],
        ];
    }

    public function execute(array $params): array
    {
        $customer = Customer::where('tenant_id', $params['tenant_id'])
            ->where('id', $params['customer_id'])
            ->first();

        if (!$customer) {
            return ['error' => true, 'message' => 'Customer not found'];
        }

        $allowedFields = [
            'business_name',
            'owner_name',
            'industry_category',
            'industry_subcategory',
            'business_description',
            'products_services',
            'target_audience',
            'business_hours',
            'service_area',
            'brand_voice',
            'contact_preferences',
            'lead_score'
        ];

        $data = array_intersect_key($params['data'], array_flip($allowedFields));

        $customer->update($data);

        return [
            'success' => true,
            'message' => 'Customer updated successfully',
            'updated_fields' => array_keys($data),
        ];
    }
}
