import { Badge } from '@/components/ui/badge';
import { ServicePricingCard } from '@/components/service-pricing-card';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/public/public-layout';
import { PublicVendorContactCard } from '@/pages/public-booking/public-vendor-contact-card';
import { type PublicServicePageProps } from '@/pages/public-booking/types';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

function formattedPricingOptionPrice(
    pricingOption: PublicServicePageProps['service']['pricing_options'][number],
) {
    return pricingOption.formatted_price;
}

function formattedServicePrice(service: PublicServicePageProps['service']) {
    return service.formatted_price ?? '';
}

export default function PublicServicePage({ copy, vendor, service, seo }: PublicServicePageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: vendor.name, href: vendor.url },
        { title: service.name, href: service.url },
    ];

    const [serviceByVendorPrefix, serviceByVendorSuffix] = copy.service_by_vendor.split(':vendor');

    return (
        <PublicLayout breadcrumbs={breadcrumbs}>
            <Head title={seo.title}>
                <meta name="description" content={seo.description} />
                <link rel="canonical" href={seo.canonical} />
            </Head>

            <main className="w-full">
                <section className='mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12'>


                    <section className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">{service.category_label}</Badge>
                                {!vendor.is_claimed && <Badge variant="outline">{copy.found_by_huurmaar}</Badge>}
                                <p className="text-sm text-muted-foreground">{vendor.location}</p>
                            </div>
                            <h1 className="text-3xl font-semibold text-foreground">{service.name}</h1>
                            <div className="flex items-baseline gap-1 text-sm text-muted-foreground">
                                <span>{serviceByVendorPrefix}</span>
                                <Button asChild variant="link" className="h-auto p-0 text-sm">
                                    <Link href={vendor.url}>{vendor.name}</Link>
                                </Button>
                                <span>{serviceByVendorSuffix}</span>
                            </div>
                        </div>
                    </section>

                    {!vendor.is_claimed && <PublicVendorContactCard copy={copy} vendor={vendor} />}

                    {service.media.length > 0 ? (
                        <section className="grid grid-cols-3 gap-4">
                            {service.media.map((media, index) => (
                                <div key={media.id} className="overflow-hidden border">
                                    <img src={media.url} alt={`${service.name} ${index + 1}`} className="size-full object-contain" />
                                </div>
                            ))}
                        </section>
                    ) : null}

                    {service.description ? (
                        <section className="flex flex-col gap-3">
                            <h2 className="text-xl font-semibold text-foreground">{copy.service_details_heading}</h2>
                            <p className="max-w-prose whitespace-pre-line text-base/relaxed text-foreground">{service.description}</p>
                        </section>
                    ) : null}

                    {service.pricing_options.length > 0 ? (
                        <section className="flex flex-col gap-3">
                            <h2 className="text-xl font-semibold text-foreground">{copy.pricing_heading}</h2>
                            <div className="grid gap-4">
                                {service.pricing_options.map((pricingOption) => (
                                    <ServicePricingCard
                                        key={pricingOption.id}
                                        title={pricingOption.name}
                                        formattedPrice={formattedPricingOptionPrice(pricingOption)}
                                        priceLabel={pricingOption.pricing_mode === 'variable' ? pricingOption.pricing_unit_label : pricingOption.pricing_mode_label}
                                        description={pricingOption.description}
                                        features={pricingOption.features.map((feature) => ({
                                            key: feature.id,
                                            label: feature.label,
                                            value: feature.value,
                                        }))}
                                    />
                                ))}
                            </div>
                        </section>
                    ) : service.formatted_price ? (
                        <ServicePricingCard
                            title={service.name}
                            formattedPrice={formattedServicePrice(service)}
                            priceLabel={service.pricing_mode === 'variable' ? service.pricing_unit_label : service.pricing_mode_label}
                        />
                        ) : null}
                </section>
            </main>
        </PublicLayout>
    );
}
