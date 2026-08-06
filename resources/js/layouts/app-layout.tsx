import DesktopDashboardLayout from '@/layouts/app/desktop-dashboard-layout';
import MobileDashboardLayout from '@/layouts/app/mobile-dashboard-layout';
import { useMediaQuery } from '@/hooks/use-media-query';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs }: AppLayoutProps) {
    const isMobile = useMediaQuery('(max-width: 640px)');

    return isMobile ? (
        <MobileDashboardLayout breadcrumbs={breadcrumbs}>{children}</MobileDashboardLayout>
    ) : (
        <DesktopDashboardLayout breadcrumbs={breadcrumbs}>{children}</DesktopDashboardLayout>
    );
}
