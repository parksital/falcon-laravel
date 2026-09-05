import { Badge } from '@/components/ui/badge';
import { ServicePricingCard } from '@/components/service-pricing-card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NativeSelect,
    NativeSelectOption,
} from '@/components/ui/native-select';
import PublicBookingShell from '@/layouts/public/public-booking-shell';
import { type PublicBookingServicePageProps } from '@/pages/public-booking/types';
import { update as updateLocale } from '@/routes/locale';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { GlobeIcon } from '@phosphor-icons/react';

function interpolate(value: string, replacements: Record<string, string>) {
    return Object.entries(replacements).reduce(
        (result, [key, replacement]) => result.replace(`:${key}`, replacement),
        value,
    );
}

function formattedPricingOptionPrice(
    pricingOption: PublicBookingServicePageProps['service']['pricing_options'][number],
    copy: PublicBookingServicePageProps['copy'],
) {
    if (pricingOption.pricing_mode !== 'variable' || ! pricingOption.pricing_unit_label) {
        return pricingOption.formatted_price;
    }

    return `${pricingOption.formatted_price} ${interpolate(copy.per_unit, { unit: pricingOption.pricing_unit_label })}`;
}

function formattedServicePrice(
    service: PublicBookingServicePageProps['service'],
    copy: PublicBookingServicePageProps['copy'],
) {
    if (service.pricing_mode !== 'variable' || ! service.pricing_unit_label) {
        return service.formatted_price ?? '';
    }

    return `${service.formatted_price} ${interpolate(copy.per_unit, { unit: service.pricing_unit_label })}`;
}

export default function PublicBookingServicePage({ copy, vendor, service, locale, seo }: PublicBookingServicePageProps) {
    const { layoutCopy } = usePage<SharedData>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: vendor.name, href: vendor.url },
        { title: service.name, href: service.url },
    ];

    function changeLocale(nextLocale: string) {
        if (nextLocale !== locale) {
            router.patch(updateLocale.url(), { locale: nextLocale }, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    }

    const languageSwitcher = (
        <>
            <div className="sm:hidden">
                <NativeSelect
                    value={locale}
                    aria-label={layoutCopy.language}
                    onChange={(event) => changeLocale(event.target.value)}
                >
                    <NativeSelectOption value="en">{layoutCopy.language_english}</NativeSelectOption>
                    <NativeSelectOption value="nl">{layoutCopy.language_dutch}</NativeSelectOption>
                </NativeSelect>
            </div>

            <div className="hidden sm:block">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                            <GlobeIcon data-icon="inline-start" />
                            {locale === 'nl' ? layoutCopy.language_dutch : layoutCopy.language_english}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>{layoutCopy.language}</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={locale} onValueChange={changeLocale}>
                                <DropdownMenuRadioItem value="en">
                                    {layoutCopy.language_english}
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="nl">
                                    {layoutCopy.language_dutch}
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );

    return (
        <PublicBookingShell breadcrumbs={breadcrumbs} headerAction={languageSwitcher}>
            <Head title={seo.title}>
                <meta name="description" content={seo.description} />
                <link rel="canonical" href={seo.canonical} />
            </Head>

            <main className="w-full">
                <section className='mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12'>


                    <section className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">{service.category_label}</Badge>
                                <p className="text-sm text-muted-foreground">{vendor.location}</p>
                            </div>
                            <h1 className="text-3xl font-semibold text-foreground">{service.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                {interpolate(copy.service_by_vendor, { vendor: vendor.name })}
                            </p>
                        </div>
                    </section>

                    {service.media.length > 0 ? (
                        <section className="grid grid-cols-3 gap-2">
                            {service.media.map((media, index) => (
                                <div key={media.id} className="overflow-hidden border">
                                    <img src={media.url} alt={`${service.name} ${index + 1}`} className="size-full object-contain" />
                                </div>
                            ))}
                        </section>
                    ) : null}

                    {service.description ? (
                        <section className="flex flex-col gap-2">
                            <h2 className="text-xl font-semibold text-foreground">{copy.service_details_heading}</h2>
                            <p className="whitespace-pre-line text-sm text-muted-foreground">{service.description}</p>
                        </section>
                    ) : null}

                    {service.pricing_options.length > 0 ? (
                        <section className="flex flex-col gap-3">
                            <h2 className="text-xl font-semibold text-foreground">{copy.pricing_heading}</h2>
                            <div className="grid gap-3">
                                {service.pricing_options.map((pricingOption) => (
                                    <ServicePricingCard
                                        key={pricingOption.id}
                                        title={pricingOption.name}
                                        formattedPrice={formattedPricingOptionPrice(pricingOption, copy)}
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
                            formattedPrice={formattedServicePrice(service, copy)}
                        />
                        ) : null}
                </section>
            </main>
        </PublicBookingShell>
    );
}
