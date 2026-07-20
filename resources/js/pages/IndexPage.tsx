import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import PublicLayout from '@/layouts/public/public-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

type Service = {
    id: number;
    name: string;
    category: string;
    category_label: string;
    description: string | null;
    price_in_minor: number | null;
    unit: string | null;
    unit_label: string | null;
    vendor: {
        name: string | null;
    };
};

type IndexPageProps = {
    services: Service[];
    serviceCategories: {
        value: string;
        label: string;
    }[];
    locale: string;
    copy: Record<string, string>;
};

function interpolate(value: string, replacements: Record<string, string>) {
    return Object.entries(replacements).reduce(
        (result, [key, replacement]) => result.replace(`:${key}`, replacement),
        value,
    );
}

function formatPriceInMinor(priceInMinor: number | null, locale: string, copy: IndexPageProps['copy']) {
    if (priceInMinor === null) return copy.price_not_set;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
    }).format(priceInMinor / 100);
}

export default function IndexPage({ services, serviceCategories, locale, copy }: IndexPageProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const filteredServices = selectedCategory
        ? services.filter((service) => service.category === selectedCategory)
        : services;

    return (
        <PublicLayout>
            <Head title={copy.title} />

            <main className="max-w-5xl mx-auto flex min-h-screen w-full flex-1 flex-col gap-10 p-6">
                <section className="flex flex-col gap-4">
                    <h1 className="text-2xl font-semibold">{copy.category_heading}</h1>

                    <ToggleGroup
                        type="single"
                        variant="outline"
                        size="lg"
                        spacing={3}
                        value={selectedCategory ?? 'all'}
                        onValueChange={(value) => setSelectedCategory(value && value !== 'all' ? value : null)}
                        className="flex-wrap"
                    >
                        <ToggleGroupItem value="all" aria-label={copy.all_categories}>
                            {copy.all_categories}
                        </ToggleGroupItem>

                        {serviceCategories.map((serviceCategory) => {
                            return (
                                <ToggleGroupItem
                                    key={serviceCategory.value}
                                    value={serviceCategory.value}
                                    aria-label={serviceCategory.label}
                                >
                                    {serviceCategory.label}
                                </ToggleGroupItem>
                            );
                        })}
                    </ToggleGroup>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold">{copy.heading}</h2>

                    {filteredServices.length > 0 ? (
                        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredServices.map((service) => (
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
                                            {formatPriceInMinor(service.price_in_minor, locale, copy)}{' '}
                                            {interpolate(copy.per_unit, {
                                                unit: service.unit_label || copy.unit_not_set,
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
                                <CardTitle>
                                    {selectedCategory ? copy.empty_filtered_title : copy.empty_title}
                                </CardTitle>
                                <CardDescription>
                                    {selectedCategory ? copy.empty_filtered_description : copy.empty_description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                </section>
            </main>
        </PublicLayout>
    );
}
