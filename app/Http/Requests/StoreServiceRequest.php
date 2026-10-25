<?php

namespace App\Http\Requests;

use App\Actions\CreateService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (! $this->has('pricing_options')) {
            return;
        }

        $pricingOptions = collect($this->input('pricing_options', []))
            ->filter(fn ($pricingOption) => is_array($pricingOption) && (
                filled($pricingOption['name'] ?? null)
                || filled($pricingOption['description'] ?? null)
                || filled($pricingOption['price_in_minor'] ?? null)
                || filled($pricingOption['pricing_mode'] ?? null)
                || filled($pricingOption['pricing_unit'] ?? null)
                || ! empty($pricingOption['features'] ?? [])
            ))
            ->values()
            ->all();

        $this->merge([
            'pricing_options' => $pricingOptions,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...CreateService::rules($this->string('category')->toString()),
            'media' => ['sometimes', 'array', 'max:3'],
            'media.*' => ['image', 'max:4096'],
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
            'pricing_options.max' => __('create-service.validation_price_limit'),
            'pricing_options.*.pricing_mode.required' => __('create-service.validation_pricing_mode_required'),
            'pricing_options.*.pricing_mode.in' => __('create-service.validation_pricing_mode_invalid'),
            'pricing_options.*.pricing_unit.required_if' => __('create-service.validation_pricing_unit_required'),
            'pricing_options.*.pricing_unit.in' => __('create-service.validation_pricing_unit_invalid'),
            'pricing_options.*.features.*.feature_key.in' => __('create-service.validation_price_feature_invalid'),
            'pricing_options.*.price_in_minor.required' => __('create-service.validation_price_required'),
            'pricing_options.*.price_in_minor.integer' => __('create-service.validation_price_invalid'),
            'pricing_options.*.price_in_minor.min' => __('create-service.validation_price_invalid'),
            'pricing_options.*.price_in_minor.max' => __('create-service.validation_price_invalid'),
            'media.max' => __('create-service.validation_media_limit'),
            'media.*.image' => __('create-service.validation_media_image'),
            'media.*.max' => __('create-service.validation_media_size'),
        ];
    }
}
