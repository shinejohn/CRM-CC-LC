<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInteractionRequest extends FormRequest
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
            'customer_id' => 'required|uuid|exists:customers,id',
            'type' => 'required|string|max:50',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
            'due_at' => 'nullable|date',
            'status' => 'nullable|in:pending,in_progress,completed,cancelled,skipped',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'template_id' => 'nullable|uuid|exists:interaction_templates,id',
            'campaign_id' => 'nullable|string',
            'conversation_id' => 'nullable|uuid|exists:conversations,id',
            'entry_point' => 'nullable|in:campaign,manual,auto,workflow',
            'metadata' => 'nullable|array',
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
