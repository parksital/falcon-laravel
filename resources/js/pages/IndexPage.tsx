import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { toggleVariants } from '@/components/ui/toggle';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import PublicLayout from '@/layouts/public/public-layout';
import { ServiceCard, type ServiceCardService } from '@/components/service-card';
import { ServiceListItem } from '@/components/service-list-item';
import { home, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CaretRightIcon, ImageIcon, MapPinSimpleIcon, SealCheckIcon, StorefrontIcon } from '@phosphor-icons/react';

type Vendor = { name: string; location: string | null; logo_url: string | null; url: string };

function VendorCard({ vendor }: { vendor: Vendor }) {
    return (
        <Link href={vendor.url} className="flex items-center gap-3 rounded-xl border bg-card p-3 text-card-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:p-4">
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground sm:size-12">
                {vendor.logo_url ? <img src={vendor.logo_url} alt={vendor.name} className="size-full object-cover" /> : <ImageIcon aria-hidden="true" className="size-5" />}
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                <span className="min-w-0 truncate text-sm font-medium text-card-foreground sm:text-base">{vendor.name}</span>
                {vendor.location ? (
                    <>
                        <span aria-hidden="true">·</span>
                        <MapPinSimpleIcon aria-hidden="true" className="size-3 shrink-0 sm:size-3.5" />
                        <span className="shrink-0">{vendor.location}</span>
                    </>
                ) : null}
            </span>
            <CaretRightIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground sm:hidden" />
        </Link>
    );
}

type IndexPageProps = {
    services: ServiceCardService[];
    categories: { value: string; label: string; slug: string }[];
    category_counts: { value: string; label: string; count: number; url: string }[];
    service_count: number;
    vendor_count: number;
    verified_vendors: Vendor[];
    selectedCategory: string | null;
    copy: Record<string, string>;
};

export default function IndexPage({ services, categories, category_counts, service_count, vendor_count, verified_vendors, selectedCategory, copy }: IndexPageProps) {
    const isMobile = useMediaQuery('(max-width: 640px)');
    const { name } = usePage<SharedData>().props;
    const selectedCategoryLabel = categories.find((category) => category.value === selectedCategory)?.label ?? selectedCategory;
    const categoryTitle = selectedCategoryLabel ? copy.category_title.replace(':category', selectedCategoryLabel) : null;
    const categoryGroups = categories
        .map((category) => ({ ...category, services: services.filter((service) => service.category === category.value) }))
        .filter((categoryGroup) => categoryGroup.services.length > 0);

    return (
        <PublicLayout>
            <Head title={categoryTitle ?? copy.title}>
                <meta name="description" content={selectedCategoryLabel ? copy.category_meta_description.replace(':category', selectedCategoryLabel) : copy.meta_description} />
            </Head>

            <main className="flex min-h-[calc(100vh-4rem)] w-full flex-1 flex-col">
                <div id="services" className="container mx-auto flex flex-col gap-8 px-4 pt-8 pb-12 sm:gap-12 sm:px-6 sm:pt-12 sm:pb-16">
                    <section className="flex flex-col items-center gap-2 text-center sm:gap-3">
                        <h1 className="max-w-3xl text-[clamp(2rem,5vw,3rem)]/[1.15] font-semibold tracking-tight text-balance sm:leading-[1.1]">{copy.title}</h1>
                        <p className="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">{copy.hero_description.replace(':services', String(service_count)).replace(':vendors', String(vendor_count))}</p>
                    </section>

                    <div className="sticky top-[calc(3.5rem+1px)] z-[5] -mx-4 -mt-4 border-b bg-background sm:static sm:mx-0 sm:-mt-6 sm:border-0 sm:bg-transparent">
                        <nav aria-label={copy.categories_heading} className="flex gap-2 overflow-x-auto px-4 py-2 whitespace-nowrap [scrollbar-width:none] [mask-image:linear-gradient(to_right,#000_calc(100%-40px),transparent)] sm:flex-wrap sm:justify-center sm:overflow-visible sm:p-0 sm:[mask-image:none]">
                            <Link href={home()} aria-current={selectedCategory === null ? 'page' : undefined} className={cn(toggleVariants({ variant: 'outline', size: isMobile ? 'lg' : 'default' }), 'shrink-0 gap-1.5 aria-[current=page]:bg-muted')}>
                                {copy.category_all}
                                <span className="text-muted-foreground tabular-nums">{service_count}</span>
                            </Link>
                            {category_counts.map((category) => (
                                <Link key={category.value} href={category.url} aria-current={category.value === selectedCategory ? 'page' : undefined} className={cn(toggleVariants({ variant: 'outline', size: isMobile ? 'lg' : 'default' }), 'shrink-0 gap-1.5 aria-[current=page]:bg-muted')}>
                                    {category.label}
                                    <span className="text-muted-foreground tabular-nums">{category.count}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {selectedCategoryLabel && services.length === 0 ? (
                        <Empty className="border">
                            <EmptyMedia variant="icon">
                                <StorefrontIcon />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle>{copy.category_empty_title.replace(':category', selectedCategoryLabel)}</EmptyTitle>
                                <EmptyDescription>{copy.category_empty_description}</EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button onClick={() => router.visit(register())}>{copy.cta_button}</Button>
                            </EmptyContent>
                        </Empty>
                    ) : null}

                    {services.length === 0 && !selectedCategoryLabel ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>{copy.empty_title}</CardTitle>
                                <CardDescription>{copy.empty_description}</CardDescription>
                            </CardHeader>
                        </Card>
                    ) : null}

                    {categoryGroups.map((categoryGroup) => (
                        <section key={categoryGroup.value} id={categoryGroup.slug} aria-labelledby={`category-${categoryGroup.slug}`} className="flex flex-col gap-2 sm:gap-3">
                            <h2 id={`category-${categoryGroup.slug}`} className="flex items-baseline gap-2 text-lg font-semibold text-balance">
                                {categoryGroup.label}
                                <span className="text-sm font-normal text-muted-foreground tabular-nums">{categoryGroup.services.length}</span>
                            </h2>
                            {isMobile ? (
                                <div className="flex flex-col overflow-hidden bg-card ring-1 ring-foreground/10">
                                    {categoryGroup.services.map((service) => (
                                        <ServiceListItem key={service.id} copy={copy} service={service} />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                    {categoryGroup.services.map((service) => (
                                        <Link key={service.id} href={service.url} className="flex flex-col self-start text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                            <ServiceCard copy={copy} service={service} />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                    ))}

                    {verified_vendors.length > 0 ? (
                        <section className="flex flex-col gap-2 sm:gap-3">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-balance">
                                <SealCheckIcon aria-hidden="true" className="size-5 shrink-0 text-primary" weight="fill" />
                                {copy.verified_vendors_heading}
                            </h2>
                            <p className="text-sm text-pretty text-muted-foreground">{copy.verified_vendors_description.replace(':appName', name)}</p>
                            <div className="mt-1 grid gap-2 sm:mt-0 sm:grid-cols-2 sm:gap-3">
                                {verified_vendors.map((vendor) => (
                                    <VendorCard key={vendor.url} vendor={vendor} />
                                ))}
                            </div>
                        </section>
                    ) : null}

                    <Card className="gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex min-w-0 flex-col gap-1 sm:flex-[1_1_20rem]">
                            <CardTitle className="text-balance">{copy.cta_title}</CardTitle>
                            <CardDescription className="text-pretty">{copy.cta_description}</CardDescription>
                        </div>
                        <Button size={isMobile ? 'lg' : 'default'} onClick={() => router.visit(register())}>{copy.cta_button}</Button>
                    </Card>
                </div>
            </main>
        </PublicLayout>
    );
}
