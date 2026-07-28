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
import PublicLayout from '@/layouts/public/public-layout';
import { update as updateLocale } from '@/routes/locale';
import { SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { GlobeIcon } from '@phosphor-icons/react';

type Vendor = {
    id: number;
    name: string;
    slug: string;
    location: string;
    short_description: string | null;
    url: string;
};

type Service = {
    id: number;
    name: string;
    slug: string;
    category: string;
    category_label: string;
    description: string | null;
    price_in_minor: number | null;
    unit: string | null;
    unit_label: string | null;
    url: string;
};

type PublicBookingPageProps = {
    copy: Record<string, string>;
    vendor: Vendor;
    services: Service[];
    featuredServiceSlug: string | null;
    locale: string;
    seo: {
        title: string;
        description: string;
        canonical: string;
    };
};

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

export default function PublicBookingPage({ copy, vendor, services, featuredServiceSlug, locale, seo }: PublicBookingPageProps) {
    const { layoutCopy } = usePage<SharedData>().props;

    return (
        <PublicLayout>
            <Head title={seo.title}>
                <meta name="description" content={seo.description} />
                <link rel="canonical" href={seo.canonical} />
            </Head>

            <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12">
                <section className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">{vendor.location}</p>
                            <h1 className="text-3xl font-semibold text-foreground">{vendor.name}</h1>
                        </div>
                        <div className="flex items-center gap-2">
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
                                        <DropdownMenuRadioGroup
                                            value={locale}
                                            onValueChange={(nextLocale) => {
                                                if (nextLocale !== locale) {
                                                    router.patch(updateLocale.url(), { locale: nextLocale }, {
                                                        preserveScroll: true,
                                                        preserveState: true,
                                                    });
                                                }
                                            }}
                                        >
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

                            <Button variant="outline" onClick={() => router.visit('/index')}>
                                {copy.browse_services}
                            </Button>
                        </div>
                    </div>
                    {vendor.short_description ? (
                        <p className="max-w-2xl text-sm text-muted-foreground">{vendor.short_description}</p>
                    ) : null}
                </section>

                {services.length > 0 ? (
                    <section className="space-y-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            {copy.services_heading}
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {services.map((service) => (
                                <Card
                                    key={service.id}
                                    id={`service-${service.slug}`}
                                    className={service.slug === featuredServiceSlug ? 'border-foreground' : undefined}
                                >
                                    <CardHeader>
                                        <Badge variant="secondary">{service.category_label}</Badge>
                                        <CardTitle>{service.name}</CardTitle>
                                        {service.description ? (
                                            <CardDescription>{service.description}</CardDescription>
                                        ) : null}
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3">
                                        {formatPriceInMinor(service.price_in_minor, locale) ? (
                                            <p className="font-medium">
                                                {formatPriceInMinor(service.price_in_minor, locale)}
                                                {service.unit_label ? ` ${interpolate(copy.per_unit, {
                                                    unit: service.unit_label,
                                                })}` : null}
                                            </p>
                                        ) : null}
                                        <Button variant="outline" onClick={() => router.visit(service.url)}>
                                            {copy.view_service}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                ) : null}
            </main>
        </PublicLayout>
    );
}
