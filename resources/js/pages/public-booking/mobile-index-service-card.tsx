import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type Service } from '@/pages/public-booking/types';

type MobileIndexServiceCardProps = {
    copy: Record<string, string>;
    service: Service;
};

export function MobileIndexServiceCard({ copy, service }: MobileIndexServiceCardProps) {
    const lowestPrice = service.pricing_options.toSorted((first, second) => first.price_in_minor - second.price_in_minor)[0];

    return (
        <Card id={`service-${service.public_id}`} className="h-full pt-0">
            <div className="aspect-[16/9] w-full overflow-hidden border-b bg-muted/40">
                {service.media[0] ? (
                    <img src={service.media[0].url} alt={service.name} className="size-full object-cover" />
                ) : null}
            </div>

            <CardHeader>
                <Badge variant="secondary">{service.category_label}</Badge>
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
