import { AppShell } from '@/components/app-shell';
import { type ReactNode } from 'react';

type DesktopPublicLayoutProps = {
    children: ReactNode;
};

export default function DesktopPublicLayout({ children }: DesktopPublicLayoutProps) {
    return (
        <AppShell>
            <div className="min-h-screen w-full bg-background text-foreground">
                {children}
            </div>
        </AppShell>
    );
}
