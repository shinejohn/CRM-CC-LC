<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConversationRequest extends FormRequest
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
            'customer_id' => 'nullable|exists:customers,id',
            'session_id' => 'nullable|string|max:100',
            'entry_point' => 'nullable|string|max:100',
            'template_id' => 'nullable|string|max:50',
            'slide_at_start' => 'nullable|integer',
            'presenter_id' => 'nullable|string|max:50',
            'user_agent' => 'nullable|string',
            'ip_address' => 'nullable|ip',
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
