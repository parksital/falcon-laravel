<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', Rule::in(array_keys(config('service_categories')))],
            'custom_category' => ['nullable', 'required_if:category,other', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'pricing_options' => ['sometimes', 'array', 'min:1', 'max:1'],
            'pricing_options.*.id' => ['nullable', 'integer', 'distinct'],
            'pricing_options.*.name' => ['nullable', 'string', 'max:120'],
            'pricing_options.*.description' => ['nullable', 'string', 'max:2000'],
            'pricing_options.*.price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'pricing_options.*.unit' => [
                'required',
                'string',
                Rule::in($this->pricingStructuresForCategory($this->string('category')->toString())),
            ],
            'is_public' => ['boolean'],
        ];
    }

    private function pricingStructuresForCategory(string $category): array
    {
        return config("service_categories.{$category}.pricing_structures", []);
    }
}
