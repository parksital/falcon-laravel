import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
import { Link } from '@inertiajs/react';
import { ArrowRightIcon } from '@phosphor-icons/react';
import { type PublicBookingPageProps, type Service } from './types';

function interpolate(value: string, replacements: Record<string, string>) {
    return Object.entries(replacements).reduce(
        (result, [key, replacement]) => result.replace(`:${key}`, replacement),
        value,
    );
}

function servicePriceSummary(service: Service, copy: PublicBookingPageProps['copy']) {
    const lowestPrice = service.pricing_options
        .toSorted((first, second) => first.price_in_minor - second.price_in_minor)
        [0];

    if (! lowestPrice) return null;

    const unit = lowestPrice.pricing_type !== 'package'
        ? ` ${interpolate(copy.per_unit, { unit: lowestPrice.price_type_label })}`
        : '';

    return {
        price: `${copy.starting_from} ${lowestPrice.formatted_price}${unit}`,
        count: interpolate(copy.prices_count, {
            count: `${service.pricing_options.length}`,
        }),
        hasMultiplePrices: service.pricing_options.length > 1,
    }
}

export default function MobilePublicBookingPage({ copy, vendor, services, locale }: PublicBookingPageProps) {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-4">
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
                                <Link href={service.url} className="flex h-full flex-col text-left">
                                    {service.media[0] ? (
                                        <div className="aspect-[4/3] overflow-hidden border-b">
                                            <img src={service.media[0].url} alt={service.name} className="size-full object-cover" />
                                        </div>
                                    ) : null}
                                    <CardHeader>
                                        <Badge variant="secondary">{service.category_label}</Badge>
                                        <CardTitle>{service.name}</CardTitle>
                                        {service.description ? (
                                            <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                                        ) : null}
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3">
                                        {servicePriceSummary(service, copy) ? (
                                            <div className="flex flex-wrap items-center gap-2 font-medium">
                                                {servicePriceSummary(service, copy)?.hasMultiplePrices ? (
                                                    <>
                                                        <span>{servicePriceSummary(service, copy)?.count}</span>
                                                        <span className="text-muted-foreground">&middot;</span>
                                                    </>
                                                ) : null}
                                                <span>{servicePriceSummary(service, copy)?.price}</span>
                                            </div>
                                        ) : null}
                                    </CardContent>
                                    <CardFooter className="mt-auto justify-between text-sm text-muted-foreground">
                                        <span>{copy.view_service}</span>
                                        <ArrowRightIcon aria-hidden="true" />
                                    </CardFooter>
                                </Link>
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
