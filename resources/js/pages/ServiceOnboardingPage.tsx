import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import EmptyLayout from '@/layouts/empty-layout';
import { update as updateLocale } from '@/routes/locale';
import { store } from '@/routes/onboarding/service';
import { SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckIcon, GlobeIcon } from '@phosphor-icons/react';

interface ServiceOnboardingPageProps {
    vendor: {
        name: string;
    };
    serviceCategories: {
        value: string;
        label: string;
    }[];
    pricingStructuresByCategory: Record<string, {
        value: string;
        label: string;
    }[]>;
    copy: Record<string, string>;
}

function formatPriceInMinorValue(priceInMinor: string) {
    return `€${new Intl.NumberFormat('nl-NL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(priceInMinor) / 100)}`;
}

function formatPriceInMinorDescription(priceInMinor: string) {
    return formatPriceInMinorValue(priceInMinor || '0');
}

export default function ServiceOnboardingPage({
    vendor,
    serviceCategories,
    pricingStructuresByCategory,
    copy,
}: ServiceOnboardingPageProps) {
    const form = useForm({
        service_name: '',
        service_category: '',
        service_custom_category: '',
        service_description: '',
        service_price_in_minor: '',
        service_unit: '',
    });
    const { layoutCopy, locale } = usePage<SharedData>().props;
    const { data, errors, processing } = form;
    const selectedCategory = serviceCategories.find((category) => category.value === data.service_category);
    const pricingStructures = pricingStructuresByCategory[data.service_category] || [];
    const selectedUnit = pricingStructures.find((pricingStructure) => pricingStructure.value === data.service_unit);
    const serviceCategoryLabel = data.service_category === 'other'
        ? data.service_custom_category || selectedCategory?.label
        : selectedCategory?.label;

    const canSubmit = data.service_category
        && (data.service_category !== 'other' || data.service_custom_category.trim())
        && data.service_name.trim()
        && data.service_price_in_minor
        && data.service_unit;

    return (
        <EmptyLayout>
            <Head title={copy.title} />

            <main className="relative grid min-h-dvh w-full grid-cols-2">
                <div className="absolute top-6 right-6">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" size="sm">
                                <GlobeIcon data-icon="inline-start" />
                                {locale === 'nl' ? layoutCopy.language_dutch : layoutCopy.language_english}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{layoutCopy.language}</DropdownMenuLabel>
                            <DropdownMenuRadioGroup
                                value={locale}
                                onValueChange={(nextLocale) => {
                                    if (nextLocale !== locale) {
                                        router.patch(updateLocale.url(), { locale: nextLocale }, {
                                            preserveScroll: true,
                                            preserveState: true,
                                        });
                                    }
                                }}
                            >
                                <DropdownMenuRadioItem value="en">
                                    {layoutCopy.language_english}
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="nl">
                                    {layoutCopy.language_dutch}
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <section className="order-2 mx-auto flex w-full max-w-xl flex-col items-start justify-center gap-6 px-6 py-8 lg:px-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-xl font-medium">
                            {copy.heading.replace(':business_name', vendor.name)}
                        </h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {copy.description}
                        </p>
                    </div>

                    <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.submit(store());
                    }}
                    inert={processing ? true : undefined}
                    className="flex w-full flex-col gap-6"
                >
                    <FieldGroup>
                        <Field data-invalid={errors.service_category ? true : undefined}>
                            <FieldLabel>{copy.category_label}</FieldLabel>
                            <Select
                                value={data.service_category}
                                onValueChange={(value) => form.setData({
                                    ...data,
                                    service_category: value,
                                    service_custom_category: value === 'other' ? data.service_custom_category : '',
                                    service_unit: pricingStructuresByCategory[value]?.some((pricingStructure) => pricingStructure.value === data.service_unit)
                                        ? data.service_unit
                                        : pricingStructuresByCategory[value]?.[0]?.value || '',
                                })}
                            >
                                <SelectTrigger className="w-full" aria-invalid={Boolean(errors.service_category)}>
                                    <SelectValue placeholder={copy.category_placeholder} />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectGroup>
                                        {serviceCategories.map((category) => (
                                            <SelectItem key={category.value} value={category.value}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <FieldError>{errors.service_category}</FieldError>
                        </Field>

                        {data.service_category === 'other' ? (
                            <Field data-invalid={errors.service_custom_category ? true : undefined}>
                                <FieldLabel htmlFor="service-custom-category">
                                    {copy.custom_category_label}
                                </FieldLabel>
                                <Input
                                    id="service-custom-category"
                                    value={data.service_custom_category}
                                    onChange={(event) => form.setData('service_custom_category', event.target.value)}
                                    maxLength={120}
                                    aria-invalid={Boolean(errors.service_custom_category)}
                                />
                                <FieldError>{errors.service_custom_category}</FieldError>
                            </Field>
                        ) : null}

                        <Field data-invalid={errors.service_name ? true : undefined}>
                            <FieldLabel htmlFor="service-name">{copy.service_name_label}</FieldLabel>
                            <Input
                                id="service-name"
                                value={data.service_name}
                                onChange={(event) => form.setData('service_name', event.target.value)}
                                maxLength={120}
                                placeholder={copy.service_name_placeholder}
                                aria-invalid={Boolean(errors.service_name)}
                            />
                            <FieldError>{errors.service_name}</FieldError>
                        </Field>

                        <Field data-invalid={errors.service_description ? true : undefined}>
                            <FieldLabel htmlFor="service-description">{copy.service_description_label}</FieldLabel>
                            <Textarea
                                id="service-description"
                                value={data.service_description}
                                onChange={(event) => form.setData('service_description', event.target.value)}
                                maxLength={2000}
                                placeholder={copy.service_description_placeholder}
                                aria-invalid={Boolean(errors.service_description)}
                            />
                            <FieldError>{errors.service_description}</FieldError>
                        </Field>

                        <Field>
                            <FieldLabel>{copy.price_section_label}</FieldLabel>
                            <FieldDescription>{copy.price_section_description}</FieldDescription>

                            <div className="grid grid-cols-[minmax(0,1fr)_12rem] gap-2">
                                <Field data-invalid={errors.service_price_in_minor ? true : undefined}>
                                    <FieldLabel htmlFor="service-price">{copy.price_label}</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            id="service-price"
                                            inputMode="numeric"
                                            type="text"
                                            placeholder={copy.price_placeholder}
                                            value={data.service_price_in_minor}
                                            onChange={(event) => form.setData('service_price_in_minor', event.target.value.replace(/\D/g, ''))}
                                            aria-invalid={Boolean(errors.service_price_in_minor)}
                                        />
                                        <InputGroupAddon className='text-muted-foreground' align="inline-end">
                                            {formatPriceInMinorDescription(data.service_price_in_minor)}
                                        </InputGroupAddon>
                                    </InputGroup>
                                    <FieldError>{errors.service_price_in_minor}</FieldError>
                                </Field>

                                <Field data-invalid={errors.service_unit ? true : undefined}>
                                    <FieldLabel>{copy.unit_label}</FieldLabel>
                                    <Select value={data.service_unit} onValueChange={(value) => form.setData('service_unit', value)}>
                                        <SelectTrigger className="w-full" aria-invalid={Boolean(errors.service_unit)}>
                                            <SelectValue placeholder={copy.unit_placeholder} />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectGroup>
                                                {pricingStructures.map((pricingStructure) => (
                                                    <SelectItem key={pricingStructure.value} value={pricingStructure.value}>
                                                        {pricingStructure.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{errors.service_unit}</FieldError>
                                </Field>
                            </div>
                        </Field>
                    </FieldGroup>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={!canSubmit || processing}
                        >
                            {processing ? <Spinner /> : <CheckIcon data-icon="inline-start" />}
                            {copy.submit}
                        </Button>
                    </div>
                </form>
                </section>

                <aside className="order-1 flex w-full items-center bg-muted/30 py-8 px-8">
                    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
                        <Card className="h-full">
                            <CardContent className="flex flex-col gap-0">
                                <Badge variant="secondary">{serviceCategoryLabel || copy.category_label}</Badge>

                                {data.service_name && (
                                    <h1 className='text-2xl font-bold'>{data.service_name}</h1>
                                )}

                                {data.service_description && (
                                    <p className='text-sm text-muted-foreground whitespace-pre-line'>{data.service_description}</p>
                                )}

                                {data.service_price_in_minor && (
                                    <div className="mt-4 flex flex-col gap-1">

                                        <p className='font-light font-mono text-pl'>
                                            <span className='font-medium'>{formatPriceInMinorValue(data.service_price_in_minor)}</span>
                                            <span className=''>{selectedUnit ? ` / ${selectedUnit.label}` : ''}</span>
                                        </p>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter>
                                {copy.preview_by_vendor.replace(":business_name", vendor.name)}
                            </CardFooter>
                        </Card>
                    </div>
                </aside>
            </main>
        </EmptyLayout>
    );
}
