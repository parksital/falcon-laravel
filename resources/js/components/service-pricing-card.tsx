import { Badge } from '@/components/ui/badge';

interface ServicePricingCardFeature {
    key: string | number;
    label: string;
    value?: string | null;
}

interface ServicePricingCardProps {
    title: string;
    formattedPrice: string;
    priceLabel?: string | null;
    description?: string | null;
    features?: ServicePricingCardFeature[];
}

export function ServicePricingCard({
    title,
    formattedPrice,
    priceLabel,
    description,
    features = [],
}: ServicePricingCardProps) {

    return (
        <div className="flex flex-col gap-2 border p-4">

            {title ? (
                <h3 className="text-base font-semibold">{title}</h3>
            ) : null}

            <div className='flex items-center gap-2'>
                <p className="text-sm font-medium">{formattedPrice}</p>

                {priceLabel ? (
                    <Badge variant="secondary">{priceLabel}</Badge>
                ) : null}
            </div>


            {features.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {features.map((feature) => (
                        <Badge key={feature.key} variant="outline">
                            {feature.value ? `${feature.label}: ${feature.value}` : feature.label}
                        </Badge>
                    ))}
                </div>
            ) : null}

            {description ? (
                <p className="whitespace-pre-line text-sm/relaxed text-muted-foreground">{description}</p>
            ) : null}
        </div>
    );
}
