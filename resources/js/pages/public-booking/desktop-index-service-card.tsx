import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type Service } from '@/pages/public-booking/types';
import { ArrowRightIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';

type DesktopIndexServiceCardProps = {
    copy: Record<string, string>;
    service: Service;
};

export function DesktopIndexServiceCard({ copy, service }: DesktopIndexServiceCardProps) {
    const lowestPrice = service.pricing_options.toSorted((first, second) => first.price_in_minor - second.price_in_minor)[0];

    return (
        <Card id={`service-${service.public_id}`} className="h-full pt-0 transition-shadow hover:ring-foreground/25">
            <div className="aspect-[16/9] w-full overflow-hidden border-b bg-muted/40">
                {service.media[0] ? (
                    <img src={service.media[0].url} alt={service.name} className="size-full object-cover" />
                ) : null}
            </div>

            <CardHeader>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{service.category_label}</Badge>
                    {!service.vendor_is_claimed && <Badge variant="outline"><MagnifyingGlassIcon data-icon="inline-start" />{copy.found_by_huurmaar}</Badge>}
                </div>
                <CardTitle className="line-clamp-2">{service.name}</CardTitle>
                <CardDescription className="truncate">{copy.by_vendor.replace(':vendor', service.vendor_name)}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-end gap-3">
                {lowestPrice ? (
                    <span className="font-medium">{service.pricing_options.length > 1 ? `${copy.starting_from} ${lowestPrice.formatted_price}` : lowestPrice.formatted_price}</span>
                ) : null}
            </CardContent>
            <CardFooter className="justify-between text-muted-foreground">
                <span>{copy.view_service}</span>
                <ArrowRightIcon aria-hidden="true" />
            </CardFooter>
        </Card>
    );
}
