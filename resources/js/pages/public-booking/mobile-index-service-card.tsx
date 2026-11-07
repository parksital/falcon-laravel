import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type Service } from '@/pages/public-booking/types';
import { BinocularsIcon } from '@phosphor-icons/react';

type MobileIndexServiceCardProps = {
    copy: Record<string, string>;
    service: Service;
};

export function MobileIndexServiceCard({ copy, service }: MobileIndexServiceCardProps) {
    const lowestPrice = service.pricing_options.toSorted((first, second) => first.price_in_minor - second.price_in_minor)[0];

    return (
        <Card id={`service-${service.public_id}`} className="h-full pt-0">
            <div className="relative aspect-[16/9] w-full overflow-hidden border-b bg-muted/40">
                {service.media[0] ? (
                    <img src={service.media[0].url} alt={service.name} className="size-full object-cover" />
                ) : null}
                {!service.vendor_is_claimed && <Badge variant="secondary" className="absolute top-2 left-2"><BinocularsIcon data-icon="inline-start" />{copy.found_by_huurmaar}</Badge>}
                <Badge variant="secondary" className="absolute bottom-2 left-2">{service.category_label}</Badge>
            </div>

            <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{copy.by_vendor.replace(':vendor', service.vendor_name)}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
                {lowestPrice ? (
                    <span className="font-medium">{service.pricing_options.length > 1 ? `${copy.starting_from} ${lowestPrice.formatted_price}` : lowestPrice.formatted_price}</span>
                ) : null}
            </CardContent>
        </Card>
    );
}
