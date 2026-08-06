import { useMediaQuery } from '@/hooks/use-media-query';
import DesktopPublicLayout from '@/layouts/public/desktop-public-layout';
import MobilePublicLayout from '@/layouts/public/mobile-public-layout';
import { type ReactNode } from 'react';

type PublicLayoutProps = {
    children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
    const isMobile = useMediaQuery('(max-width: 640px)');

    return isMobile ? (
        <MobilePublicLayout>{children}</MobilePublicLayout>
    ) : (
        <DesktopPublicLayout>{children}</DesktopPublicLayout>
    );
}
