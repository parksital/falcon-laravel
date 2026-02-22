import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { Globe, Lock } from 'lucide-react';

type BookingPage = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    phone?: string | null;
    email?: string | null;
    is_public: boolean;
};

type Product = {
    id: number;
    name: string;
    description?: string | null;
    created_at: string;
};

type AdminBookingPageProps = {
    bookingPage: BookingPage | null;
    products: Product[];
    selectedProductIds: number[];
};

export default function AdminBookingPage({
    bookingPage,
    products,
    selectedProductIds,
}: AdminBookingPageProps) {
    const form = useForm({
        title: bookingPage?.title ?? '',
        description: bookingPage?.description ?? '',
        phone: bookingPage?.phone ?? '',
        email: bookingPage?.email ?? '',
        is_public: bookingPage?.is_public ?? false,
        product_ids: selectedProductIds ?? [],
    });

    const publicUrl =
        bookingPage && typeof window !== 'undefined'
            ? `${window.location.origin}/book/${bookingPage.slug}`
            : bookingPage
              ? `/book/${bookingPage.slug}`
              : '';

    return (
        <AppSidebarLayout>
            <main className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl p-6">
                <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h1 className="text-xl font-semibold text-foreground">
                        {bookingPage?.title ?? 'Your booking page'}
                    </h1>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide">
                            {form.data.is_public ? (
                                <Globe className="h-4 w-4" />
                            ) : (
                                <Lock className="h-4 w-4" />
                            )}
                            {form.data.is_public ? 'Public' : 'Private'}
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
                    <form
                        className="grid gap-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.patch('/booking-page');
                        }}
                    >
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-foreground" htmlFor="booking-title">
                                Title
                            </label>
                            <Input
                                id="booking-title"
                                value={form.data.title}
                                onChange={(event) => form.setData('title', event.target.value)}
                            />
                            {form.errors.title ? (
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {form.errors.title}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <label
                                className="text-sm font-medium text-foreground"
                                htmlFor="booking-description"
                            >
                                Description
                            </label>
                            <textarea
                                id="booking-description"
                                rows={4}
                                className={cn(
                                    "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none",
                                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                                    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                                )}
                                value={form.data.description}
                                onChange={(event) => form.setData('description', event.target.value)}
                            />
                            {form.errors.description ? (
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {form.errors.description}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-foreground" htmlFor="booking-phone">
                                    Phone
                                </label>
                                <Input
                                    id="booking-phone"
                                    value={form.data.phone}
                                    onChange={(event) => form.setData('phone', event.target.value)}
                                    placeholder="(555) 123-4567"
                                />
                                {form.errors.phone ? (
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {form.errors.phone}
                                    </p>
                                ) : null}
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-foreground" htmlFor="booking-email">
                                    Email
                                </label>
                                <Input
                                    id="booking-email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) => form.setData('email', event.target.value)}
                                    placeholder="events@company.com"
                                />
                                {form.errors.email ? (
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {form.errors.email}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="booking-public"
                                checked={form.data.is_public}
                                onCheckedChange={(value) =>
                                    form.setData('is_public', value === true)
                                }
                            />
                            <label
                                className="text-sm text-foreground"
                                htmlFor="booking-public"
                            >
                                Make booking page public
                            </label>
                        </div>
                        <div className="grid gap-3">
                            <div className="text-sm font-medium text-foreground">
                                Linked products
                            </div>
                            {products.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No products available yet.
                                </p>
                            ) : (
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {products
                                        .slice()
                                        .sort((a, b) => {
                                            const aSelected = form.data.product_ids.includes(a.id) ? 1 : 0;
                                            const bSelected = form.data.product_ids.includes(b.id) ? 1 : 0;
                                            if (aSelected !== bSelected) {
                                                return bSelected - aSelected;
                                            }
                                            return a.name.localeCompare(b.name);
                                        })
                                        .map((product) => {
                                            const checked = form.data.product_ids.includes(product.id);
                                        return (
                                            <label
                                                key={product.id}
                                                className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm"
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(value) => {
                                                        const next = value === true
                                                            ? [...form.data.product_ids, product.id]
                                                            : form.data.product_ids.filter(
                                                                (id) => id !== product.id
                                                            );
                                                        form.setData('product_ids', next);
                                                    }}
                                                />
                                                <span className="space-y-1">
                                                    <span className="block font-medium text-foreground">
                                                        {product.name}
                                                    </span>
                                                    {product.description ? (
                                                        <span className="block text-xs text-muted-foreground">
                                                            {product.description}
                                                        </span>
                                                    ) : null}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div>
                            <Button type="submit" disabled={form.processing}>
                                Save changes
                            </Button>
                        </div>
                    </form>
                    {form.isDirty ? (
                        <div className="sticky bottom-0 flex items-center justify-end border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
                            <Button
                                type="button"
                                onClick={() => form.patch('/booking-page')}
                                disabled={form.processing}
                            >
                                Save
                            </Button>
                        </div>
                    ) : null}
                </section>
            </main>
        </AppSidebarLayout>
    );
}
