<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreKnowledgeRequest extends FormRequest
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
            'title' => 'required|string',
            'content' => 'required|string',
            'category' => 'nullable|string',
            'subcategory' => 'nullable|string',
            'industry_codes' => 'nullable|array',
            'source' => 'nullable|in:google,serpapi,website,owner',
            'source_url' => 'nullable|url',
        ];
    }
}
