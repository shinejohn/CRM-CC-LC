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
