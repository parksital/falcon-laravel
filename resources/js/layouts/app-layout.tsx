import DesktopDashboardLayout from '@/layouts/app/desktop-dashboard-layout';
import { AppShell } from '@/components/app-shell';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { useMediaQuery } from '@/hooks/use-media-query';
import { type BreadcrumbItem } from '@/types';
import { MonitorIcon } from '@phosphor-icons/react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs }: AppLayoutProps) {
    const isMobile = useMediaQuery('(max-width: 640px)');

    return isMobile ? (
        <AppShell>
            <Empty className="min-h-dvh">
                <EmptyMedia variant="icon">
                    <MonitorIcon />
                </EmptyMedia>
                <EmptyHeader>
                    <EmptyTitle>Dashboard is desktop-only</EmptyTitle>
                    <EmptyDescription className='text-pretty'>
                        Open the dashboard on a larger screen to manage your services and settings.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        </AppShell>
    ) : (
        <DesktopDashboardLayout breadcrumbs={breadcrumbs}>{children}</DesktopDashboardLayout>
    );
}
