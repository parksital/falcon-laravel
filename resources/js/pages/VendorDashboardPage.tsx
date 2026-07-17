import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';

export default function VendorDashboardPage() {
    return (
        <AppSidebarLayout>
            <Head title="Dashboard" />

            <main className="mx-auto flex h-full w-full max-w-3xl flex-1 flex-col gap-6 p-6"></main>
        </AppSidebarLayout>
    );
}
