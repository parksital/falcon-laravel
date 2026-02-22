import PublicLayout from '@/layouts/public/public-layout';

type BookingPage = {
    id: number;
    title: string;
    description: string | null;
    is_public: boolean;
    slug: string;
    phone?: string | null;
    email?: string | null;
};

type PublicBookingPageProps = {
    bookingPage: BookingPage;
    products: Array<{
        id: number;
        name: string;
        description?: string | null;
    }>;
};

export default function PublicBookingPage({ bookingPage, products }: PublicBookingPageProps) {
    return (
        <PublicLayout>
            <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-12">
                <section className="space-y-2 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-foreground">
                        {bookingPage.title}
                    </h1>
                    {bookingPage.description ? (
                        <p className="text-sm text-muted-foreground">
                            {bookingPage.description}
                        </p>
                    ) : null}
                    {(bookingPage.phone || bookingPage.email) ? (
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                            {bookingPage.phone ? (
                                <a
                                    className="text-foreground underline-offset-4 hover:underline"
                                    href={`tel:${bookingPage.phone}`}
                                >
                                    {bookingPage.phone}
                                </a>
                            ) : null}
                            {bookingPage.email ? (
                                <a
                                    className="text-foreground underline-offset-4 hover:underline"
                                    href={`mailto:${bookingPage.email}`}
                                >
                                    {bookingPage.email}
                                </a>
                            ) : null}
                        </div>
                    ) : null}
                </section>
                {products.length > 0 ? (
                    <section className="space-y-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Services
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {products.map((product) => (
                                <article
                                    key={product.id}
                                    className="rounded-xl border border-border bg-card p-4 shadow-sm"
                                >
                                    <h3 className="text-base font-semibold text-foreground">
                                        {product.name}
                                    </h3>
                                    {product.description ? (
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {product.description}
                                        </p>
                                    ) : null}
                                </article>
                            ))}
                        </div>
                    </section>
                ) : null}
            </main>
        </PublicLayout>
    );
}
