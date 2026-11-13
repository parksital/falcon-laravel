import { CaretDownIcon, CheckIcon } from '@phosphor-icons/react';
import { type ServicePricingOption } from './types';

type PublicServicePricingCardProps = {
    copy: Record<string, string>;
    pricingOption: ServicePricingOption;
};

export function PublicServicePricingCard({ copy, pricingOption }: PublicServicePricingCardProps) {
    const includedFeatures = pricingOption.features.filter((feature) => feature.is_included);
    const headingId = `pricing-option-${pricingOption.id}`;

    return (
        <article aria-labelledby={headingId} className="flex flex-col gap-4 bg-card p-4 text-card-foreground ring-1 ring-foreground/10 sm:px-6 sm:py-5">
            <div className="flex items-start justify-between gap-4">
                <h3 id={headingId} className="text-base/snug font-semibold">{pricingOption.name}</h3>
                <p className="flex shrink-0 flex-col items-end text-right">
                    <span className="text-lg/snug font-semibold whitespace-nowrap tabular-nums">{pricingOption.formatted_price}</span>
                    <span className="text-xs/relaxed whitespace-nowrap text-muted-foreground">{copy.per_unit.replace(':unit', pricingOption.pricing_unit_label.toLocaleLowerCase())}</span>
                </p>
            </div>

            {includedFeatures.length > 0 ? (
                <ul aria-label={copy.included_label} className="flex flex-col gap-2 text-sm/snug">
                    {includedFeatures.map((feature) => (
                        <li key={feature.id} className="flex items-start gap-2">
                            <CheckIcon aria-hidden="true" className="mt-px size-4 shrink-0 text-primary" />
                            <span>{feature.label}</span>
                        </li>
                    ))}
                </ul>
            ) : null}

            {pricingOption.description ? (
                <p className="border-t pt-4 text-sm/relaxed text-pretty whitespace-pre-line text-muted-foreground">{pricingOption.description}</p>
            ) : null}

            {pricingOption.add_ons.length > 0 ? (
                <details className="group border-t pt-3">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm/snug font-medium sm:min-h-8 [&::-webkit-details-marker]:hidden">
                        <span>{copy.add_ons_heading} ({pricingOption.add_ons.length})</span>
                        <CaretDownIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>

                    <ul className="mt-2 flex flex-col gap-3">
                        {pricingOption.add_ons.map((addOn) => (
                            <li key={addOn.id} className="flex items-start justify-between gap-4">
                                <span className="flex min-w-0 flex-col gap-0.5">
                                    <span className="text-sm/snug">{addOn.name}</span>
                                    {addOn.description ? <span className="text-xs/relaxed text-pretty text-muted-foreground">{addOn.description}</span> : null}
                                </span>
                                <span className="flex shrink-0 flex-col items-end text-right">
                                    <span className="text-sm/snug font-semibold whitespace-nowrap tabular-nums">+ {addOn.formatted_price}</span>
                                    <span className="text-xs/relaxed whitespace-nowrap text-muted-foreground">{copy.per_unit.replace(':unit', addOn.pricing_unit_label.toLocaleLowerCase())}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </details>
            ) : null}
        </article>
    );
}
