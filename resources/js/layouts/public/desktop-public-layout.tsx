import { AppShell } from '@/components/app-shell';
import { type ReactNode } from 'react';

type DesktopPublicLayoutProps = {
    children: ReactNode;
};

export default function DesktopPublicLayout({ children }: DesktopPublicLayoutProps) {
    return (
        <AppShell>
            <div className="flex h-dvh w-full flex-col overflow-y-auto overscroll-contain bg-background text-foreground lg:bg-gutter">
                {children}
            </div>
        </AppShell>
    );
}
