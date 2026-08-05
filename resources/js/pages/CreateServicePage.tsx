import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
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
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import EmptyLayout from '@/layouts/empty-layout';
import { overview } from '@/routes';
import { store } from '@/routes/services';
import { SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeftIcon, CheckIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { Fragment } from 'react';

interface PricingOptionForm {
    name: string;
    description: string;
    price: string;
    unit: string;
}

interface CreateServiceForm {
    name: string;
    category: string;
    custom_category: string;
    description: string;
    pricing_structure: string;
    pricing_options: PricingOptionForm[];
}

interface SelectOption {
    value: string;
    label: string;
}

interface PricingStructureOption extends SelectOption {
    unitLabel: string;
}

interface CreateServicePageProps {
    vendor: {
        name: string;
    };
    serviceCategories: SelectOption[];
    pricingStructuresByCategory: Record<string, PricingStructureOption[]>;
    copy: Record<string, string>;
}

function createPricingOption(unit = '', name = ''): PricingOptionForm {
    return {
        name,
        description: '',
        price: '',
        unit,
    };
}

function normalizePrice(value: string) {
    const cleanedValue = value.replace(/[^\d.,]/g, '');
    const decimalSeparatorIndex = cleanedValue.search(/[.,]/);

    if (decimalSeparatorIndex === -1) {
        return cleanedValue;
    }

    return `${cleanedValue.slice(0, decimalSeparatorIndex) || '0'}${cleanedValue[decimalSeparatorIndex]}${cleanedValue.slice(decimalSeparatorIndex + 1).replace(/\D/g, '').slice(0, 2)}`;
}

function priceInMinor(price: string) {
    if (! price.trim()) {
        return '';
    }

    return Math.round(Number(price.replace(',', '.')) * 100);
}

function formatPrice(price: string, locale: string) {
    return new Intl.NumberFormat(locale === 'nl' ? 'nl-NL' : 'en-NL', {
        style: 'currency',
        currency: 'EUR',
    }).format(Number(price.replace(',', '.') || '0'));
}

export default function CreateServicePage({
    vendor,
    serviceCategories,
    pricingStructuresByCategory,
    copy,
}: CreateServicePageProps) {
    const { locale } = usePage<SharedData>().props;

    function defaultPackageName(index: number) {
        return copy.package_legend.replace(':number', String(index + 1));
    }

    function defaultServiceName(category: string, customCategory: string) {
        const categoryName = category === 'other'
            ? customCategory
            : serviceCategories.find((serviceCategory) => serviceCategory.value === category)?.label || '';

        return copy.service_name_placeholder
            .replace(':service_name', categoryName || copy.service_name_placeholder_fallback)
            .replace(':vendor', vendor.name);
    }

    const defaultPricingStructure = pricingStructuresByCategory[serviceCategories[0]?.value]?.[0]?.value || '';
    const { data, setData, errors, processing, submit, transform } = useForm<CreateServiceForm>({
        name: defaultServiceName('', ''),
        category: '',
        custom_category: '',
        description: '',
        pricing_structure: defaultPricingStructure,
        pricing_options: [createPricingOption(
            defaultPricingStructure,
            defaultPricingStructure === 'package' ? defaultPackageName(0) : '',
        )],
    });

    const selectedCategory = serviceCategories.find((category) => category.value === data.category);
    const suggestedServiceName = data.category === 'other' ? data.custom_category : selectedCategory?.label || '';
    const generatedServiceName = defaultServiceName(data.category, data.custom_category);
    const pricingStructures = pricingStructuresByCategory[data.category]
        || pricingStructuresByCategory[serviceCategories[0]?.value]
        || [];
    const selectedPricingStructure = pricingStructures.find((structure) => structure.value === data.pricing_structure);

    function pricingOptionError(index: number, field: 'name' | 'description' | 'price_in_minor') {
        return errors[`pricing_options.${index}.${field}` as keyof typeof errors];
    }

    function changeCategory(category: string) {
        const customCategory = category === 'other' ? data.custom_category : '';
        const pricingStructure = pricingStructuresByCategory[category]?.some((option) => option.value === data.pricing_structure)
            ? data.pricing_structure
            : pricingStructuresByCategory[category]?.[0]?.value || '';

        setData({
            ...data,
            name: ! data.name || data.name === generatedServiceName
                ? defaultServiceName(category, customCategory)
                : data.name,
            category,
            custom_category: customCategory,
            pricing_structure: pricingStructure,
            pricing_options: pricingStructure === data.pricing_structure
                ? data.pricing_options
                : [createPricingOption(
                    pricingStructure,
                    pricingStructure === 'package' ? defaultPackageName(0) : '',
                )],
        });
    }

    function changeCustomCategory(customCategory: string) {
        setData({
            ...data,
            name: ! data.name || data.name === generatedServiceName
                ? defaultServiceName('other', customCategory)
                : data.name,
            custom_category: customCategory,
        });
    }

    function changePricingStructure(pricingStructure: string) {
        if (! pricingStructure) {
            return;
        }

        setData({
            ...data,
            pricing_structure: pricingStructure,
            pricing_options: [createPricingOption(
                pricingStructure,
                pricingStructure === 'package' ? defaultPackageName(0) : '',
            )],
        });
    }

    function updatePricingOption(index: number, field: keyof PricingOptionForm, value: string) {
        setData('pricing_options', data.pricing_options.map((pricingOption, pricingOptionIndex) =>
            pricingOptionIndex === index ? { ...pricingOption, [field]: value } : pricingOption,
        ));
    }

    function addPackage() {
        if (data.pricing_options.length >= 3) {
            return;
        }

        setData('pricing_options', [
            ...data.pricing_options,
            createPricingOption('package', defaultPackageName(data.pricing_options.length)),
        ]);
    }

    function removePackage(index: number) {
        if (data.pricing_options.length === 1) {
            return;
        }

        setData('pricing_options', data.pricing_options
            .map((pricingOption, pricingOptionIndex) => ({ pricingOption, pricingOptionIndex }))
            .filter(({ pricingOptionIndex }) => pricingOptionIndex !== index)
            .map(({ pricingOption, pricingOptionIndex }, nextIndex) => ({
                ...pricingOption,
                name: pricingOption.name === defaultPackageName(pricingOptionIndex)
                    ? defaultPackageName(nextIndex)
                    : pricingOption.name,
            })));
    }

    return (
        <EmptyLayout>
            <Head title={copy.title} />

            <main className="flex h-dvh overflow-hidden">
                <section
                    className="min-h-0 h-full overflow-y-auto flex flex-1 flex-col p-6 [overflow-anchor:none]"
                >
                    <div className="mx-auto flex w-full max-w-lg flex-col items-start gap-2">
                        <Button type="button" variant="link" asChild>
                            <Link href={overview()}>
                                <ArrowLeftIcon data-icon="inline-start" />
                                {copy.back}
                            </Link>
                        </Button>

                        <h1 className="text-2xl font-semibold">{copy.heading.replace(':vendor', vendor.name)}</h1>
                    </div>

                    <form
                        className="mx-auto mt-6 flex w-full max-w-lg flex-col gap-6"
                        inert={processing ? true : undefined}
                        onSubmit={(event) => {
                            event.preventDefault();
                            transform((formData) => ({
                                ...formData,
                                pricing_options: formData.pricing_options.map((pricingOption) => ({
                                    name: pricingOption.name,
                                    description: pricingOption.description,
                                    price_in_minor: priceInMinor(pricingOption.price),
                                    unit: pricingOption.unit,
                                })),
                            }));
                            submit(store());
                        }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>{copy.category_section_label}</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <FieldGroup>
                                    <Field data-invalid={errors.category ? true : undefined}>
                                        <FieldLabel>{copy.category_label}</FieldLabel>
                                        <Select value={data.category} onValueChange={changeCategory}>
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
                                            <FieldLabel htmlFor="service-custom-category">{copy.custom_category_input_label}</FieldLabel>
                                            <Input
                                                id="service-custom-category"
                                                value={data.custom_category}
                                                onChange={(event) => changeCustomCategory(event.target.value)}
                                                maxLength={120}
                                                placeholder={copy.custom_category_placeholder}
                                                aria-invalid={Boolean(errors.custom_category)}
                                            />
                                            <FieldError>{errors.custom_category}</FieldError>
                                        </Field>
                                    ) : null}
                                </FieldGroup>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{copy.service_section_label}</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <FieldGroup>
                                    <Field data-invalid={errors.name ? true : undefined}>
                                        <FieldLabel htmlFor="service-name">{copy.service_name_label}</FieldLabel>
                                        <Input
                                            id="service-name"
                                            value={data.name}
                                            onChange={(event) => setData('name', event.target.value)}
                                            maxLength={120}
                                            placeholder={generatedServiceName}
                                            aria-invalid={Boolean(errors.name)}
                                        />
                                        <FieldError>{errors.name}</FieldError>
                                    </Field>

                                    <Field data-invalid={errors.description ? true : undefined}>
                                        <FieldLabel htmlFor="service-description">{copy.service_description_label}</FieldLabel>
                                        <Textarea
                                            id="service-description"
                                            value={data.description}
                                            onChange={(event) => setData('description', event.target.value)}
                                            maxLength={2000}
                                            placeholder={copy.service_description_placeholder.replace(
                                                ':service',
                                                data.name && data.name !== generatedServiceName
                                                    ? data.name
                                                    : suggestedServiceName || copy.service_description_fallback,
                                            )}
                                            aria-invalid={Boolean(errors.description)}
                                        />
                                        <FieldError>{errors.description}</FieldError>
                                    </Field>
                                </FieldGroup>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{copy.pricing_section_label}</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <Field data-invalid={errors.pricing_structure ? true : undefined}>
                                    <FieldLabel>{copy.price_section_label}</FieldLabel>
                                    <ToggleGroup
                                        className="grid w-full grid-cols-1 sm:grid-cols-3"
                                        type="single"
                                        variant="outline"
                                        value={data.pricing_structure}
                                        onValueChange={changePricingStructure}
                                        aria-label={copy.pricing_structure_label}
                                    >
                                        {pricingStructures.map((pricingStructure) => (
                                            <ToggleGroupItem
                                                className="justify-start"
                                                key={pricingStructure.value}
                                                value={pricingStructure.value}
                                                aria-label={pricingStructure.label}
                                            >
                                                {pricingStructure.label}
                                            </ToggleGroupItem>
                                        ))}
                                    </ToggleGroup>
                                    <FieldError>{errors.pricing_structure}</FieldError>
                                </Field>
                            </CardContent>
                        </Card>

                        {data.pricing_structure === 'package' ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{copy.package_section_label}</CardTitle>
                                    <CardDescription>{copy.package_section_description}</CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <FieldGroup>
                                        {data.pricing_options.map((pricingOption, index) => (
                                            <Fragment key={index}>
                                                {index > 0 ? <Separator /> : null}

                                                <FieldSet>
                                                    <FieldLegend className="sr-only">{copy.package_legend.replace(':number', String(index + 1))}</FieldLegend>

                                                    <Field data-invalid={pricingOptionError(index, 'name') ? true : undefined}>
                                                        <FieldLabel htmlFor={`package-name-${index}`}>{copy.package_name_label}</FieldLabel>
                                                        <Input
                                                            id={`package-name-${index}`}
                                                            value={pricingOption.name}
                                                            onChange={(event) => updatePricingOption(index, 'name', event.target.value)}
                                                            maxLength={120}
                                                            aria-invalid={Boolean(pricingOptionError(index, 'name'))}
                                                        />
                                                        <FieldError>{pricingOptionError(index, 'name')}</FieldError>
                                                    </Field>

                                                    <Field data-invalid={pricingOptionError(index, 'price_in_minor') ? true : undefined}>
                                                        <FieldLabel htmlFor={`package-price-${index}`}>{copy.package_price_label}</FieldLabel>
                                                        <InputGroup>
                                                            <InputGroupAddon className="text-muted-foreground" align="inline-start">
                                                                €
                                                            </InputGroupAddon>
                                                            <InputGroupInput
                                                                id={`package-price-${index}`}
                                                                inputMode="decimal"
                                                                type="text"
                                                                placeholder={copy.price_placeholder}
                                                                value={pricingOption.price}
                                                                onChange={(event) => updatePricingOption(index, 'price', normalizePrice(event.target.value))}
                                                                aria-invalid={Boolean(pricingOptionError(index, 'price_in_minor'))}
                                                            />
                                                        </InputGroup>
                                                        <FieldError>{pricingOptionError(index, 'price_in_minor')}</FieldError>
                                                    </Field>

                                                    <Field data-invalid={pricingOptionError(index, 'description') ? true : undefined}>
                                                        <FieldLabel htmlFor={`package-included-${index}`}>{copy.package_included_label}</FieldLabel>
                                                        <Textarea
                                                            id={`package-included-${index}`}
                                                            value={pricingOption.description}
                                                            onChange={(event) => updatePricingOption(index, 'description', event.target.value)}
                                                            maxLength={2000}
                                                            aria-invalid={Boolean(pricingOptionError(index, 'description'))}
                                                        />
                                                        <FieldError>{pricingOptionError(index, 'description')}</FieldError>
                                                    </Field>

                                                    {data.pricing_options.length > 1 ? (
                                                        <div className="flex justify-end">
                                                            <Button type="button" variant="destructive" size="sm" onClick={() => removePackage(index)}>
                                                                <TrashIcon data-icon="inline-start" />
                                                                {copy.remove_package}
                                                            </Button>
                                                        </div>
                                                    ) : null}
                                                </FieldSet>
                                            </Fragment>
                                        ))}
                                    </FieldGroup>
                                </CardContent>

                                <CardFooter>
                                    <Button type="button" variant="outline" onClick={addPackage} disabled={data.pricing_options.length >= 3}>
                                        <PlusIcon data-icon="inline-start" />
                                        {copy.add_package}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ) : data.pricing_structure ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{copy[`rate_section_${data.pricing_structure}_label`]}</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <FieldGroup>
                                        <Field data-invalid={pricingOptionError(0, 'price_in_minor') ? true : undefined}>
                                            <FieldLabel htmlFor="service-rate">
                                                {copy[`rate_price_${data.pricing_structure}_label`]}
                                            </FieldLabel>
                                            <InputGroup>
                                                <InputGroupAddon className="text-muted-foreground" align="inline-start">
                                                    €
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    id="service-rate"
                                                    inputMode="decimal"
                                                    type="text"
                                                    placeholder={copy.price_placeholder}
                                                    value={data.pricing_options[0].price}
                                                    onChange={(event) => updatePricingOption(0, 'price', normalizePrice(event.target.value))}
                                                    aria-invalid={Boolean(pricingOptionError(0, 'price_in_minor'))}
                                                />
                                            </InputGroup>
                                            <FieldError>{pricingOptionError(0, 'price_in_minor')}</FieldError>
                                        </Field>

                                        <Field data-invalid={pricingOptionError(0, 'description') ? true : undefined}>
                                            <FieldLabel htmlFor="service-rate-included">{copy.rate_included_label}</FieldLabel>
                                            <Textarea
                                                id="service-rate-included"
                                                value={data.pricing_options[0].description}
                                                onChange={(event) => updatePricingOption(0, 'description', event.target.value)}
                                                maxLength={2000}
                                                aria-invalid={Boolean(pricingOptionError(0, 'description'))}
                                            />
                                            <FieldError>{pricingOptionError(0, 'description')}</FieldError>
                                        </Field>
                                    </FieldGroup>
                                </CardContent>
                            </Card>
                        ) : null}

                        <div className="flex items-center gap-4">
                            {data.pricing_structure ? (
                                <p className="text-xs text-muted-foreground">{copy.privacy_notice}</p>
                            ) : null}

                            <div className="ml-auto flex items-center gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={overview()}>{copy.cancel}</Link>
                                </Button>

                                {data.pricing_structure ? (
                                    <Button type="submit" disabled={processing}>
                                        {processing ? <Spinner data-icon="inline-start" /> : <CheckIcon data-icon="inline-start" />}
                                        {copy.submit}
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </form>
                </section>

                <section
                    className="min-h-0 overflow-y-auto flex-1 border-x border-sidebar-border/80 bg-muted/30 p-12"
                    style={{ overflowAnchor: 'none' }}
                >
                    <div className="mx-auto flex max-w-lg flex-col gap-3">
                        <div>
                            <p className="text-sm font-medium">{copy.preview_label}</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <Badge variant="secondary">{selectedCategory?.label || copy.category_section_label}</Badge>
                                {data.name ? <CardTitle className="text-2xl">{data.name}</CardTitle> : null}
                                {data.description ? <CardDescription className="whitespace-pre-line">{data.description}</CardDescription> : null}
                            </CardHeader>

                            {data.pricing_structure ? (
                                <CardContent className="flex flex-col gap-4">
                                    {data.pricing_options.map((pricingOption, index) => (
                                        <Fragment key={index}>
                                            {index > 0 ? <Separator /> : null}

                                            <div className="flex flex-col gap-1">
                                                {data.pricing_structure === 'package' && pricingOption.name ? (
                                                    <p className="text-sm font-medium">{pricingOption.name}</p>
                                                ) : null}

                                                {pricingOption.description ? (
                                                    <p className="text-sm text-muted-foreground whitespace-pre-line">{pricingOption.description}</p>
                                                ) : null}

                                                {pricingOption.price ? (
                                                    <p className="text-sm">
                                                        {formatPrice(pricingOption.price, locale)}
                                                        {data.pricing_structure !== 'package' ? ` ${copy.per_unit.replace(':unit', selectedPricingStructure?.unitLabel || '')}` : null}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </Fragment>
                                    ))}
                                </CardContent>
                            ) : null}

                            <CardFooter>{copy.preview_by_vendor.replace(':business_name', vendor.name)}</CardFooter>
                        </Card>
                    </div>
                </section>
            </main>
        </EmptyLayout>
    );
}
