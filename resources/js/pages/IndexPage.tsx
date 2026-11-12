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
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import PublicLayout from '@/layouts/public/public-layout';
import { DesktopIndexServiceCard } from '@/pages/public-booking/desktop-index-service-card';
import { MobileIndexServiceCard } from '@/pages/public-booking/mobile-index-service-card';
import { type Service } from '@/pages/public-booking/types';
import { home, register } from '@/routes';
import { show as showCategory } from '@/routes/category';
import { Head, Link, router } from '@inertiajs/react';
import { StorefrontIcon } from '@phosphor-icons/react';

type IndexPageProps = {
    services: Service[];
    categories: { value: string; label: string; slug: string }[];
    selectedCategory: string | null;
    copy: Record<string, string>;
};

export default function IndexPage({ services, categories, selectedCategory, copy }: IndexPageProps) {
    const isMobile = useMediaQuery('(max-width: 640px)');
    const selectedCategoryLabel = categories.find((category) => category.value === selectedCategory)?.label ?? selectedCategory;

    return (
        <PublicLayout>
            <Head title={selectedCategoryLabel ? copy.category_title.replace(':category', selectedCategoryLabel) : copy.title}>
                <meta name="description" content={selectedCategoryLabel ? copy.category_meta_description.replace(':category', selectedCategoryLabel) : copy.meta_description} />
            </Head>

            <main className="flex min-h-[calc(100vh-4rem)] w-full flex-1 flex-col">
                <section id="services" className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-12">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold">{copy.services_heading}</h1>
                        <p className="text-muted-foreground">{copy.intro_description}</p>
                    </div>

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
                </section>
            </main>
        </PublicLayout>
    );
}
