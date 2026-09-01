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
            'pricing_type' => [
                'required',
                'string',
                Rule::in(['package']),
            ],
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
            'pricing_type.in' => __('service-details.validation_price_type_invalid'),
        ];
    }
}
