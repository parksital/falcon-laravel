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
import { DesktopIndexServiceCard } from '@/pages/public-booking/desktop-index-service-card';
import { MobileIndexServiceCard } from '@/pages/public-booking/mobile-index-service-card';
import { type Service } from '@/pages/public-booking/types';
import { home, register } from '@/routes';
import { show as showCategory } from '@/routes/category';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ApertureIcon, BalloonIcon, CakeIcon, CameraIcon, FlowerTulipIcon, ForkKnifeIcon, type Icon, MartiniIcon, StorefrontIcon, TagIcon, TruckIcon } from '@phosphor-icons/react';

function resolveCategoryIcon(category: string): Icon {
    switch (category) {
        case 'photobooths':
            return CameraIcon;
        case 'photography':
            return ApertureIcon;
        case 'foodtrucks':
            return TruckIcon;
        case 'catering':
            return ForkKnifeIcon;
        case 'drinks':
            return MartiniIcon;
        case 'sweets':
            return CakeIcon;
        case 'kids_activities':
            return BalloonIcon;
        case 'decor':
            return FlowerTulipIcon;
        default:
            return TagIcon;
    }
}

type IndexPageProps = {
    services: Service[];
    categories: { value: string; label: string; slug: string }[];
    category_counts: { value: string; label: string; count: number; url: string }[];
    new_vendors: { name: string; location: string | null; logo_url: string | null; url: string; is_claimed: boolean }[];
    selectedCategory: string | null;
    copy: Record<string, string>;
};

export default function IndexPage({ services, categories, category_counts, new_vendors, selectedCategory, copy }: IndexPageProps) {
    const isMobile = useMediaQuery('(max-width: 640px)');
    const getInitials = useInitials();
    const { name } = usePage<SharedData>().props;
    const selectedCategoryLabel = categories.find((category) => category.value === selectedCategory)?.label ?? selectedCategory;
    const categoryTitle = selectedCategoryLabel ? copy.category_title.replace(':category', selectedCategoryLabel) : null;

    return (
        <PublicLayout>
            <Head title={categoryTitle ?? copy.title}>
                <meta name="description" content={selectedCategoryLabel ? copy.category_meta_description.replace(':category', selectedCategoryLabel) : copy.meta_description} />
            </Head>

            <main className="flex min-h-[calc(100vh-4rem)] w-full flex-1 flex-col">
                <section id="services" className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-12">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold">{categoryTitle ?? copy.services_heading}</h1>
                        <p className="text-muted-foreground">{copy.intro_description}</p>
                    </div>

                    {category_counts.length > 0 ? (
                        <section className="flex flex-col gap-3">
                            <h2 className="text-lg font-semibold">{copy.categories_heading}</h2>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                {category_counts.map((category) => {
                                    const CategoryIcon = resolveCategoryIcon(category.value);

                                    return (
                                        <Link key={category.value} href={category.url} className="flex flex-col items-center gap-3 rounded-xl border bg-card p-4 text-center outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
                                            <CategoryIcon className="size-10 shrink-0 text-muted-foreground" />
                                            <div className="flex w-full min-w-0 flex-col">
                                                <span className="truncate font-medium">{category.label}</span>
                                                <span className="text-sm text-muted-foreground">{category.count === 1 ? copy.category_service_count_one : copy.category_service_count_other.replace(':count', String(category.count))}</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    ) : null}

                    <nav className="flex flex-wrap gap-2">
                        <Link href={home()} aria-current={selectedCategory === null ? 'page' : undefined} className={cn(toggleVariants({ variant: 'outline' }), 'aria-[current=page]:bg-muted')}>{copy.category_all}</Link>
                        {categories.map((category) => (
                            <Link key={category.value} href={showCategory(category.slug)} aria-current={category.value === selectedCategory ? 'page' : undefined} className={cn(toggleVariants({ variant: 'outline' }), 'aria-[current=page]:bg-muted')}>{category.label}</Link>
                        ))}
                    </nav>

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
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Card className="order-last self-start sm:order-first">
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

                            {services.map((service) => (
                                <Link key={service.id} href={service.url} className="flex h-full flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                    {isMobile ? (
                                        <MobileIndexServiceCard copy={copy} service={service} />
                                    ) : (
                                        <DesktopIndexServiceCard copy={copy} service={service} />
                                    )}
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
                    )}

                    {new_vendors.length > 0 ? (
                        <section className="flex flex-col gap-3">
                            <h2 className="text-lg font-semibold">{copy.new_vendors_heading.replace(':appName', name)}</h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {new_vendors.map((vendor) => (
                                    <Link key={vendor.url} href={vendor.url} className="flex items-start gap-3 rounded-xl border bg-card p-4 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
                                        <Avatar className="size-12 shrink-0">
                                            {vendor.logo_url ? <AvatarImage src={vendor.logo_url} alt={vendor.name} /> : null}
                                            <AvatarFallback>{getInitials(vendor.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex min-w-0 flex-col items-start gap-1">
                                            {!vendor.is_claimed ? <Badge variant="secondary">{copy.found_by_huurmaar}</Badge> : null}
                                            <span className="w-full truncate font-medium">{vendor.name}</span>
                                            {vendor.location ? <span className="w-full truncate text-sm text-muted-foreground">{copy.based_in.replace(':location', vendor.location)}</span> : null}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ) : null}
                </section>
            </main>
        </PublicLayout>
    );
}
