import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface SettingsPageProps {
    copy: {
        title: string;
        heading: string;
    };
}

export default function SettingsPage({ copy }: SettingsPageProps) {
    return (
        <AppLayout>
            <Head title={copy.title} />

            <main className="mx-auto flex h-full w-full max-w-3xl flex-1 flex-col gap-6 p-6">
                <h1 className="text-2xl font-semibold">{copy.heading}</h1>
            </main>
        </AppLayout>
    );
}
