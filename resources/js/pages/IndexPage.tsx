import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import PublicLayout from '@/layouts/public/public-layout';
import { index as indexRoute, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { StorefrontIcon } from '@phosphor-icons/react';
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
    const { layoutCopy } = usePage<SharedData>().props;
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const results = selectedCategory
        ? services.filter((service) => service.category === selectedCategory)
        : services;

    return (
        <PublicLayout>
            <Head title={copy.title} />

            <main className="flex min-h-screen w-full flex-1 flex-col">
                <header className="border-b bg-background">
                    <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-4 px-6">
                        <Link href={indexRoute()} className="flex items-center gap-2 font-heading text-sm font-semibold">
                            {layoutCopy.app_name}
                        </Link>

                        <nav className="ml-auto hidden items-center gap-6 text-xs text-muted-foreground sm:flex">

                        </nav>

                        <Button variant="ghost" className="hidden sm:inline-flex" asChild>
                            <Link href={login()}>{copy.nav_login}</Link>
                        </Button>
                        <Button asChild>
                            <Link href={register()}>{copy.nav_register}</Link>
                        </Button>
                    </div>
                </header>

                <section id="results" className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-12 grid-cols-[320px_1fr]">
                    <aside className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-semibold">{copy.category_heading}</h2>
                        </div>

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
                    </aside>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-2xl font-semibold">{copy.heading}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {interpolate(copy.results_count, {
                                        count: String(results.length),
                                    })}
                                </p>
                            </div>
                        </div>

                        {results.length > 0 ? (
                            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {results.map((service) => (
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
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
