import { useMediaQuery } from '@/hooks/use-media-query';
import DesktopPublicBookingLayout from '@/layouts/public/desktop-public-booking-layout';
import MobilePublicBookingLayout from '@/layouts/public/mobile-public-booking-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

type PublicBookingShellProps = {
    breadcrumbs: BreadcrumbItem[];
    children: ReactNode;
    headerAction?: ReactNode;
};

export default function PublicBookingShell({ breadcrumbs, children, headerAction }: PublicBookingShellProps) {
    const isMobile = useMediaQuery('(max-width: 640px)');

    return isMobile ? (
        <MobilePublicBookingLayout breadcrumbs={breadcrumbs} headerAction={headerAction}>
            {children}
        </MobilePublicBookingLayout>
    ) : (
        <DesktopPublicBookingLayout breadcrumbs={breadcrumbs} headerAction={headerAction}>
            {children}
        </DesktopPublicBookingLayout>
    );
}
