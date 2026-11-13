import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { SealCheckIcon, StorefrontIcon } from '@phosphor-icons/react';
import { type Vendor } from './types';

type PublicServiceContactCardProps = {
    copy: Record<string, string>;
    vendor: Vendor;
    className?: string;
};

export function PublicServiceContactCard({ copy, vendor, className }: PublicServiceContactCardProps) {
    const hasContactDetails = Boolean(vendor.contact_email || vendor.contact_phone || vendor.website_url);

    return (
        <section id="contact" aria-labelledby={hasContactDetails ? 'contact-heading' : undefined} aria-label={hasContactDetails ? undefined : vendor.name} className={cn('flex flex-col gap-5 bg-card p-4 text-xs/relaxed text-card-foreground ring-1 ring-foreground/10 sm:p-5', className)}>
            <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
                    {vendor.logo_url ? <img src={vendor.logo_url} alt="" className="size-full object-cover" /> : <StorefrontIcon aria-hidden="true" className="size-[18px]" />}
                </span>
                <div className="flex min-w-0 flex-col">
                    <Link href={vendor.url} className="truncate text-sm/snug font-medium underline-offset-3 hover:underline">{vendor.name}</Link>
                    {vendor.is_claimed ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <SealCheckIcon aria-hidden="true" weight="fill" className="size-3 shrink-0 text-primary" />
                            {copy.verified_vendor}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">{copy.found_by_huurmaar}</span>
                    )}
                </div>
            </div>

            {hasContactDetails ? (
                <div className="flex flex-col gap-3 border-t pt-5">
                    <div className="flex flex-col gap-0.5">
                        <h2 id="contact-heading" className="text-sm/snug font-semibold">{copy.contact_heading}</h2>
                        <p className="text-pretty text-muted-foreground">{copy.contact_hint}</p>
                    </div>

                    {vendor.contact_email ? (
                        <Button asChild size="lg" className="h-11 sm:h-10">
                            <a href={`mailto:${vendor.contact_email}`}>{copy.contact_email_label}</a>
                        </Button>
                    ) : null}

                    {vendor.contact_phone || vendor.website_url ? (
                        <div className="grid grid-cols-2 gap-2">
                            {vendor.contact_phone ? (
                                <Button asChild variant="outline" className="h-11 sm:h-9">
                                    <a href={`tel:${vendor.contact_phone}`}>{copy.contact_phone_label}</a>
                                </Button>
                            ) : null}
                            {vendor.website_url ? (
                                <Button asChild variant="outline" className="h-11 sm:h-9">
                                    <a href={vendor.website_url} target="_blank" rel="noopener noreferrer">{copy.contact_website_label}</a>
                                </Button>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </section>
    );
}
