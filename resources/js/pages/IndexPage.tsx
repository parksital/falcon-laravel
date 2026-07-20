import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import PublicLayout from '@/layouts/public/public-layout';
import { Head } from '@inertiajs/react';

type Service = {
    id: number;
    name: string;
    category_label: string;
    description: string | null;
    price_in_minor: number | null;
    unit: string | null;
    vendor: {
        name: string | null;
    };
};

type IndexPageProps = {
    services: Service[];
    copy: Record<string, string>;
};

function interpolate(value: string, replacements: Record<string, string>) {
    return Object.entries(replacements).reduce(
        (result, [key, replacement]) => result.replace(`:${key}`, replacement),
        value,
    );
}

function formatPriceInMinor(priceInMinor: number | null, copy: IndexPageProps['copy']) {
    if (priceInMinor === null) return copy.price_not_set;

    return `€${new Intl.NumberFormat('nl-NL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(priceInMinor / 100)}`;
}

function getServiceUnitLabel(unit: string | null, copy: IndexPageProps['copy']) {
    if (!unit) return copy.unit_not_set;

    return copy[`service_unit_${unit}`] || unit;
}

export default function IndexPage({ services, copy }: IndexPageProps) {
    return (
        <PublicLayout>
            <Head title={copy.title} />

            <main className="container mx-auto flex min-h-screen w-full flex-1 flex-col gap-6 p-6">
                <h1 className="text-2xl font-semibold">{copy.heading}</h1>

                {services.length > 0 ? (
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {services.map((service) => (
                            <Card key={service.id}>
                                <CardHeader>
                                    <Badge variant="secondary">{service.category_label}</Badge>
                                    <CardTitle>{service.name}</CardTitle>
                                    <CardDescription>
                                        {interpolate(copy.by_vendor, {
                                            vendor: service.vendor.name || copy.vendor_not_set,
                                        })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <p className="font-medium">
                                        {formatPriceInMinor(service.price_in_minor, copy)}{' '}
                                        {interpolate(copy.per_unit, {
                                            unit: getServiceUnitLabel(service.unit, copy),
                                        })}
                                    </p>
                                    {service.description ? (
                                        <p className="text-muted-foreground">
                                            {service.description}
                                        </p>
                                    ) : null}
                                </CardContent>
                            </Card>
                        ))}
                    </section>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>{copy.empty_title}</CardTitle>
                            <CardDescription>{copy.empty_description}</CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </main>
        </PublicLayout>
    );
}
