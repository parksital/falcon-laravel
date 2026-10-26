import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import PublicLayout from '@/layouts/public/public-layout';
import { PublicServiceCard } from '@/pages/public-booking/public-service-card';
import { type Service } from '@/pages/public-booking/types';
import { register } from '@/routes';
import { Head, router } from '@inertiajs/react';
import { StorefrontIcon } from '@phosphor-icons/react';
import { useState } from 'react';

type IndexPageProps = {
    services: Service[];
    categories: { value: string; label: string }[];
    copy: Record<string, string>;
};

export default function IndexPage({ services, categories, copy }: IndexPageProps) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const visibleServices = services.filter((service) => selectedCategory === 'all' || service.category === selectedCategory);

    return (
        <PublicLayout>
            <Head title={copy.title}>
                {copy.meta_description ? (
                    <meta name="description" content={copy.meta_description} />
                ) : null}
            </Head>

            <main className="flex min-h-[calc(100vh-4rem)] w-full flex-1 flex-col">
                <section id="services" className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-12">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold">{copy.services_heading}</h1>
                        <p className="text-muted-foreground">{copy.intro_description}</p>
                    </div>

                    <ToggleGroup
                        type="single"
                        variant="outline"
                        className="flex-wrap"
                        value={selectedCategory}
                        onValueChange={(value) => {
                            if (! value) {
                                return;
                            }

                            setSelectedCategory(value);
                        }}
                    >
                        <ToggleGroupItem value="all">{copy.category_all}</ToggleGroupItem>
                        {categories.map((category) => (
                            <ToggleGroupItem key={category.value} value={category.value}>{category.label}</ToggleGroupItem>
                        ))}
                    </ToggleGroup>

                    {selectedCategory !== 'all' && visibleServices.length === 0 ? (
                        <Empty className="border">
                            <EmptyMedia variant="icon">
                                <StorefrontIcon />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle>{copy.category_empty_title.replace(':category', categories.find((category) => category.value === selectedCategory)?.label ?? selectedCategory)}</EmptyTitle>
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

                            {visibleServices.map((service) => (
                                <PublicServiceCard key={service.id} copy={copy} presentation="mobile" service={service} showFooter={false} />
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
