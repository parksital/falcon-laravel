import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
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
    NativeSelect,
    NativeSelectOption,
} from '@/components/ui/native-select';
import { update as updateLocale } from '@/routes/locale';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
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

export default function MobilePublicBookingPage({ copy, vendor, services, locale }: PublicBookingPageProps) {
    const { layoutCopy } = usePage<SharedData>().props;

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-4">
            <div className="flex justify-end">
                <NativeSelect
                    value={locale}
                    aria-label={layoutCopy.language}
                    onChange={(event) => {
                        const nextLocale = event.target.value;

                        if (nextLocale !== locale) {
                            router.patch(updateLocale.url(), { locale: nextLocale }, {
                                preserveScroll: true,
                                preserveState: true,
                            });
                        }
                    }}
                >
                    <NativeSelectOption value="en">{layoutCopy.language_english}</NativeSelectOption>
                    <NativeSelectOption value="nl">{layoutCopy.language_dutch}</NativeSelectOption>
                </NativeSelect>
            </div>

            <section className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                    {vendor.logo_url && (
                        <div className="size-20 shrink-0 overflow-hidden border">
                            <img src={vendor.logo_url} alt={vendor.name} className="size-full object-cover" />
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">{vendor.location}</p>
                        <h1 className="text-3xl font-semibold text-foreground">{vendor.name}</h1>
                        {vendor.short_description ? (
                            <p className="text-sm text-muted-foreground">{vendor.short_description}</p>
                        ) : null}
                        {vendor.joined_at ? (
                            <p className="text-sm text-muted-foreground">
                                {interpolate(copy.joined, { formatted_date: vendor.joined_at })}
                            </p>
                        ) : null}
                    </div>
                </div>
            </section>

            <section className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold text-foreground">
                    {copy.services_heading}
                </h2>
                {services.length > 0 ? (
                    <div className="grid gap-3">
                        {services.map((service) => (
                            <Card key={service.id} id={`service-${service.slug}`}>
                                <CardHeader>
                                    <Badge variant="secondary">{service.category_label}</Badge>
                                    <CardTitle>{service.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                    {formatPriceInMinor(service.price_in_minor, locale) ? (
                                        <p className="font-medium">
                                            {formatPriceInMinor(service.price_in_minor, locale)}
                                            {service.pricing_type !== 'package' && service.price_type_label ? ` ${interpolate(copy.per_unit, {
                                                unit: service.price_type_label,
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
