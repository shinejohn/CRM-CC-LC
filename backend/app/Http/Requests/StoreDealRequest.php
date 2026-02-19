<?php

namespace App\Http\Requests;

use App\Enums\DealStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDealRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'required|uuid|exists:customers,id',
            'contact_id' => 'nullable|uuid|exists:crm_contacts,id',
            'name' => 'required|string|max:255',
            'value' => 'nullable|numeric|min:0',
            'stage' => ['nullable', Rule::in(array_map(fn ($s) => $s->value, DealStage::cases()))],
            'notes' => 'nullable|string',
            'expected_close_at' => 'nullable|date',
        ];
    }

    public function getTenantId(): ?string
    {
        return $this->header('X-Tenant-ID') ?? $this->input('tenant_id');
    }
}
