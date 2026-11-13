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
            'description' => ['nullable', 'string', 'max:2000'],
            'pricing_options' => ['sometimes', 'array', 'min:1', 'max:3'],
            'pricing_options.*.id' => ['nullable', 'integer', 'distinct'],
            'pricing_options.*.name' => ['nullable', 'string', 'max:120'],
            'pricing_options.*.description' => ['nullable', 'string', 'max:2000'],
            'pricing_options.*.price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'pricing_options.*.pricing_unit' => ['required', 'string', Rule::in($this->pricingUnits())],
            'pricing_options.*.add_ons' => ['sometimes', 'array', 'max:3'],
            'pricing_options.*.add_ons.*.name' => ['required', 'string', 'max:120'],
            'pricing_options.*.add_ons.*.description' => ['nullable', 'string', 'max:2000'],
            'pricing_options.*.add_ons.*.price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'pricing_options.*.add_ons.*.pricing_unit' => ['required', 'string', Rule::in($this->pricingUnits())],
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
            'pricing_options.*.add_ons.max' => __('service-details.validation_add_on_limit'),
            'pricing_options.*.add_ons.*.name.required' => __('service-details.validation_add_on_name_required'),
            'pricing_options.*.add_ons.*.price_in_minor.required' => __('service-details.validation_price_required'),
            'pricing_options.*.add_ons.*.price_in_minor.integer' => __('service-details.validation_price_invalid'),
            'pricing_options.*.add_ons.*.price_in_minor.min' => __('service-details.validation_price_invalid'),
            'pricing_options.*.add_ons.*.price_in_minor.max' => __('service-details.validation_price_invalid'),
            'pricing_options.*.add_ons.*.pricing_unit.required' => __('service-details.validation_pricing_unit_required'),
            'pricing_options.*.add_ons.*.pricing_unit.in' => __('service-details.validation_pricing_unit_invalid'),
        ];
    }

    /**
     * Get the after validation callables for the request.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function ($validator) {
                if ($this->route('service')?->is_public && $this->has('is_public') && $this->boolean('is_public') === false) {
                    $validator->errors()->add('is_public', __('service-details.validation_service_status_fixed'));
                }
            },
        ];
    }

    private function pricingUnits(): array
    {
        return config('service_pricing_units');
    }
}
