import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function SettingsPage() {
    return (
        <AppLayout>
            <Head title="Settings" />

            <main className="mx-auto flex h-full w-full max-w-3xl flex-1 flex-col gap-6 p-6">
                <h1 className="text-2xl font-semibold">Settings</h1>
            </main>
        </AppLayout>
    );
}
