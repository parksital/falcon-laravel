import { AppShell } from '@/components/app-shell';
import { type ReactNode } from 'react';

type DesktopPublicLayoutProps = {
    children: ReactNode;
};

export default function DesktopPublicLayout({ children }: DesktopPublicLayoutProps) {
    return (
        <AppShell>
            <div className="h-dvh w-full overflow-y-auto overscroll-contain bg-background text-foreground">
                {children}
            </div>
        </AppShell>
    );
}
