import { type ServiceCardService } from '@/components/service-card';
import { Link } from '@inertiajs/react';
import { CaretRightIcon, ImageIcon, MapPinSimpleIcon, SealCheckIcon, StorefrontIcon } from '@phosphor-icons/react';

type ServiceListItemProps = {
    copy: Record<string, string>;
    service: ServiceCardService;
    showVendor?: boolean;
};

export function ServiceListItem({ copy, service, showVendor = true }: ServiceListItemProps) {
    const lowestPrice = service.pricing_options.toSorted((first, second) => first.price_in_minor - second.price_in_minor)[0];

    return (
        <Link id={`service-${service.public_id}`} href={service.url} className="flex items-center gap-3 p-3 text-xs/normal text-card-foreground outline-none not-first:border-t focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
            <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
                {service.media[0] ? <img src={service.media[0].url} alt={service.name} className="size-full object-cover" /> : <ImageIcon aria-hidden="true" className="size-6" />}
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="line-clamp-2 text-sm/snug font-medium text-balance">{service.name}</span>
                {showVendor ? (
                    <>
                        <span className="flex min-w-0 items-center gap-1 whitespace-nowrap text-muted-foreground">
                            <StorefrontIcon aria-hidden="true" className="size-3 shrink-0" />
                            <span className="truncate">{service.vendor_name}</span>
                            {service.vendor_is_claimed ? (
                                <>
                                    <SealCheckIcon aria-hidden="true" weight="fill" className="size-3 shrink-0 text-primary" />
                                    <span className="sr-only">{copy.verified_vendor}</span>
                                </>
                            ) : null}
                        </span>
                        {service.vendor_location ? (
                            <span className="flex min-w-0 items-center gap-1 whitespace-nowrap text-muted-foreground">
                                <MapPinSimpleIcon aria-hidden="true" className="size-3 shrink-0" />
                                <span className="truncate">{service.vendor_location}</span>
                            </span>
                        ) : null}
                    </>
                ) : null}
                {lowestPrice ? (
                    <span className="mt-0.5 flex flex-wrap items-baseline gap-x-1 text-muted-foreground">
                        <span className="text-sm font-semibold whitespace-nowrap text-card-foreground tabular-nums">
                            {service.pricing_options.length > 1 ? `${copy.starting_from} ${lowestPrice.formatted_price}` : lowestPrice.formatted_price}
                        </span>
                        {lowestPrice.pricing_unit_label ? <span className="whitespace-nowrap">{copy.per_unit.replace(':unit', lowestPrice.pricing_unit_label.toLocaleLowerCase())}</span> : null}
                    </span>
                ) : null}
            </span>

            <CaretRightIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        </Link>
    );
}
