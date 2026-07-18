import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';

export default function ProductsPage() {
    return (
        <AppSidebarLayout>
            <Head title="Products" />

            <main className="mx-auto flex h-full w-full max-w-3xl flex-1 flex-col gap-6 p-6">
                <h1 className="text-2xl font-semibold">Products</h1>
            </main>
        </AppSidebarLayout>
    );
}
