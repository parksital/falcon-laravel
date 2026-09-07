import { AppShell } from '@/components/app-shell';
import { type ReactNode } from 'react';

type MobilePublicLayoutProps = {
    children: ReactNode;
};

export default function MobilePublicLayout({ children }: MobilePublicLayoutProps) {
    return (
        <AppShell>
            <div className="h-dvh w-full overflow-y-auto overscroll-contain bg-background text-foreground">
                {children}
            </div>
        </AppShell>
    );
}
