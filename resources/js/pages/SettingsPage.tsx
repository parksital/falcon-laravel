import AppLayout from '@/layouts/app-layout';
import { Head, setLayoutProps } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { type BreadcrumbItem } from '@/types';

interface SettingsPageProps {
    copy: {
        title: string;
        heading: string;
    };
}

type SettingsPageComponent = ((props: SettingsPageProps) => ReactNode) & {
    layout?: typeof AppLayout;
};

const SettingsPage: SettingsPageComponent = function SettingsPage({ copy }: SettingsPageProps) {
    setLayoutProps<{ breadcrumbs: BreadcrumbItem[] }>({
        breadcrumbs: [],
    });

    return (
        <>
            <Head title={copy.title} />

            <main className="mx-auto flex h-full w-full max-w-3xl flex-1 flex-col gap-6 p-6">
                <h1 className="text-2xl font-semibold">{copy.heading}</h1>
            </main>
        </>
    );
};

SettingsPage.layout = AppLayout;

export default SettingsPage;
