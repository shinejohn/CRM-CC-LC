<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'required|uuid|exists:customers,id',
            'deal_id' => 'nullable|uuid|exists:deals,id',
            'contact_id' => 'nullable|uuid|exists:crm_contacts,id',
            'type' => 'required|string|in:call,meeting,email,task',
            'subject' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
            'status' => 'nullable|in:pending,completed,cancelled',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'reminder_at' => 'nullable|date',
        ];
    }

    public function getTenantId(): ?string
    {
        return $this->header('X-Tenant-ID') ?? $this->input('tenant_id');
    }
}
