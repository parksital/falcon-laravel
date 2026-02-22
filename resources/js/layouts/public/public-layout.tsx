import { AppShell } from '@/components/app-shell';

type PublicLayoutProps = {
    children: React.ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <AppShell>
            <div className="min-h-screen w-full bg-background text-foreground">
                {children}
            </div>
        </AppShell>
    );
}
