<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreServiceRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $pricingStructure = $this->string('pricing_structure')->toString();

        return [
            'name' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', Rule::in(config('service_categories'))],
            'custom_category' => ['nullable', 'required_if:category,other', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'pricing_structure' => [
                'required',
                'string',
                Rule::in($this->pricingStructuresForCategory($this->string('category')->toString())),
            ],
            'pricing_options' => ['required', 'array', 'min:1', 'max:'.($pricingStructure === 'package' ? 3 : 1)],
            'pricing_options.*.name' => ['nullable', 'required_if:pricing_structure,package', 'string', 'max:120'],
            'pricing_options.*.description' => ['nullable', 'string', 'max:2000'],
            'pricing_options.*.price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'pricing_options.*.unit' => ['required', 'string', Rule::in([$pricingStructure])],
            'is_public' => ['boolean'],
        ];
    }

    /**
     * Get the validation messages that apply to the request.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => __('create-service.validation_name_required'),
            'category.required' => __('create-service.validation_category_required'),
            'category.in' => __('create-service.validation_category_required'),
            'custom_category.required_if' => __('create-service.validation_custom_category_required'),
            'pricing_structure.required' => __('create-service.validation_pricing_structure_required'),
            'pricing_structure.in' => __('create-service.validation_pricing_structure_invalid'),
            'pricing_options.max' => __('create-service.validation_package_limit'),
            'pricing_options.*.name.required_if' => __('create-service.validation_package_name_required'),
            'pricing_options.*.price_in_minor.required' => __('create-service.validation_price_required'),
            'pricing_options.*.price_in_minor.integer' => __('create-service.validation_price_invalid'),
            'pricing_options.*.price_in_minor.min' => __('create-service.validation_price_invalid'),
            'pricing_options.*.price_in_minor.max' => __('create-service.validation_price_invalid'),
        ];
    }

    private function pricingStructuresForCategory(string $category): array
    {
        return config("service_pricing_structures.{$category}", config('service_pricing_structures.default'));
    }
}
