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
}

export function ServicePricingCard({
    title,
    formattedPrice,
    priceLabel,
    description,
    features = [],
}: ServicePricingCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2">
                {title ? (
                    <>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <span className="font-mono text-base text-muted-foreground">·</span>
                    </>
                ) : null}
                <p className="font-mono text-base font-light text-muted-foreground">{formattedPrice}</p>
                {priceLabel ? (
                    <Badge variant="secondary" className="ml-auto w-fit">{priceLabel}</Badge>
                ) : null}
            </CardHeader>

            {features.length > 0 ? (
                <CardContent className="flex flex-wrap gap-2">
                    {features.map((feature) => (
                        <Badge key={feature.key} variant="secondary">
                            {feature.value ? `${feature.label}: ${feature.value}` : feature.label}
                        </Badge>
                    ))}
                </CardContent>
            ) : null}

            {description ? (
                <CardFooter className="border-t">
                    <p className="whitespace-pre-line text-sm text-muted-foreground">{description}</p>
                </CardFooter>
            ) : null}
        </Card>
    );
}
