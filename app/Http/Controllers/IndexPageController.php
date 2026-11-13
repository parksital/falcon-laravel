<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Vendor;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Number;
use Inertia\Inertia;
use Inertia\Response;

class IndexPageController extends Controller
{
    public function index(): Response
    {
        return $this->render(null);
    }

    public function showCategory(string $slug): Response
    {
        $category = collect(config('service_categories'))->search(fn (array $categoryConfig) => $categoryConfig['slug'] === $slug);

        abort_if($category === false, 404);

        return $this->render($category);
    }

    private function render(?string $category): Response
    {
        $serviceCategoryLabels = collect(array_keys(config('service_categories')))
            ->mapWithKeys(function (string $value) {
                $translation = __("config-service-categories.{$value}");

                return [
                    $value => $translation === "config-service-categories.{$value}" ? $value : $translation,
                ];
            })
            ->all();

        $pricingUnitLabels = collect(config('service_pricing_units'))
            ->mapWithKeys(function (string $value) {
                $translation = __("config-service-pricing-units.{$value}");

                return [
                    $value => $translation === "config-service-pricing-units.{$value}" ? $value : $translation,
                ];
            })
            ->all();
        $publicServices = Service::query()
            ->with(['customCategory', 'vendor', 'media', 'prices'])
            ->where('is_public', true)
            ->when($category !== null, fn ($query) => $query->where('category', $category))
            ->orderBy('name')
            ->get();
        $publicServiceCountsByCategory = Service::query()
            ->where('is_public', true)
            ->selectRaw('category, count(*) as aggregate')
            ->groupBy('category')
            ->pluck('aggregate', 'category');
        $copy = __('index');
        $categoryLabel = $category !== null ? $serviceCategoryLabels[$category] : null;
        $pageUrl = $category !== null ? route('category.show', config("service_categories.{$category}.slug")) : route('home');
        $schemaServices = $publicServices
            ->values()
            ->map(function (Service $service, int $index) use ($serviceCategoryLabels) {
                $offer = [
                    '@type' => 'Offer',
                    'position' => $index + 1,
                    'url' => route('public.booking.service.show', [$service->vendor->slug, $service->public_id]),
                    'itemOffered' => [
                        '@type' => 'Service',
                        'name' => $service->name,
                        'description' => $service->description,
                        'category' => $service->category === 'other'
                            ? ($service->customCategory?->name ?? $serviceCategoryLabels['other'] ?? $service->category)
                            : $serviceCategoryLabels[$service->category] ?? $service->category,
                        'provider' => [
                            '@type' => 'LocalBusiness',
                            'name' => $service->vendor->name,
                            'url' => route('public.booking.show', $service->vendor->slug),
                        ],
                    ],
                ];

                $price = $service->prices->first();

                if ($price?->price_in_minor !== null) {
                    $offer['price'] = number_format($price->price_in_minor / 100, 2, '.', '');
                    $offer['priceCurrency'] = 'EUR';
                }

                return $offer;
            })
            ->all();

        return Inertia::render('IndexPage', [
            'services' => $publicServices
                ->map(function (Service $service) use ($serviceCategoryLabels, $pricingUnitLabels) {
                    $price = $service->prices->first();

                    return [
                        'id' => $service->id,
                        'public_id' => $service->public_id,
                        'name' => $service->name,
                        'category' => $service->category,
                        'category_label' => $service->category === 'other'
                            ? ($service->customCategory?->name ?? $serviceCategoryLabels['other'] ?? $service->category)
                            : $serviceCategoryLabels[$service->category] ?? $service->category,
                        'description' => $service->description,
                        'vendor_name' => $service->vendor->name,
                        'vendor_location' => $service->vendor->location,
                        'vendor_is_claimed' => $service->vendor->isClaimed(),
                        'price_in_minor' => $price?->price_in_minor,
                        'pricing_unit' => $price?->pricing_unit,
                        'pricing_unit_label' => $price?->pricing_unit ? ($pricingUnitLabels[$price->pricing_unit] ?? $price->pricing_unit) : null,
                        'formatted_price' => $price?->price_in_minor !== null ? Number::currency($price->price_in_minor / 100, 'EUR', app()->getLocale()) : null,
                        'url' => route('public.booking.service.show', [$service->vendor->slug, $service->public_id]),
                        'pricing_options' => $service->prices
                            ->map(fn ($price) => [
                                'id' => $price->id,
                                'name' => $price->name,
                                'description' => $price->description,
                                'price_in_minor' => $price->price_in_minor,
                                'formatted_price' => Number::currency($price->price_in_minor / 100, 'EUR', app()->getLocale()),
                                'pricing_unit' => $price->pricing_unit,
                                'pricing_unit_label' => $price->pricing_unit ? ($pricingUnitLabels[$price->pricing_unit] ?? $price->pricing_unit) : null,
                                'features' => [],
                            ])
                            ->values()
                            ->all(),
                        'media' => $service->media
                            ->map(fn ($media) => [
                                'id' => $media->id,
                                'url' => Storage::disk('r2')->url($media->path),
                                'sort_order' => $media->sort_order,
                            ])
                            ->values()
                            ->all(),
                    ];
                })
                ->all(),
            'categories' => collect($serviceCategoryLabels)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label, 'slug' => config("service_categories.{$value}.slug")])
                ->values()
                ->all(),
            'service_count' => (int) $publicServiceCountsByCategory->sum(),
            'vendor_count' => Vendor::query()->whereHas('services', fn ($query) => $query->where('is_public', true))->count(),
            'category_counts' => collect($serviceCategoryLabels)
                ->except('other')
                ->map(fn (string $label, string $value) => [
                    'value' => $value,
                    'label' => $label,
                    'count' => (int) ($publicServiceCountsByCategory[$value] ?? 0),
                    'url' => route('category.show', config("service_categories.{$value}.slug")),
                ])
                ->filter(fn (array $categoryCount) => $categoryCount['count'] > 0 || $categoryCount['value'] === $category)
                ->values()
                ->all(),
            'verified_vendors' => $category === null
                ? Vendor::query()
                    ->whereNotNull('user_id')
                    ->whereHas('services', fn ($query) => $query->where('is_public', true))
                    ->latest()
                    ->limit(4)
                    ->get()
                    ->map(fn (Vendor $vendor) => [
                        'name' => $vendor->name,
                        'location' => $vendor->location,
                        'logo_url' => $vendor->logo_path ? Storage::disk('r2')->url($vendor->logo_path) : null,
                        'url' => route('public.booking.show', $vendor->slug),
                    ])
                    ->all()
                : [],
            'selectedCategory' => $category,
            'locale' => app()->getLocale(),
            'copy' => $copy,
        ])->withViewData(['seo' => [
            'title' => $categoryLabel !== null ? __('index.category_title', ['category' => $categoryLabel]) : ($copy['title'] ?? config('app.name')),
            'description' => $categoryLabel !== null ? __('index.category_meta_description', ['category' => $categoryLabel]) : ($copy['meta_description'] ?? 'Discover public services from local vendors.'),
            'canonical' => $pageUrl,
            'robots' => $category !== null && $publicServices->isEmpty() ? 'noindex, follow' : 'index, follow',
            'schema' => [
                '@context' => 'https://schema.org',
                '@type' => 'ItemList',
                'name' => $categoryLabel ?? $copy['services_heading'] ?? 'Services',
                'url' => $pageUrl,
                'numberOfItems' => count($schemaServices),
                'itemListElement' => $schemaServices,
            ],
        ]]);
    }
}
