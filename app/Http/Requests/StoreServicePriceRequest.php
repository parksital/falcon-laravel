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
        return [
            'name' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'pricing_mode' => ['required', 'string', Rule::in(['fixed', 'variable'])],
            'pricing_unit' => ['nullable', 'string', Rule::in($this->pricingUnits())],
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
                if ($this->input('pricing_mode') === 'variable' && blank($this->input('pricing_unit'))) {
                    $validator->errors()->add('pricing_unit', __('service-details.validation_pricing_unit_required'));
                }
            },
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
            'pricing_mode.required' => __('service-details.validation_pricing_mode_required'),
            'pricing_mode.in' => __('service-details.validation_pricing_mode_invalid'),
            'pricing_unit.in' => __('service-details.validation_pricing_unit_invalid'),
        ];
    }

    private function pricingUnits(): array
    {
        return config('service_pricing_units');
    }
}
