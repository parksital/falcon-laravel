<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Vendor;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PublicBookingPageController extends Controller
{
    public function showVendor(string $slug): Response
    {
        $vendor = Vendor::query()
            ->where('slug', $slug)
            ->where('is_public', true)
            ->with(['services' => function ($query) {
                $query
                    ->where('is_public', true)
                    ->with('customCategory')
                    ->orderBy('name');
            }])
            ->firstOrFail();

        return $this->render($vendor);
    }

    public function showService(string $vendorSlug, string $serviceSlug): Response
    {
        $vendor = Vendor::query()
            ->where('slug', $vendorSlug)
            ->where('is_public', true)
            ->with(['services' => function ($query) {
                $query
                    ->where('is_public', true)
                    ->with('customCategory')
                    ->orderBy('name');
            }])
            ->firstOrFail();

        $service = $vendor->services->firstWhere('slug', $serviceSlug);

        abort_unless($service, 404);

        return $this->render($vendor, $service);
    }

    private function render(Vendor $vendor, ?Service $service = null): Response
    {
        $seo = $this->seo($vendor, $service);

        return Inertia::render('PublicBookingPage', [
            'copy' => __('public-booking'),
            'vendor' => [
                'id' => $vendor->id,
                'name' => $vendor->name,
                'slug' => $vendor->slug,
                'location' => $vendor->location,
                'short_description' => $vendor->short_description,
                'url' => route('public.booking.show', $vendor->slug),
            ],
            'services' => $vendor->services
                ->map(fn (Service $service) => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'slug' => $service->slug,
                    'category' => $service->category,
                    'category_label' => $service->category === 'other'
                        ? ($service->customCategory?->name ?? $this->serviceCategoryLabels()['other'] ?? $service->category)
                        : $this->serviceCategoryLabels()[$service->category] ?? $service->category,
                    'description' => $service->description,
                    'price_in_minor' => $service->price_in_minor,
                    'unit' => $service->unit,
                    'unit_label' => $service->unit ? ($this->serviceUnitLabels()[$service->unit] ?? $service->unit) : null,
                    'url' => route('public.booking.service.show', [$vendor->slug, $service->slug]),
                ])
                ->values()
                ->all(),
            'featuredServiceSlug' => $service?->slug,
            'locale' => app()->getLocale(),
            'seo' => [
                'title' => $seo['title'],
                'description' => $seo['description'],
                'canonical' => $seo['canonical'],
            ],
        ])->withViewData(['seo' => $seo]);
    }

    private function seo(Vendor $vendor, ?Service $service = null): array
    {
        $title = $service
            ? __('public-booking.seo_service_title', [
                'service' => $service->name,
                'vendor' => $vendor->name,
            ])
            : __('public-booking.seo_vendor_title', [
                'vendor' => $vendor->name,
                'location' => $vendor->location,
            ]);
        $description = $service
            ? ($service->description ?: __('public-booking.seo_service_description', [
                'service' => $service->name,
                'vendor' => $vendor->name,
                'location' => $vendor->location,
            ]))
            : ($vendor->short_description ?: __('public-booking.seo_vendor_description', [
                'vendor' => $vendor->name,
                'location' => $vendor->location,
            ]));
        $canonical = $service
            ? route('public.booking.service.show', [$vendor->slug, $service->slug])
            : route('public.booking.show', $vendor->slug);

        return [
            'title' => Str::limit($title, 65, ''),
            'description' => Str::limit($description, 160, ''),
            'canonical' => $canonical,
            'robots' => 'index, follow',
            'schema' => $this->schema($vendor),
        ];
    }

    private function schema(Vendor $vendor): array
    {
        $businessId = route('public.booking.show', $vendor->slug).'#business';

        return [
            '@context' => 'https://schema.org',
            '@type' => 'LocalBusiness',
            '@id' => $businessId,
            'name' => $vendor->name,
            'description' => $vendor->short_description,
            'url' => route('public.booking.show', $vendor->slug),
            'address' => [
                '@type' => 'PostalAddress',
                'addressLocality' => $vendor->location,
            ],
            'makesOffer' => $vendor->services
                ->map(function (Service $service) use ($businessId, $vendor) {
                    $offer = [
                        '@type' => 'Offer',
                        'url' => route('public.booking.service.show', [$vendor->slug, $service->slug]),
                        'itemOffered' => [
                            '@type' => 'Service',
                            'name' => $service->name,
                            'description' => $service->description,
                            'category' => $service->category === 'other'
                                ? ($service->customCategory?->name ?? $this->serviceCategoryLabels()['other'] ?? $service->category)
                                : $this->serviceCategoryLabels()[$service->category] ?? $service->category,
                            'provider' => [
                                '@id' => $businessId,
                            ],
                        ],
                    ];

                    if ($service->price_in_minor !== null) {
                        $offer['price'] = number_format($service->price_in_minor / 100, 2, '.', '');
                        $offer['priceCurrency'] = 'EUR';
                    }

                    return $offer;
                })
                ->values()
                ->all(),
        ];
    }

    private function serviceCategoryLabels(): array
    {
        return collect(config('service_categories'))
            ->mapWithKeys(function (string $value) {
                $translation = __("config-service-categories.{$value}");

                return [
                    $value => $translation === "config-service-categories.{$value}" ? $value : $translation,
                ];
            })
            ->all();
    }

    private function serviceUnitLabels(): array
    {
        return collect(config('service_units'))
            ->mapWithKeys(function (string $value) {
                $translation = __("config-service-units.{$value}");

                return [
                    $value => $translation === "config-service-units.{$value}" ? $value : $translation,
                ];
            })
            ->all();
    }
}
