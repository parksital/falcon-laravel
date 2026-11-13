import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { toggleVariants } from '@/components/ui/toggle';
import { useInitials } from '@/hooks/use-initials';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import PublicLayout from '@/layouts/public/public-layout';
import { ServiceCard, type ServiceCardService } from '@/components/service-card';
import { ServiceListItem } from '@/components/service-list-item';
import { home, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { SealCheckIcon, StorefrontIcon } from '@phosphor-icons/react';

type Vendor = { name: string; location: string | null; logo_url: string | null; url: string };

function VendorCard({ vendor, isFoundByHuurMaar, copy }: { vendor: Vendor; isFoundByHuurMaar: boolean; copy: Record<string, string> }) {
    const getInitials = useInitials();

    return (
        <Link href={vendor.url} className="flex items-start gap-3 rounded-xl border bg-card p-4 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="size-12 shrink-0">
                {vendor.logo_url ? <AvatarImage src={vendor.logo_url} alt={vendor.name} /> : null}
                <AvatarFallback>{getInitials(vendor.name)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col items-start gap-1">
                {isFoundByHuurMaar ? <Badge variant="secondary">{copy.found_by_huurmaar}</Badge> : null}
                <span className="w-full truncate font-medium">{vendor.name}</span>
                {vendor.location ? <span className="w-full truncate text-sm text-muted-foreground">{copy.based_in.replace(':location', vendor.location)}</span> : null}
            </div>
        </Link>
    );
}

type IndexPageProps = {
    services: ServiceCardService[];
    categories: { value: string; label: string; slug: string }[];
    category_counts: { value: string; label: string; count: number; url: string }[];
    service_count: number;
    vendor_count: number;
    new_vendors: (Vendor & { is_claimed: boolean })[];
    verified_vendors: Vendor[];
    selectedCategory: string | null;
    copy: Record<string, string>;
};

export default function IndexPage({ services, categories, category_counts, service_count, vendor_count, new_vendors, verified_vendors, selectedCategory, copy }: IndexPageProps) {
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
                <div id="services" className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-8 pb-12 sm:gap-12 sm:px-6 sm:pt-12 sm:pb-16">
                    <section className="flex flex-col items-center gap-2 text-center sm:gap-3">
                        <h1 className="max-w-3xl text-[2rem]/[1.15] font-semibold tracking-tight text-balance sm:text-5xl/[1.1]">{copy.title}</h1>
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
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {categoryGroup.services.map((service) => (
                                        <Link key={service.id} href={service.url} className="flex flex-col self-start text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                            <ServiceCard copy={copy} service={service} />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                    ))}

                    {new_vendors.length > 0 ? (
                        <section className="flex flex-col gap-3">
                            <h2 className="text-lg font-semibold">{copy.new_vendors_heading.replace(':appName', name)}</h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {new_vendors.map((vendor) => (
                                    <VendorCard key={vendor.url} vendor={vendor} isFoundByHuurMaar={!vendor.is_claimed} copy={copy} />
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {verified_vendors.length > 0 ? (
                        <section className="flex flex-col gap-3">
                            <h2 className="flex items-center gap-2 text-lg font-semibold">
                                <SealCheckIcon className="size-5 shrink-0 text-primary" weight="fill" />
                                {copy.verified_vendors_heading}
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {verified_vendors.map((vendor) => (
                                    <VendorCard key={vendor.url} vendor={vendor} isFoundByHuurMaar={false} copy={copy} />
                                ))}
                            </div>
                        </section>
                    ) : null}

                    <Card>
                        <CardHeader>
                            <CardTitle>{copy.cta_title}</CardTitle>
                            <CardDescription>{copy.cta_description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto justify-end">
                            <Button onClick={() => router.visit(register())}>
                                {copy.cta_button}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </PublicLayout>
    );
}
