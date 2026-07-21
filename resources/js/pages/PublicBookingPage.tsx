import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import PublicLayout from '@/layouts/public/public-layout';
import { Head, router } from '@inertiajs/react';

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

function formatPriceInMinor(priceInMinor: number | null, locale: string) {
    if (priceInMinor === null) return null;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
    }).format(priceInMinor / 100);
}

export default function PublicBookingPage({ vendor, services, featuredServiceSlug, locale, seo }: PublicBookingPageProps) {
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
                        <Button variant="outline" onClick={() => router.visit('/index')}>
                            Browse services
                        </Button>
                    </div>
                    {vendor.short_description ? (
                        <p className="max-w-2xl text-sm text-muted-foreground">{vendor.short_description}</p>
                    ) : null}
                </section>

                {services.length > 0 ? (
                    <section className="space-y-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Services
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
                                                {service.unit_label ? ` per ${service.unit_label}` : null}
                                            </p>
                                        ) : null}
                                        <Button variant="outline" onClick={() => router.visit(service.url)}>
                                            View service
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
