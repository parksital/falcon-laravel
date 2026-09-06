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
            'pricing_options.*.pricing_mode' => ['required', 'string', Rule::in(['fixed', 'variable'])],
            'pricing_options.*.pricing_unit' => ['nullable', 'string', Rule::in($this->pricingUnits())],
            'is_public' => ['boolean'],
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

                foreach ($this->input('pricing_options', []) as $index => $pricingOption) {
                    if (($pricingOption['pricing_mode'] ?? null) === 'variable' && blank($pricingOption['pricing_unit'] ?? null)) {
                        $validator->errors()->add("pricing_options.{$index}.pricing_unit", __('create-service.validation_pricing_unit_required'));
                    }
                }
            },
        ];
    }

    private function pricingUnits(): array
    {
        return config('service_pricing_units');
    }
}
