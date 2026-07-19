import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';

type VendorProfilePageProps = {
    vendor: {
        name: string;
        location: string;
        short_description: string | null;
        is_public: boolean;
    };
};

export default function VendorProfilePage({ vendor }: VendorProfilePageProps) {
    return (
        <AppSidebarLayout>
            <Head title="Overview" />

            <main className="mx-auto flex h-full w-full max-w-3xl flex-1 flex-col gap-6 p-6">
                <h1 className="text-2xl font-semibold">Overview</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>{vendor.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <div>
                            <p className="text-muted-foreground">Location</p>
                            <p className="font-medium">{vendor.location}</p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </AppSidebarLayout>
    );
}
