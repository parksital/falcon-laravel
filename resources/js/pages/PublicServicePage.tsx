import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem as BreadcrumbListItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/service-card';
import { ServiceListItem } from '@/components/service-list-item';
import { useMediaQuery } from '@/hooks/use-media-query';
import PublicLayout from '@/layouts/public/public-layout';
import { PublicServiceContactCard } from '@/pages/public-booking/public-service-contact-card';
import { PublicServiceMediaCarousel } from '@/pages/public-booking/public-service-media-carousel';
import { PublicServicePricingCard } from '@/pages/public-booking/public-service-pricing-card';
import { type PublicServicePageProps } from '@/pages/public-booking/types';
import { home } from '@/routes';
import { show as showCategory } from '@/routes/category';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Fragment } from 'react';
import { ArrowRightIcon, MapPinSimpleIcon, StorefrontIcon } from '@phosphor-icons/react';

export default function PublicServicePage({ copy, vendor, service, categorySlug, otherServices, seo }: PublicServicePageProps) {
    const isMobile = useMediaQuery('(max-width: 640px)');
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'HuurMaar', href: home().url },
        { title: service.category_label, href: showCategory(categorySlug).url },
        { title: service.name, href: service.url },
    ];
    const lowestPricingOption = service.pricing_options.toSorted((first, second) => first.price_in_minor - second.price_in_minor)[0];
    const [serviceByVendorPrefix, serviceByVendorSuffix] = copy.service_by_vendor.split(':vendor');

    const contactCard = <PublicServiceContactCard copy={copy} vendor={vendor} className={isMobile ? undefined : 'sticky top-22 flex-[1_1_320px] self-start'} />;

    return (
        <PublicLayout breadcrumbs={breadcrumbs}>
            <Head title={seo.title}>
                <meta name="description" content={seo.description} />
                <link rel="canonical" href={seo.canonical} />
            </Head>

            <main className="flex flex-col gap-8 px-4 pt-6 pb-12 sm:px-6 sm:pb-16">
                {isMobile ? (
                    <div className="-mt-6 flex flex-col">
                        <Breadcrumb className="py-3">
                            <BreadcrumbList className="flex-nowrap gap-1 text-xs whitespace-nowrap">
                                {breadcrumbs.map((item, index) => (
                                    <Fragment key={item.href}>
                                        {index > 0 ? <BreadcrumbSeparator /> : null}
                                        <BreadcrumbListItem className={index === breadcrumbs.length - 1 ? 'min-w-0' : 'shrink-0'}>
                                            {index === breadcrumbs.length - 1 ? (
                                                <BreadcrumbPage className="truncate">{item.title}</BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink asChild>
                                                    <Link href={item.href} className="inline-flex min-h-6 items-center">{item.title}</Link>
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbListItem>
                                    </Fragment>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                        {service.media.length > 0 ? <PublicServiceMediaCarousel copy={copy} serviceName={service.name} media={service.media} /> : null}
                    </div>
                ) : null}

                <header className="flex max-w-180 flex-col gap-2">
                    {!vendor.is_claimed ? <Badge variant="outline" className="self-start">{copy.found_by_huurmaar}</Badge> : null}
                    <h1 className="text-2xl/tight font-semibold tracking-tight text-balance sm:text-[2rem]">{service.name}</h1>
                    <p className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
                        <span className="inline-flex items-center gap-1.5">
                            <StorefrontIcon aria-hidden="true" className="size-3.5 shrink-0" />
                            <span>
                                {serviceByVendorPrefix}
                                <Link href={vendor.url} className="font-medium text-foreground underline-offset-3 hover:underline">{vendor.name}</Link>
                                {serviceByVendorSuffix}
                            </span>
                        </span>
                        {vendor.location ? (
                            <span className="inline-flex items-center gap-1.5">
                                <MapPinSimpleIcon aria-hidden="true" className="size-3.5 shrink-0" />
                                {vendor.location}
                            </span>
                        ) : null}
                    </p>
                </header>

                <div className="flex flex-wrap items-start gap-10">
                    <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-12">
                        {!isMobile && service.media.length > 0 ? <PublicServiceMediaCarousel copy={copy} serviceName={service.name} media={service.media} /> : null}

                        {service.description ? (
                            <section aria-labelledby="service-details-heading" className="flex flex-col gap-3">
                                <h2 id="service-details-heading" className="text-lg font-semibold">{copy.service_details_heading}</h2>
                                <p className="max-w-prose text-base/relaxed text-pretty whitespace-pre-line">{service.description}</p>
                            </section>
                        ) : null}

                        {service.pricing_options.length > 0 ? (
                            <section id="prices" aria-labelledby="prices-heading" className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <h2 id="prices-heading" className="text-lg font-semibold">{copy.pricing_heading}</h2>
                                    <p className="text-sm text-muted-foreground">{(service.pricing_options.length === 1 ? copy.options_count_one : copy.options_count).replace(':count', String(service.pricing_options.length))}</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {service.pricing_options.map((pricingOption) => (
                                        <PublicServicePricingCard key={pricingOption.id} copy={copy} pricingOption={pricingOption} />
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        {isMobile ? contactCard : null}
                    </div>

                    {isMobile ? null : contactCard}
                </div>

                {otherServices.length > 0 ? (
                    <section aria-labelledby="more-from-vendor-heading" className="flex flex-col gap-4 border-t pt-10 sm:mt-8">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                            <h2 id="more-from-vendor-heading" className="text-lg font-semibold text-balance">{copy.more_from_vendor.replace(':vendor', vendor.name)}</h2>
                            <Link href={vendor.url} className="inline-flex items-center gap-1 text-xs font-medium underline-offset-3 hover:underline">
                                {copy.back_to_services}
                                <ArrowRightIcon aria-hidden="true" className="size-3" />
                            </Link>
                        </div>
                        {isMobile ? (
                            <div className="flex flex-col overflow-hidden bg-card text-card-foreground ring-1 ring-foreground/10">
                                {otherServices.map((otherService) => (
                                    <ServiceListItem key={otherService.id} copy={copy} service={otherService} showVendor={false} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {otherServices.map((otherService) => (
                                    <Link key={otherService.id} href={otherService.url} className="flex flex-col self-start text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                        <ServiceCard copy={copy} service={otherService} showVendor={false} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                ) : null}
            </main>

            {isMobile && lowestPricingOption ? (
                <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t bg-background px-4 py-3">
                    <div className="flex min-w-0 flex-1 flex-col text-xs/snug">
                        {service.pricing_options.length > 1 ? <span className="text-muted-foreground">{copy.starting_from}</span> : null}
                        <span className="whitespace-nowrap">
                            <span className="text-sm font-semibold tabular-nums">{lowestPricingOption.formatted_price}</span>{' '}
                            <span className="text-muted-foreground">{copy.per_unit.replace(':unit', lowestPricingOption.pricing_unit_label.toLocaleLowerCase())}</span>
                        </span>
                    </div>
                    <Button asChild size="lg" className="h-11 px-5">
                        <a href="#contact">{copy.contact_heading}</a>
                    </Button>
                </div>
            ) : null}
        </PublicLayout>
    );
}
