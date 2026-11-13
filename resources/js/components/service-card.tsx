import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type Service } from '@/pages/public-booking/types';
import { ArrowRightIcon, ImageIcon, MapPinSimpleIcon, SealCheckIcon, StorefrontIcon } from '@phosphor-icons/react';

export type ServiceCardService = Service & { vendor_location: string };

type ServiceCardProps = {
    copy: Record<string, string>;
    service: ServiceCardService;
};

export function ServiceCard({ copy, service }: ServiceCardProps) {
    const lowestPrice = service.pricing_options.toSorted((first, second) => first.price_in_minor - second.price_in_minor)[0];

    return (
        <Card id={`service-${service.public_id}`} className="rounded-none pt-0 transition-shadow hover:ring-foreground/25">
            <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden border-b bg-muted text-muted-foreground">
                {service.media[0] ? (
                    <img src={service.media[0].url} alt={service.name} className="size-full object-cover" />
                ) : (
                    <ImageIcon aria-hidden="true" className="size-7" />
                )}
            </div>

            <CardHeader>
                <CardTitle className="line-clamp-2 text-balance">{service.name}</CardTitle>
                <span className="flex min-w-0 items-center gap-1 whitespace-nowrap text-muted-foreground">
                    <StorefrontIcon aria-hidden="true" className="size-3 shrink-0" />
                    <span className="truncate">{service.vendor_name}</span>
                </span>
                {service.vendor_location ? (
                    <span className="flex min-w-0 items-center gap-1 whitespace-nowrap text-muted-foreground">
                        <MapPinSimpleIcon aria-hidden="true" className="size-3 shrink-0" />
                        <span className="truncate">{service.vendor_location}</span>
                    </span>
                ) : null}
                {service.vendor_is_claimed ? (
                    <span className="flex items-center gap-1 font-medium">
                        <SealCheckIcon aria-hidden="true" weight="fill" className="size-3 shrink-0 text-primary" />
                        {copy.bookable_directly}
                    </span>
                ) : null}
            </CardHeader>

            {lowestPrice ? (
                <CardContent className="flex flex-wrap items-baseline gap-x-1 text-muted-foreground">
                    <span className="text-sm font-semibold whitespace-nowrap text-card-foreground tabular-nums">
                        {service.pricing_options.length > 1 ? `${copy.starting_from} ${lowestPrice.formatted_price}` : lowestPrice.formatted_price}
                    </span>
                    {lowestPrice.pricing_unit_label ? <span className="whitespace-nowrap">{copy.per_unit.replace(':unit', lowestPrice.pricing_unit_label.toLocaleLowerCase())}</span> : null}
                </CardContent>
            ) : null}

            <CardFooter className="justify-between text-muted-foreground">
                <span>{copy.view_service}</span>
                <ArrowRightIcon aria-hidden="true" />
            </CardFooter>
        </Card>
    );
}
