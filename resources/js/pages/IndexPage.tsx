import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useMediaQuery } from '@/hooks/use-media-query';
import PublicLayout from '@/layouts/public/public-layout';
import { PublicServiceCard } from '@/pages/public-booking/public-service-card';
import { type Service } from '@/pages/public-booking/types';
import { register } from '@/routes';
import { Head, router } from '@inertiajs/react';

type IndexPageProps = {
    services: Service[];
    copy: Record<string, string>;
};

export default function IndexPage({ services, copy }: IndexPageProps) {
    const isMobile = useMediaQuery('(max-width: 640px)');

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
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {! isMobile ? (
                            <Card className="self-start">
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
                        ) : null}

                        {services.map((service) => (
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
                </section>
            </main>
        </PublicLayout>
    );
}
