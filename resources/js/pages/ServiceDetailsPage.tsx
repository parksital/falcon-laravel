import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { overview } from '@/routes';
import { show as showService } from '@/routes/services';
import { Head, setLayoutProps } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { type BreadcrumbItem } from '@/types';

interface ServiceDetailsPageProps {
    vendor: {
        name: string;
    };
    service: {
        id: number;
        name: string;
        description: string | null;
        category_label: string;
    };
    copy: Record<string, string>;
}

type ServiceDetailsPageComponent = ((props: ServiceDetailsPageProps) => ReactNode) & {
    layout?: typeof AppLayout;
};

const ServiceDetailsPage: ServiceDetailsPageComponent = function ServiceDetailsPage({ vendor, service, copy }: ServiceDetailsPageProps) {
    setLayoutProps<{ breadcrumbs: BreadcrumbItem[] }>({
        breadcrumbs: [
            { title: vendor.name, href: overview.url() },
            { title: service.name, href: showService.url(service.id) },
        ],
    });

    return (
        <>
            <Head title={service.name} />

            <main className="container mx-auto flex h-full w-full flex-1 flex-col gap-6 p-6">
                <h1 className="text-2xl font-semibold">{service.name}</h1>

                <Card>
                    <CardHeader>
                        <CardTitle><h2>{copy.details_heading}</h2></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-6 sm:grid-cols-2">
                            <div className="flex flex-col gap-1">
                                <dt className="text-muted-foreground">{copy.vendor_label}</dt>
                                <dd className="font-medium">{vendor.name}</dd>
                            </div>

                            <div className="flex flex-col gap-1">
                                <dt className="text-muted-foreground">{copy.category_label}</dt>
                                <dd><Badge variant="secondary">{service.category_label}</Badge></dd>
                            </div>

                            <div className="flex flex-col gap-1 sm:col-span-2">
                                <dt className="text-muted-foreground">{copy.description_label}</dt>
                                <dd className="whitespace-pre-line">{service.description || copy.description_empty}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle><h2>{copy.pricing_heading}</h2></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{copy.pricing_placeholder}</p>
                    </CardContent>
                </Card>
            </main>
        </>
    );
};

ServiceDetailsPage.layout = AppLayout;

export default ServiceDetailsPage;
