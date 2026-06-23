<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOutboundCampaignRequest extends FormRequest
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
        return [
            'name' => 'required|string|max:255',
            'type' => 'required|in:email,phone,sms',
            'message' => 'required|string',
            'subject' => 'required_if:type,email|string|max:255',
            'template_id' => 'nullable|uuid',
            'template_variables' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
            'recipient_segments' => 'nullable|array',
            // A/B testing (all optional — additive)
            'ab_test_enabled' => 'nullable|boolean',
            'ab_winner_metric' => 'nullable|in:open_rate,click_rate',
            'ab_test_size' => 'nullable|integer|min:1|max:100',
            'variants' => 'nullable|array|min:2',
            'variants.*.label' => 'nullable|string|max:32',
            'variants.*.subject' => 'nullable|string|max:255',
            'variants.*.message' => 'nullable|string',
            'variants.*.template_id' => 'nullable|uuid',
            'variants.*.weight' => 'nullable|integer|min:0|max:100',
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
