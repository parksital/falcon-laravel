import { type PropsWithChildren } from 'react';

export default function EmptyLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-dvh bg-background text-foreground">
            {children}
        </div>
    );
}
