import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';

export default function MerchantDashboardPage() {
    return (
        <AppSidebarLayout>
            <Head title="Dashboard" />

            <main className="mx-auto flex h-full w-full max-w-6xl flex-1 p-6" />
        </AppSidebarLayout>
    );
}
