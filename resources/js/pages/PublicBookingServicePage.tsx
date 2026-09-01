import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
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
import PublicLayout from '@/layouts/public/public-layout';
import { type PublicBookingServicePageProps } from '@/pages/public-booking/types';
import { update as updateLocale } from '@/routes/locale';
import { SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
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

    function changeLocale(nextLocale: string) {
        if (nextLocale !== locale) {
            router.patch(updateLocale.url(), { locale: nextLocale }, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    }

    return (
        <PublicLayout>
            <Head title={seo.title}>
                <meta name="description" content={seo.description} />
                <link rel="canonical" href={seo.canonical} />
            </Head>

            <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-4 sm:px-6 sm:py-12">
                <div className="flex items-center justify-between gap-3">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href={vendor.url}>{vendor.name}</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{service.name}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

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
                </div>

                <section className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">{vendor.location}</p>
                        <h1 className="text-3xl font-semibold text-foreground">{service.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {interpolate(copy.service_by_vendor, { vendor: vendor.name })}
                        </p>
                    </div>
                </section>

                <Card>
                    <CardHeader>
                        <Badge variant="secondary">{service.category_label}</Badge>
                        {service.description ? (
                            <CardDescription className="whitespace-pre-line">{service.description}</CardDescription>
                        ) : null}
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {formattedPrice ? (
                            <p className="font-medium">
                                {formattedPrice}
                                {service.price_type_label ? ` ${interpolate(copy.per_unit, {
                                    pricing_type: service.price_type_label,
                                })}` : null}
                            </p>
                        ) : null}
                    </CardContent>
                </Card>
            </main>
        </PublicLayout>
    );
}
