<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $customerId = $this->route('id');

        return [
            'name' => 'sometimes|string|max:255',
            'business_name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:100', Rule::unique('customers')->ignore($customerId)],
            'external_id' => 'nullable|string|max:100',
            'owner_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'industry_id' => 'nullable|string|max:50',
            'industry_category' => 'nullable|string',
            'industry_subcategory' => 'nullable|string',
            'sub_category' => 'nullable|string|max:100',
            'business_description' => 'nullable|string',
            'lead_score' => 'nullable|integer|min:0|max:100',
            'lead_source' => 'nullable|string|max:100',
            'subscription_tier' => 'nullable|string|max:50',
        ];
    }

    /**
     * Get the tenant ID from the request.
     */
    public function getTenantId(): ?string
    {
        return $this->header('X-Tenant-ID') ?? $this->input('tenant_id');
    }
}
