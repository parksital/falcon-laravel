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
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { update as updateLocale } from '@/routes/locale';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { GlobeIcon } from '@phosphor-icons/react';
import { type PublicBookingPageProps } from './types';

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

export default function DesktopPublicBookingPage({ copy, vendor, services, featuredServiceSlug, locale }: PublicBookingPageProps) {
    const { layoutCopy } = usePage<SharedData>().props;

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12">
            <section className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">{vendor.location}</p>
                        <h1 className="text-3xl font-semibold text-foreground">{vendor.name}</h1>
                        {vendor.short_description ? (
                            <p className="max-w-2xl text-sm text-muted-foreground">{vendor.short_description}</p>
                        ) : null}
                        {vendor.joined_at ? (
                            <p className="text-sm text-muted-foreground">
                                {interpolate(copy.joined, { formatted_date: vendor.joined_at })}
                            </p>
                        ) : null}
                    </div>
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
                </div>
            </section>

            <section className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold text-foreground">
                    {copy.services_heading}
                </h2>
                {services.length > 0 ? (
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
                ) : (
                    <Empty className="border">
                        <EmptyHeader>
                            <EmptyMedia>
                                <h1 className="text-6xl">⛰️</h1>
                            </EmptyMedia>
                            <EmptyTitle>{copy.services_empty_title}</EmptyTitle>
                            <EmptyDescription>
                                {interpolate(copy.services_empty_description, { vendor: vendor.name })}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
            </section>
        </main>
    );
}
