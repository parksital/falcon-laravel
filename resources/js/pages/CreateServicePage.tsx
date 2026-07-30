import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
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
import AppLayout from '@/layouts/app-layout';
import { store } from '@/routes/services';
import { Head, useForm } from '@inertiajs/react';
import { CheckIcon } from '@phosphor-icons/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PricingOptionForm {
    name: string;
    description: string;
    price_in_minor: string;
    unit: string;
}

interface CreateServicePageProps {
    vendor: {
        name: string;
    };
    serviceCategories: {
        value: string;
        label: string;
    }[];
    serviceUnits: {
        value: string;
        label: string;
    }[];
    copy: Record<string, string>;
}

function formatPriceInMinor(priceInMinor: string) {
    return `€${new Intl.NumberFormat('nl-NL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(priceInMinor || '0') / 100)}`;
}

export default function CreateServicePage({
    vendor,
    serviceCategories,
    serviceUnits,
    copy,
}: CreateServicePageProps) {
    const { data, setData, errors, processing, submit } = useForm({
        name: '',
        category: '',
        custom_category: '',
        description: '',
        pricing_options: [
            {
                name: '',
                description: '',
                price_in_minor: '',
                unit: '',
            },
        ],
    });

    const selectedCategory = serviceCategories.find((category) => category.value === data.category);

    const pricingOption = data.pricing_options[0];
    const selectedPricingUnit = serviceUnits.find((unit) => unit.value === pricingOption.unit);
    const pricingOptionNameError = pricingOptionError('name');
    const pricingOptionDescriptionError = pricingOptionError('description');
    const pricingOptionPriceError = pricingOptionError('price_in_minor');
    const pricingOptionUnitError = pricingOptionError('unit');

    function pricingOptionError(field: keyof PricingOptionForm) {
        return errors[`pricing_options.0.${field}` as keyof typeof errors];
    }

    function updatePricingOption(field: keyof PricingOptionForm, value: string) {
        setData('pricing_options', [
            {
                ...pricingOption,
                [field]: value,
            },
        ]);
    }

    return (
        <AppLayout>
            <Head title={copy.title} />

            <main className="min-h-0 overflow-hidden flex flex-1">
                <section className="min-h-0 h-full overflow-y-auto flex flex-1 flex-col p-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold">{copy.heading}</h1>
                        <p className="text-sm text-muted-foreground">{copy.description}</p>
                    </div>

                    <form
                        className="mt-6 flex max-w-lg flex-col gap-6"
                        inert={processing ? true : undefined}
                        onSubmit={(event) => {
                            event.preventDefault();
                            submit(store());
                        }}
                    >
                        <Card>
                            <CardHeader>
                                <div>
                                    <CardTitle>
                                        {copy.basic_information_label}
                                    </CardTitle>

                                    <CardDescription>
                                        {copy.basic_information_description}
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="service-name">{copy.service_name_label}</FieldLabel>
                                        <Input
                                            id="service-name"
                                            value={data.name}
                                            onChange={(event) => setData('name', event.target.value)}
                                            maxLength={120}
                                            placeholder={copy.service_name_placeholder}
                                            aria-invalid={Boolean(errors.name)}
                                        />
                                        <FieldError>{errors.name}</FieldError>
                                    </Field>

                                    <Field>
                                        <FieldLabel>{copy.category_label}</FieldLabel>
                                        <Select
                                            value={data.category}
                                            onValueChange={(value) => {
                                                setData('category', value);

                                                if (value !== 'other') {
                                                    setData('custom_category', '');
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-full" aria-invalid={Boolean(errors.category)}>
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
                                        <FieldError>{errors.category}</FieldError>
                                    </Field>

                                    {data.category === 'other' ? (
                                        <Field data-invalid={errors.custom_category ? true : undefined}>
                                            <FieldLabel htmlFor="service-custom-category">
                                                {copy.custom_category_input_label}
                                            </FieldLabel>
                                            <Input
                                                id="service-custom-category"
                                                value={data.custom_category}
                                                onChange={(event) => setData('custom_category', event.target.value)}
                                                maxLength={120}
                                                aria-invalid={Boolean(errors.custom_category)}
                                            />
                                            <FieldError>{errors.custom_category}</FieldError>
                                        </Field>
                                    ) : null}

                                    <Field data-invalid={errors.description ? true : undefined}>
                                        <FieldLabel htmlFor="service-description">{copy.service_description_label}</FieldLabel>
                                        <Textarea
                                            id="service-description"
                                            value={data.description}
                                            onChange={(event) => setData('description', event.target.value)}
                                            maxLength={2000}
                                            placeholder={copy.service_description_placeholder}
                                            aria-invalid={Boolean(errors.description)}
                                        />
                                        <FieldError>{errors.description}</FieldError>
                                    </Field>
                                </FieldGroup>
                            </CardContent>
                        </Card>

                        <Card>

                            <CardHeader className="flex flex-row items-start gap-2">
                                <div className='mr-auto'>
                                    <CardTitle>{copy.price_section_label}</CardTitle>
                                    <CardDescription>{copy.price_section_description}</CardDescription>
                                </div>

                            </CardHeader>

                            <CardContent>
                                <FieldGroup>
                                    <FieldSet>
                                        <Field data-invalid={pricingOptionNameError ? true : undefined}>
                                            <FieldLabel htmlFor="pricing-option-name">{copy.pricing_option_name_label}</FieldLabel>
                                            <Input
                                                id="pricing-option-name"
                                                value={pricingOption.name}
                                                onChange={(event) => updatePricingOption('name', event.target.value)}
                                                maxLength={120}
                                                placeholder={copy.pricing_option_legend.replace(':number', '1')}
                                                aria-invalid={Boolean(pricingOptionNameError)}
                                            />
                                            <FieldError>{pricingOptionNameError}</FieldError>
                                        </Field>

                                        <Field data-invalid={pricingOptionDescriptionError ? true : undefined}>
                                            <FieldLabel htmlFor="pricing-option-description">{copy.pricing_option_description_label}</FieldLabel>
                                            <Textarea
                                                id="pricing-option-description"
                                                value={pricingOption.description}
                                                onChange={(event) => updatePricingOption('description', event.target.value)}
                                                maxLength={2000}
                                                placeholder={copy.pricing_option_description_placeholder}
                                                aria-invalid={Boolean(pricingOptionDescriptionError)}
                                            />
                                            <FieldError>{pricingOptionDescriptionError}</FieldError>
                                        </Field>

                                        <FieldGroup className="gap-2">
                                            <FieldGroup className="grid grid-cols-[minmax(0,1fr)_12rem] gap-2">
                                                <FieldLabel>{copy.price_label}</FieldLabel>
                                                <FieldLabel>{copy.unit_label}</FieldLabel>
                                            </FieldGroup>

                                            <FieldGroup className="grid grid-cols-[minmax(0,1fr)_12rem] gap-2">
                                                <Field data-invalid={pricingOptionPriceError ? true : undefined}>
                                                    <InputGroup>
                                                        <InputGroupInput
                                                            id="pricing-option-price"
                                                            inputMode="numeric"
                                                            type="text"
                                                            placeholder={copy.price_placeholder}
                                                            value={pricingOption.price_in_minor}
                                                            onChange={(event) => updatePricingOption('price_in_minor', event.target.value.replace(/\D/g, ''))}
                                                            aria-invalid={Boolean(pricingOptionPriceError)}
                                                        />
                                                        <InputGroupAddon className="text-muted-foreground" align="inline-end">
                                                            {formatPriceInMinor(pricingOption.price_in_minor)}
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                    <FieldError>{pricingOptionPriceError}</FieldError>
                                                </Field>

                                                <Field data-invalid={pricingOptionUnitError ? true : undefined}>
                                                    <Select value={pricingOption.unit} onValueChange={(value) => updatePricingOption('unit', value)}>
                                                        <SelectTrigger id="pricing-option-unit" className="w-full" aria-invalid={Boolean(pricingOptionUnitError)}>
                                                            <SelectValue placeholder={copy.unit_placeholder} />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper">
                                                            <SelectGroup>
                                                                {serviceUnits.map((unit) => (
                                                                    <SelectItem key={unit.value} value={unit.value}>
                                                                        {unit.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    <FieldError>{pricingOptionUnitError}</FieldError>
                                                </Field>
                                            </FieldGroup>
                                        </FieldGroup>
                                    </FieldSet>
                                </FieldGroup>
                            </CardContent>

                        </Card>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                {processing ? <Spinner data-icon="inline-start" /> : <CheckIcon data-icon="inline-start" />}
                                {copy.submit}
                            </Button>
                        </div>
                    </form>
                </section>

                <section className='overflow-y-hidden flex-1 border-x border-sidebar-border/80 bg-muted/30'>
                    <Card className="mt-12 max-w-lg mx-auto">
                        <CardContent className="flex flex-col gap-0">
                            <Badge variant="secondary">
                                {selectedCategory?.label || copy.category_label}
                            </Badge>

                            {data.name && (
                                <h1 className='mt-2 text-2xl font-thin font-mono'>{data.name}</h1>
                            )}

                            {data.description && (
                                <p className='text-sm text-muted-foreground whitespace-pre-line'>{data.description}</p>
                            )}

                            {pricingOption.name || pricingOption.description || pricingOption.price_in_minor || selectedPricingUnit ? (
                                <div className="mt-4 flex flex-col gap-1">
                                    {pricingOption.name ? (
                                        <p className="text-sm font-medium">{pricingOption.name}</p>
                                    ) : null}

                                    {pricingOption.description ? (
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">{pricingOption.description}</p>
                                    ) : null}

                                    {(pricingOption.price_in_minor || selectedPricingUnit) ? (
                                        <p className="text-sm">
                                            {formatPriceInMinor(pricingOption.price_in_minor)}
                                            {selectedPricingUnit ? ` / ${selectedPricingUnit.label}` : null}
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}

                        </CardContent>

                        <CardFooter>
                            {copy.preview_by_vendor.replace(":business_name", vendor.name)}
                        </CardFooter>
                    </Card>
                </section>
            </main>
        </AppLayout>
    );
}
