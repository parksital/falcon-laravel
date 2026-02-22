import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Link } from '@inertiajs/react';
import { Globe, Lock } from 'lucide-react';

type BookingPage = {
    id: number;
    title: string;
    description: string | null;
    is_public: boolean;
    slug: string;
};

type AdminBookingPageReadProps = {
    bookingPage: BookingPage | null;
};

export default function AdminBookingPageRead({ bookingPage }: AdminBookingPageReadProps) {
    const publicUrl =
        bookingPage && typeof window !== 'undefined'
            ? `${window.location.origin}/book/${bookingPage.slug}`
            : bookingPage
              ? `/book/${bookingPage.slug}`
              : '';

    return (
        <AppSidebarLayout>
            <main className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl p-6">
                {bookingPage ? (
                    <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <h1 className="text-xl font-semibold text-foreground">
                                {bookingPage.title}
                            </h1>
                            <Button asChild variant="secondary">
                                <Link href="/booking-page/edit">Edit</Link>
                            </Button>
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide">
                                {bookingPage.is_public ? (
                                    <Globe className="h-4 w-4" />
                                ) : (
                                    <Lock className="h-4 w-4" />
                                )}
                                {bookingPage.is_public ? 'Public' : 'Private'}
                            </span>
                            {publicUrl ? (
                                <a
                                    className="font-mono text-xs text-foreground underline-offset-4 hover:underline"
                                    href={publicUrl}
                                >
                                    {publicUrl}
                                </a>
                            ) : null}
                        </div>
                        {bookingPage.description ? (
                            <p className="text-sm text-muted-foreground">
                                {bookingPage.description}
                            </p>
                        ) : null}
                    </section>
                ) : (
                    <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                        No booking page yet.
                    </div>
                )}
            </main>
        </AppSidebarLayout>
    );
}
