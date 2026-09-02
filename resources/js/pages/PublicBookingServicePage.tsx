import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

function formatPriceInMinor(priceInMinor: number | null, locale: string) {
    if (priceInMinor === null) return null;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
    }).format(priceInMinor / 100);
}

export default function PublicBookingServicePage({ copy, vendor, service, locale, seo }: PublicBookingServicePageProps) {
    const { layoutCopy } = usePage<SharedData>().props;
    const formattedPrice = formatPriceInMinor(service.price_in_minor, locale);
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
                <section className='flex flex-col mx-auto max-w-4xl gap-6 px-6 py-12 overflow-hidden overflow-y-auto'>


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
                                    <Card key={pricingOption.id}>
                                        <CardHeader>
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <div className="flex min-w-0 flex-col gap-1">
                                                    <CardTitle className="text-base">{pricingOption.name}</CardTitle>
                                                    <Badge variant="secondary" className="w-fit">
                                                        {pricingOption.price_type_label}
                                                    </Badge>
                                                </div>
                                                <p className="shrink-0 font-medium">
                                                    {formatPriceInMinor(pricingOption.price_in_minor, locale)}
                                                    {pricingOption.pricing_type !== 'package' ? ` ${interpolate(copy.per_unit, {
                                                        unit: pricingOption.price_type_label,
                                                    })}` : null}
                                                </p>
                                            </div>
                                            {pricingOption.description ? (
                                                <CardDescription className="whitespace-pre-line">{pricingOption.description}</CardDescription>
                                            ) : null}
                                        </CardHeader>
                                        {pricingOption.features.length > 0 ? (
                                            <CardContent className="flex flex-wrap gap-2">
                                                {pricingOption.features.map((feature) => (
                                                    <Badge key={feature.id} variant="secondary">
                                                        {feature.value ? `${feature.label}: ${feature.value}` : feature.label}
                                                    </Badge>
                                                ))}
                                            </CardContent>
                                        ) : null}
                                    </Card>
                                ))}
                            </div>
                        </section>
                    ) : formattedPrice ? (
                        <Card>
                            <CardContent className="flex flex-col gap-3">
                                <p className="font-medium">
                                    {formattedPrice}
                                    {service.pricing_type !== 'package' && service.price_type_label ? ` ${interpolate(copy.per_unit, {
                                        unit: service.price_type_label,
                                    })}` : null}
                                </p>
                            </CardContent>
                        </Card>
                        ) : null}
                </section>
            </main>
        </PublicBookingShell>
    );
}
