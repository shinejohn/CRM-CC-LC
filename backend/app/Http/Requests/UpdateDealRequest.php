<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDealRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contact_id' => 'nullable|uuid|exists:crm_contacts,id',
            'name' => 'sometimes|string|max:255',
            'value' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'expected_close_at' => 'nullable|date',
        ];
    }

    public function getTenantId(): ?string
    {
        return $this->header('X-Tenant-ID') ?? $this->input('tenant_id');
    }
}
