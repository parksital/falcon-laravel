<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        $priceTypes = $this->priceTypesForCategory($this->string('category')->toString());
        $priceFeatures = $this->priceFeaturesForCategory($this->string('category')->toString());

        return [
            'name' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', Rule::in(array_keys(config('service_categories')))],
            'custom_category' => ['nullable', 'required_if:category,other', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'pricing_options' => ['sometimes', 'array', 'max:3'],
            'pricing_options.*.name' => ['nullable', 'string', 'max:120'],
            'pricing_options.*.description' => ['nullable', 'string', 'max:2000'],
            'pricing_options.*.price_in_minor' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'pricing_options.*.pricing_type' => ['required', 'string', Rule::in($priceTypes)],
            'pricing_options.*.features' => ['sometimes', 'array'],
            'pricing_options.*.features.*.feature_key' => ['required', 'string', Rule::in($priceFeatures)],
            'pricing_options.*.features.*.is_included' => ['boolean'],
            'pricing_options.*.features.*.value' => ['nullable', 'string', 'max:120'],
            'media' => ['sometimes', 'array', 'max:3'],
            'media.*' => ['image', 'max:4096'],
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
            'pricing_options.max' => __('create-service.validation_package_limit'),
            'pricing_options.*.pricing_type.required' => __('create-service.validation_price_type_required'),
            'pricing_options.*.pricing_type.in' => __('create-service.validation_price_type_invalid'),
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

    private function priceTypesForCategory(string $category): array
    {
        return config("service_categories.{$category}.price_types", []);
    }

    private function priceFeaturesForCategory(string $category): array
    {
        return config("service_categories.{$category}.price_features", []);
    }
}
