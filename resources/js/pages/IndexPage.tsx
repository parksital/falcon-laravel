import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
import { index as indexRoute, login, register } from '@/routes';
import { update as updateLocale } from '@/routes/locale';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { GlobeIcon } from '@phosphor-icons/react';

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
        location: string | null;
    };
    url: string;
};

type IndexPageProps = {
    services: Service[];
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

export default function IndexPage({ services, locale, copy }: IndexPageProps) {
    const { layoutCopy } = usePage<SharedData>().props;

    return (
        <PublicLayout>
            <Head title={copy.title}>
                {copy.meta_description ? (
                    <meta name="description" content={copy.meta_description} />
                ) : null}
            </Head>

            <main className="flex min-h-screen w-full flex-1 flex-col">
                <header className="border-b bg-background">
                    <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-4 px-6">
                        <Link href={indexRoute()} className="flex items-center gap-2 font-heading text-sm font-semibold">
                            {layoutCopy.app_name}
                        </Link>

                        <nav className="ml-auto hidden items-center gap-6 text-xs text-muted-foreground sm:flex">

                        </nav>

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

                        <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => router.visit(login())}>
                            {copy.nav_login}
                        </Button>
                        <Button onClick={() => router.visit(register())}>
                            {copy.nav_register}
                        </Button>
                    </div>
                </header>

                <section id="services" className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-12">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold">{copy.services_heading}</h1>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>{copy.cta_title}</CardTitle>
                            </CardHeader>
                            <CardFooter className="mt-auto justify-end">
                                <Button onClick={() => router.visit(register())}>
                                    {copy.cta_button}
                                </Button>
                            </CardFooter>
                        </Card>

                        {services.map((service) => (
                            <Link key={service.id} href={service.url} className="block">
                                <Card className="h-full transition-colors hover:bg-muted/50">
                                    <CardHeader>
                                        <Badge variant="secondary">{service.category_label}</Badge>
                                        <CardTitle>{service.name}</CardTitle>
                                        <CardDescription>
                                            {interpolate(copy.by_vendor, {
                                                vendor: service.vendor.name || copy.vendor_not_set,
                                            })}
                                            {service.vendor.location ? ` - ${service.vendor.location}` : null}
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
                            </Link>
                        ))}

                        {services.length === 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{copy.empty_title}</CardTitle>
                                    <CardDescription>{copy.empty_description}</CardDescription>
                                </CardHeader>
                            </Card>
                        ) : null}
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
