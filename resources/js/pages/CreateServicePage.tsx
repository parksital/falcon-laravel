import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';
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
import { overview } from '@/routes';
import { store } from '@/routes/services';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, CheckIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';

interface PackagePricingOption {
    name: string;
    description: string;
    price_in_minor: string;
    unit: 'package';
}

interface CreateServiceForm {
    name: string;
    category: string;
    custom_category: string;
    description: string;
    pricing_structure: '' | 'package';
    pricing_options: PackagePricingOption[];
}

interface SelectOption {
    value: string;
    label: string;
}

interface CreateServicePageProps {
    vendor: {
        name: string;
    };
    serviceCategories: SelectOption[];
    locale: string;
    copy: Record<string, string>;
}

function emptyPackage(): PackagePricingOption {
    return {
        name: '',
        description: '',
        price_in_minor: '',
        unit: 'package',
    };
}

function formatPriceInMinor(priceInMinor: number, locale: string) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
    }).format(priceInMinor / 100);
}

function formatPriceInMinorDescription(priceInMinor: string, locale: string) {
    return formatPriceInMinor(Number(priceInMinor || 0), locale);
}

export default function CreateServicePage({
    vendor,
    serviceCategories,
    locale,
    copy,
}: CreateServicePageProps) {
    function defaultServiceName(category: string, customCategory: string) {
        const categoryName = category === 'other'
            ? customCategory
            : serviceCategories.find((serviceCategory) => serviceCategory.value === category)?.label || '';

        return copy.service_name_placeholder
            .replace(':service_name', categoryName || copy.service_name_placeholder_fallback)
            .replace(':vendor', vendor.name);
    }

    const { data, setData, errors, processing, submit, transform } = useForm<CreateServiceForm>({
        name: defaultServiceName('', ''),
        category: '',
        custom_category: '',
        description: '',
        pricing_structure: '',
        pricing_options: [],
    });

    const generatedServiceName = defaultServiceName(data.category, data.custom_category);
    const formErrors = errors as Record<string, string | undefined>;
    const shouldShowPackagePricing = data.category === 'photobooths';

    function changeCategory(category: string) {
        const customCategory = category === 'other' ? data.custom_category : '';
        const shouldUsePackagePricing = category === 'photobooths';

        setData({
            ...data,
            name: ! data.name || data.name === generatedServiceName
                ? defaultServiceName(category, customCategory)
                : data.name,
            category,
            custom_category: customCategory,
            pricing_structure: shouldUsePackagePricing ? 'package' : '',
            pricing_options: shouldUsePackagePricing
                ? (data.pricing_options.length ? data.pricing_options : [emptyPackage()])
                : [],
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

    function changePackage(index: number, packagePricingOption: PackagePricingOption) {
        setData('pricing_options', data.pricing_options.map((option, optionIndex) =>
            optionIndex === index ? packagePricingOption : option,
        ));
    }

    function addPackage() {
        setData('pricing_options', [...data.pricing_options, emptyPackage()]);
    }

    function removePackage(index: number) {
        setData('pricing_options', data.pricing_options.filter((_, optionIndex) => optionIndex !== index));
    }

    return (
        <EmptyLayout>
            <Head title={copy.title} />

            <main className="min-h-dvh overflow-y-auto p-6 w-full">
                <div className="mx-auto max-w-7xl flex flex-col items-start gap-2 ">
                    <Button type="button" variant="link" asChild>
                        <Link href={overview()}>
                            <ArrowLeftIcon data-icon="inline-start" />
                            {copy.back}
                        </Link>
                    </Button>

                    <h1 className="text-2xl font-semibold">{copy.heading.replace(':vendor', vendor.name)}</h1>
                </div>

                <form
                    className="mx-auto mt-6 max-w-xl flex flex-col gap-6"
                    inert={processing ? true : undefined}
                    onSubmit={(event) => {
                        event.preventDefault();
                        transform((formData) => ({
                            ...formData,
                            pricing_options: formData.pricing_options.map((pricingOption) => ({
                                name: pricingOption.name,
                                description: pricingOption.description,
                                price_in_minor: pricingOption.price_in_minor,
                                unit: pricingOption.unit,
                            })),
                        }));
                        submit(store());
                    }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>{copy.service_section_label}</CardTitle>
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
                                        className="field-sizing-fixed"
                                        value={data.description}
                                        rows={10}
                                        maxLength={2000}
                                        onChange={(event) => setData('description', event.target.value)}
                                        aria-invalid={Boolean(errors.description)}
                                        placeholder={copy.service_description_placeholder.replace(
                                            ':service',
                                            data.name
                                        )}
                                    />
                                    <FieldError>{errors.description}</FieldError>
                                </Field>
                            </FieldGroup>
                        </CardContent>
                    </Card>

                    {shouldShowPackagePricing ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>{copy.pricing_section_label}</CardTitle>
                                <CardDescription>{copy.package_section_description}</CardDescription>
                            </CardHeader>

                            <CardContent>
                                <FieldGroup>
                                    {data.pricing_options.map((pricingOption, index) => (
                                        <div key={index} className="flex flex-col gap-4">
                                            {index > 0 ? <Separator /> : null}

                                            <div className="flex items-center justify-between gap-4">
                                                <h2 className="text-sm font-medium">
                                                    {copy.package_legend.replace(':number', `${index + 1}`)}
                                                </h2>

                                                {data.pricing_options.length > 1 ? (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removePackage(index)}
                                                    >
                                                        <TrashIcon data-icon="inline-start" />
                                                        {copy.remove_package}
                                                    </Button>
                                                ) : null}
                                            </div>

                                            <Field data-invalid={formErrors[`pricing_options.${index}.name`] ? true : undefined}>
                                                <FieldLabel htmlFor={`package-name-${index}`}>{copy.package_name_label}</FieldLabel>
                                                <Input
                                                    id={`package-name-${index}`}
                                                    value={pricingOption.name}
                                                    onChange={(event) => changePackage(index, {
                                                        ...pricingOption,
                                                        name: event.target.value,
                                                    })}
                                                    maxLength={120}
                                                    placeholder={copy.package_name_placeholder}
                                                    aria-invalid={Boolean(formErrors[`pricing_options.${index}.name`])}
                                                />
                                                <FieldError>{formErrors[`pricing_options.${index}.name`]}</FieldError>
                                            </Field>

                                            <Field data-invalid={formErrors[`pricing_options.${index}.price_in_minor`] ? true : undefined}>
                                                <FieldLabel htmlFor={`package-price-${index}`}>{copy.package_price_label}</FieldLabel>
                                                <InputGroup>
                                                    <InputGroupAddon>EUR</InputGroupAddon>
                                                    <InputGroupInput
                                                        id={`package-price-${index}`}
                                                        inputMode="decimal"
                                                        value={pricingOption.price_in_minor}
                                                        onChange={(event) => changePackage(index, {
                                                            ...pricingOption,
                                                            price_in_minor: event.target.value.replace(/\D/g, ''),
                                                        })}
                                                        placeholder={copy.price_placeholder}
                                                        aria-invalid={Boolean(formErrors[`pricing_options.${index}.price_in_minor`])}
                                                    />
                                                    <InputGroupAddon align="inline-end">
                                                        {formatPriceInMinorDescription(pricingOption.price_in_minor, locale)}
                                                    </InputGroupAddon>
                                                </InputGroup>
                                                <FieldError>{formErrors[`pricing_options.${index}.price_in_minor`]}</FieldError>
                                            </Field>

                                            <Field data-invalid={formErrors[`pricing_options.${index}.description`] ? true : undefined}>
                                                <FieldLabel htmlFor={`package-description-${index}`}>{copy.package_included_label}</FieldLabel>
                                                <Textarea
                                                    id={`package-description-${index}`}
                                                    className="field-sizing-fixed"
                                                    value={pricingOption.description}
                                                    rows={4}
                                                    maxLength={2000}
                                                    onChange={(event) => changePackage(index, {
                                                        ...pricingOption,
                                                        description: event.target.value,
                                                    })}
                                                    placeholder={copy.package_included_placeholder}
                                                    aria-invalid={Boolean(formErrors[`pricing_options.${index}.description`])}
                                                />
                                                <FieldError>{formErrors[`pricing_options.${index}.description`]}</FieldError>
                                            </Field>
                                        </div>
                                    ))}

                                    {data.pricing_options.length < 3 ? (
                                        <Button type="button" variant="outline" onClick={addPackage}>
                                            <PlusIcon data-icon="inline-start" />
                                            {copy.add_package}
                                        </Button>
                                    ) : null}
                                </FieldGroup>
                            </CardContent>
                        </Card>
                    ) : null}

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" asChild>
                            <Link href={overview()}>{copy.cancel}</Link>
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? <Spinner data-icon="inline-start" /> : <CheckIcon data-icon="inline-start" />}
                            {copy.submit}
                        </Button>
                    </div>
                </form>
            </main>
        </EmptyLayout>
    );
}
