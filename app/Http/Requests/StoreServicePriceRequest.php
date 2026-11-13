<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreServicePriceRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $priceFeatures = $this->priceFeaturesForService();

        return [
            'name' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'pricing_unit' => ['required', 'string', Rule::in($this->pricingUnits())],
            'features' => ['sometimes', 'array'],
            'features.*.feature_key' => ['required', 'string', Rule::in($priceFeatures)],
            'features.*.is_included' => ['boolean'],
            'features.*.value' => ['nullable', 'string', 'max:120'],
            'add_ons' => ['sometimes', 'array', 'max:3'],
            'add_ons.*.name' => ['required', 'string', 'max:120'],
            'add_ons.*.description' => ['nullable', 'string', 'max:2000'],
            'add_ons.*.price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'add_ons.*.pricing_unit' => ['required', 'string', Rule::in($this->pricingUnits())],
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
            'name.required' => __('service-details.validation_price_name_required'),
            'price_in_minor.required' => __('service-details.validation_price_required'),
            'price_in_minor.integer' => __('service-details.validation_price_invalid'),
            'price_in_minor.min' => __('service-details.validation_price_invalid'),
            'price_in_minor.max' => __('service-details.validation_price_invalid'),
            'pricing_unit.required' => __('service-details.validation_pricing_unit_required'),
            'pricing_unit.in' => __('service-details.validation_pricing_unit_invalid'),
            'features.*.feature_key.in' => __('service-details.validation_price_feature_invalid'),
            'add_ons.max' => __('service-details.validation_add_on_limit'),
            'add_ons.*.name.required' => __('service-details.validation_add_on_name_required'),
            'add_ons.*.price_in_minor.required' => __('service-details.validation_price_required'),
            'add_ons.*.price_in_minor.integer' => __('service-details.validation_price_invalid'),
            'add_ons.*.price_in_minor.min' => __('service-details.validation_price_invalid'),
            'add_ons.*.price_in_minor.max' => __('service-details.validation_price_invalid'),
            'add_ons.*.pricing_unit.required' => __('service-details.validation_pricing_unit_required'),
            'add_ons.*.pricing_unit.in' => __('service-details.validation_pricing_unit_invalid'),
        ];
    }

    private function pricingUnits(): array
    {
        return config('service_pricing_units');
    }

    private function priceFeaturesForService(): array
    {
        return config("service_categories.{$this->route('service')->category}.price_features", []);
    }
}
