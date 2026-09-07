import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    variant?: 'default' | 'dashboard';
}

export function ServicePricingCard({
    title,
    formattedPrice,
    priceLabel,
    description,
    features = [],
}: ServicePricingCardProps) {

    return (
        <div className="flex flex-col gap-0 border p-4">

            {title ? (
                <h3 className="text-base">{title}</h3>
            ) : null}

            <div className='flex items-center gap-1'>
                <p className="text-sm">{formattedPrice}</p>

                {priceLabel ? (
                    <Badge variant="secondary">{priceLabel}</Badge>
                ) : null}
            </div>


            {features.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                    {features.map((feature) => (
                        <Badge key={feature.key} variant="outline">
                            {feature.value ? `${feature.label}: ${feature.value}` : feature.label}
                        </Badge>
                    ))}
                </div>
            ) : null}

            {description ? (
                <p className="whitespace-pre-line text-sm text-muted-foreground">{description}</p>
            ) : null}
        </div>
    );
}
