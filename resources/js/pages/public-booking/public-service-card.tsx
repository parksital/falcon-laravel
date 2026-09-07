import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ArrowRightIcon } from '@phosphor-icons/react';

export type PublicServiceCardService = {
    id: number;
    public_id: string;
    name: string;
    category_label: string;
    description: string | null;
    url: string;
    pricing_options: {
        price_in_minor: number;
        formatted_price: string;
        pricing_mode: 'fixed' | 'variable';
        pricing_unit_label: string | null;
    }[];
    media: {
        id: number;
        url: string;
    }[];
};

type PublicServiceCardProps = {
    copy: Record<string, string>;
    service: PublicServiceCardService;
};

function interpolate(value: string, replacements: Record<string, string>) {
    return Object.entries(replacements).reduce(
        (result, [key, replacement]) => result.replace(`:${key}`, replacement),
        value,
    );
}

function servicePriceSummary(service: PublicServiceCardService, copy: PublicServiceCardProps['copy']) {
    const lowestPrice = service.pricing_options
        .toSorted((first, second) => first.price_in_minor - second.price_in_minor)
        [0];

    if (! lowestPrice) return null;

    const unit = lowestPrice.pricing_mode === 'variable' && lowestPrice.pricing_unit_label
        ? ` ${interpolate(copy.per_unit, { unit: lowestPrice.pricing_unit_label })}`
        : '';

    return {
        price: `${copy.starting_from} ${lowestPrice.formatted_price}${unit}`,
        count: interpolate(copy.prices_count, {
            count: `${service.pricing_options.length}`,
        }),
        hasMultiplePrices: service.pricing_options.length > 1,
    };
}

export function PublicServiceCard({ copy, service }: PublicServiceCardProps) {
    const priceSummary = servicePriceSummary(service, copy);

    return (
        <Link href={service.url} className="flex h-full flex-col text-left">
            <Card id={`service-${service.public_id}`} className="h-full pt-0">
                <div className="aspect-[16/9] w-full overflow-hidden border-b bg-muted/40">
                    {service.media[0] ? (
                        <img src={service.media[0].url} alt={service.name} className="size-full object-cover" />
                    ) : null}
                </div>

                <CardHeader>
                    <Badge variant="secondary">{service.category_label}</Badge>
                    <CardTitle>{service.name}</CardTitle>
                    {service.description ? (
                        <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                    ) : null}
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                    {priceSummary ? (
                        <div className="flex flex-wrap items-center gap-2 font-medium">
                            {priceSummary.hasMultiplePrices ? (
                                <>
                                    <span>{priceSummary.count}</span>
                                    <span className="text-muted-foreground">&middot;</span>
                                </>
                            ) : null}
                            <span>{priceSummary.price}</span>
                        </div>
                    ) : null}
                </CardContent>

                <CardFooter className="mt-auto justify-between text-sm text-muted-foreground">
                    <span>{copy.view_service}</span>
                    <ArrowRightIcon aria-hidden="true" />
                </CardFooter>
            </Card>
        </Link>
    );
}
