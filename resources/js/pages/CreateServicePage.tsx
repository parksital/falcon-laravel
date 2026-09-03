import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ServicePricingCard } from '@/components/service-pricing-card';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useFileUpload } from '@/hooks/use-file-upload';
import AppLayout from '@/layouts/app-layout';
import { overview } from '@/routes';
import { create, store } from '@/routes/services';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, setLayoutProps, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, CurrencyEurIcon, FileDashedIcon, GlobeSimpleIcon, ImageIcon, ImagesSquareIcon, PlusIcon, TrashIcon, WarningCircleIcon, XIcon } from '@phosphor-icons/react';
import { type ReactNode, useState } from 'react';

type PriceType = '' | 'package' | 'hour' | 'person' | 'day' | 'event';
type CreateServiceStep = 'service' | 'pricing' | 'photos' | 'review';

interface PricingOption {
    name: string;
    description: string;
    price_in_minor: string;
    pricing_type: PriceType;
    features: PriceFeature[];
}

interface PriceFeature {
    feature_key: string;
    is_included: boolean;
    value: string;
}

interface CreateServiceForm {
    name: string;
    category: string;
    custom_category: string;
    has_description: boolean;
    description: string;
    pricing_options: PricingOption[];
    media: File[];
    is_public: boolean;
}

interface SelectOption {
    value: string;
    label: string;
}

interface PriceTypeOption extends SelectOption {
    priceTypeLabel: string;
}

interface CreateServicePageProps {
    vendor: {
        name: string;
    };
    serviceCategories: SelectOption[];
    priceTypesByCategory: Record<string, PriceTypeOption[]>;
    priceFeaturesByCategory: Record<string, SelectOption[]>;
    locale: string;
    copy: Record<string, string>;
}

type CreateServicePageComponent = ((props: CreateServicePageProps) => ReactNode) & {
    layout?: typeof AppLayout;
};

function emptyPackage(): PricingOption {
    return {
        name: '',
        description: '',
        price_in_minor: '',
        pricing_type: 'package',
        features: [],
    };
}

function emptyRate(pricing_type: PriceType): PricingOption {
    return {
        name: '',
        description: '',
        price_in_minor: '',
        pricing_type,
        features: [],
    };
}

function formatPriceInMinor(priceInMinor: number, locale: string) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
    }).format(priceInMinor / 100);
}

function normalizePriceAmount(value: string) {
    return value.replace(/\D/g, '');
}

function priceAmountToMinor(value: string) {
    if (! value) return '';

    return `${Number(value) * 100}`;
}

function formatPriceAmountDescription(priceAmount: string, locale: string) {
    return formatPriceInMinor(Number(priceAmountToMinor(priceAmount) || 0), locale);
}

const CreateServicePage: CreateServicePageComponent = function CreateServicePage({
    vendor,
    serviceCategories,
    priceTypesByCategory,
    priceFeaturesByCategory,
    locale,
    copy,
}: CreateServicePageProps) {
    const steps: CreateServiceStep[] = ['service', 'pricing', 'photos', 'review'];

    setLayoutProps<{ breadcrumbs: BreadcrumbItem[] }>({
        breadcrumbs: [
            { title: vendor.name, href: overview.url() },
            { title: copy.breadcrumb, href: create.url() },
        ],
    });

    function defaultServiceName(category: string, customCategory: string) {
        const categoryName = category === 'other'
            ? customCategory
            : serviceCategories.find((serviceCategory) => serviceCategory.value === category)?.label || '';

        return copy.service_name_placeholder
            .replace(':service_name', categoryName || copy.service_name_placeholder_fallback)
            .replace(':vendor', vendor.name);
    }

    const form = useForm<CreateServiceForm>({
        name: defaultServiceName('', ''),
        category: '',
        custom_category: '',
        has_description: false,
        description: '',
        pricing_options: [],
        media: [],
        is_public: true,
    });
    const [step, setStep] = useState<CreateServiceStep>('service');
    const [isSaveAsDraftInFlight, setIsSaveAsDraftInFlight] = useState(false);
    const [isSaveAndPublishInFlight, setIsSaveAndPublishInFlight] = useState(false);
    const [
        { files, errors: mediaUploadErrors, isDragging },
        { getInputProps, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, removeFile },
    ] = useFileUpload({
        accept: 'image/*',
        maxFiles: 3,
        maxSize: 4 * 1024 * 1024,
        multiple: true,
        onFilesChange(files) {
            form.setData('media', files
                .map((file) => file.file)
                .filter((file): file is File => file instanceof File));
        },
    });
    const { data, setData, errors, processing, submit, transform } = form;
    const generatedServiceName = defaultServiceName(data.category, data.custom_category);
    const formErrors = errors as Record<string, string | undefined>;
    const priceTypes = priceTypesByCategory[data.category] ?? [];
    const priceFeatures = priceFeaturesByCategory[data.category] ?? [];
    const firstPriceType = (priceTypes[0]?.value ?? '') as PriceType;
    const selectedCategory = data.category === 'other'
        ? data.custom_category
        : serviceCategories.find((serviceCategory) => serviceCategory.value === data.category)?.label;
    const visiblePricingOptions = data.pricing_options.filter((pricingOption) => pricingOption.price_in_minor);
    const serviceStepComplete = Boolean(data.category && data.name.trim() && (data.category !== 'other' || data.custom_category.trim()));
    const pricingStepComplete = Boolean(
        data.pricing_options.length > 0
        && data.pricing_options.every((pricingOption) => pricingOption.price_in_minor && (
            pricingOption.pricing_type !== 'package' || pricingOption.name.trim()
        )),
    );
    const photosStepComplete = files.length > 0 && ! errors.media && mediaUploadErrors.length === 0;
    const serviceStepHasErrors = Boolean(errors.category || errors.custom_category || errors.name || errors.description);
    const pricingStepHasErrors = Object.keys(formErrors).some((key) => key.startsWith('pricing_options.'));
    const photosStepHasErrors = mediaUploadErrors.length > 0 || Object.keys(formErrors).some((key) => key === 'media' || key.startsWith('media.'));

    function changeCategory(category: string) {
        const customCategory = category === 'other' ? data.custom_category : '';

        if (! data.name || data.name === generatedServiceName) {
            setData('name', defaultServiceName(category, customCategory));
        }

        setData('category', category);
        setData('custom_category', customCategory);
        setData('pricing_options', []);
    }

    function changeCustomCategory(customCategory: string) {
        if (! data.name || data.name === generatedServiceName) {
            setData('name', defaultServiceName('other', customCategory));
        }

        setData('custom_category', customCategory);
    }

    function changePricingOption(index: number, pricingOption: PricingOption) {
        setData('pricing_options', data.pricing_options.map((option, optionIndex) =>
            optionIndex === index ? pricingOption : option,
        ));
    }

    function changePricingOptionFeature(index: number, featureKey: string, isIncluded: boolean) {
        setData('pricing_options', data.pricing_options.map((option, optionIndex) => {
            if (optionIndex !== index) {
                return option;
            }

            return {
                ...option,
                features: isIncluded
                    ? [
                        ...option.features.filter((feature) => feature.feature_key !== featureKey),
                        { feature_key: featureKey, is_included: true, value: '' },
                    ]
                    : option.features.filter((feature) => feature.feature_key !== featureKey),
            };
        }));
    }

    function priceTypeLabel(pricingType: PriceType) {
        return priceTypes.find((priceType) => priceType.value === pricingType);
    }

    function selectedFeatureLabels(pricingOption: PricingOption) {
        return priceFeatures.filter((feature) => pricingOption.features.some((selectedFeature) => selectedFeature.feature_key === feature.value));
    }

    function pricingOptionPriceLabel(pricingOption: PricingOption) {
        const priceType = priceTypeLabel(pricingOption.pricing_type);

        return pricingOption.pricing_type !== 'package' && priceType
            ? copy.per_unit.replace(':unit', priceType.priceTypeLabel)
            : priceType?.priceTypeLabel || copy.review_empty_value;
    }

    function hasStartedPricingOption(pricingOption: PricingOption) {
        return Boolean(
            pricingOption.name.trim()
            || pricingOption.description.trim()
            || pricingOption.price_in_minor
            || pricingOption.features.length > 0,
        );
    }

    function addPrice() {
        setData('pricing_options', [...data.pricing_options, firstPriceType === 'package'
            ? emptyPackage()
            : emptyRate(firstPriceType)]);
    }

    function removePrice(index: number) {
        setData('pricing_options', data.pricing_options.filter((_, optionIndex) => optionIndex !== index));
    }

    function goToNextStep() {
        const nextStep = steps[steps.indexOf(step) + 1];

        if (nextStep) {
            setStep(nextStep);
        }
    }

    function goToPreviousStep() {
        const previousStep = steps[steps.indexOf(step) - 1];

        if (previousStep) {
            setStep(previousStep);
        }
    }

    function submitService(isPublic: boolean) {
        if (isPublic) {
            setIsSaveAndPublishInFlight(true);
        } else {
            setIsSaveAsDraftInFlight(true);
        }

        transform((formData) => ({
            ...formData,
            is_public: isPublic,
            description: formData.has_description ? formData.description : '',
            pricing_options: formData.pricing_options
                .map((pricingOption, index) => ({ pricingOption, index }))
                .filter(({ pricingOption }) => hasStartedPricingOption(pricingOption))
                .map(({ pricingOption, index }) => ({
                    name: pricingOption.name || copy.price_legend.replace(':number', `${index + 1}`),
                    description: pricingOption.description,
                    price_in_minor: priceAmountToMinor(pricingOption.price_in_minor),
                    pricing_type: pricingOption.pricing_type,
                    features: pricingOption.features
                        .filter((feature) => feature.is_included)
                        .map((feature) => ({
                            feature_key: feature.feature_key,
                            is_included: feature.is_included,
                            value: feature.value,
                        })),
                })),
        }));

        submit(store(), {
            onFinish: () => {
                setIsSaveAsDraftInFlight(false);
                setIsSaveAndPublishInFlight(false);
            },
        });
    }

    return (
        <>
            <Head title={copy.title} />

            <main className="h-full w-full p-6">
                <form
                    className="mx-auto flex max-w-xl flex-col gap-6"
                    inert={processing ? true : undefined}
                    onSubmit={(event) => {
                        event.preventDefault();
                        submitService(true);
                    }}
                >
                    <Tabs value={step} onValueChange={(value) => setStep(value as CreateServiceStep)}>
                        <TabsList className="w-full">
                            <TabsTrigger value="service">
                                {serviceStepHasErrors ? <WarningCircleIcon data-icon="inline-start" className="text-destructive" /> : serviceStepComplete ? <CheckIcon data-icon="inline-start" /> : null}
                                {copy.step_identity}
                            </TabsTrigger>
                            <TabsTrigger value="pricing">
                                {pricingStepHasErrors ? <WarningCircleIcon data-icon="inline-start" className="text-destructive" /> : pricingStepComplete ? <CheckIcon data-icon="inline-start" /> : null}
                                {copy.step_pricing}
                            </TabsTrigger>
                            <TabsTrigger value="photos">
                                {photosStepHasErrors ? <WarningCircleIcon data-icon="inline-start" className="text-destructive" /> : photosStepComplete ? <CheckIcon data-icon="inline-start" /> : null}
                                {copy.step_media}
                            </TabsTrigger>
                            <TabsTrigger value="review">
                                {copy.step_review}
                            </TabsTrigger>
                        </TabsList>

                        {step === 'service' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{copy.identity_section_label}</CardTitle>
                                    <CardDescription>{copy.identity_section_description}</CardDescription>
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
                                                <FieldDescription>{copy.custom_category_help}</FieldDescription>
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

                                        <Field orientation="horizontal">
                                            <Switch
                                                id="service-has-description"
                                                checked={data.has_description}
                                                onCheckedChange={(checked) => {
                                                    setData('has_description', checked);

                                                    if (! checked) {
                                                        setData('description', '');
                                                    }
                                                }}
                                            />
                                            <FieldContent>
                                                <FieldLabel htmlFor="service-has-description">{copy.service_description_toggle_label}</FieldLabel>
                                                <FieldDescription>{copy.service_description_toggle_help}</FieldDescription>
                                            </FieldContent>
                                        </Field>

                                        {data.has_description ? (
                                            <Field data-invalid={errors.description ? true : undefined}>
                                                <FieldLabel htmlFor="service-description">{copy.service_description_label}</FieldLabel>
                                                <Textarea
                                                    id="service-description"
                                                    className="field-sizing-fixed"
                                                    value={data.description}
                                                    rows={6}
                                                    maxLength={2000}
                                                    onChange={(event) => setData('description', event.target.value)}
                                                    aria-invalid={Boolean(errors.description)}
                                                    placeholder={copy.service_description_placeholder.replace(
                                                        ':service',
                                                        data.name || copy.service_description_fallback
                                                    )}
                                                />
                                                <FieldError>{errors.description}</FieldError>
                                            </Field>
                                        ) : null}
                                    </FieldGroup>
                                </CardContent>
                            </Card>
                        )}

                        {step === 'pricing' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{copy.pricing_section_label}</CardTitle>
                                    <CardDescription>{copy.pricing_section_description}</CardDescription>
                                </CardHeader>

                                <CardContent>
                                    {! data.category ? (
                                        <Empty className='border'>
                                            <EmptyMedia variant="icon">
                                                <CurrencyEurIcon />
                                            </EmptyMedia>
                                            <EmptyHeader>
                                                <EmptyTitle>{copy.pricing_empty_title}</EmptyTitle>
                                                <EmptyDescription>{copy.pricing_empty_description}</EmptyDescription>
                                            </EmptyHeader>
                                            <EmptyContent>
                                                <Button type="button" variant="ghost" onClick={() => setStep('service')}>
                                                    <ArrowLeftIcon/>
                                                    {copy.pricing_empty_action}
                                                </Button>
                                            </EmptyContent>
                                        </Empty>
                                    ) : data.pricing_options.length === 0 ? (
                                        <Empty className='border'>
                                            <EmptyMedia variant="icon">
                                                <CurrencyEurIcon />
                                            </EmptyMedia>
                                            <EmptyHeader>
                                                <EmptyTitle>{copy.pricing_no_prices_title}</EmptyTitle>
                                                <EmptyDescription>{copy.pricing_no_prices_description}</EmptyDescription>
                                            </EmptyHeader>
                                            <EmptyContent>
                                                <Button type="button" variant="outline" onClick={addPrice} disabled={! firstPriceType}>
                                                    <PlusIcon data-icon="inline-start" />
                                                    {copy.pricing_no_prices_action}
                                                </Button>
                                            </EmptyContent>
                                        </Empty>
                                    ) : (
                                            <FieldGroup>
                                                {data.pricing_options.map((pricingOption, index) => (
                                                    <div key={index} className="flex flex-col gap-4">
                                                        {index > 0 ? <Separator /> : null}

                                                        <div className="flex items-center justify-between gap-4">
                                                            <h2 className="text-sm font-medium">
                                                                {index === 0 ? copy.price_legend_new : copy.price_legend.replace(':number', `${index + 1}`)}
                                                            </h2>

                                                            {data.pricing_options.length > 1 ? (
                                                                <Button type="button" variant="destructive" size="sm" onClick={() => removePrice(index)}>
                                                                    <TrashIcon data-icon="inline-start" />
                                                                    {copy.remove_price}
                                                                </Button>
                                                            ) : null}
                                                        </div>

                                                        {priceTypes.length > 1 ? (
                                                            <Field data-invalid={formErrors[`pricing_options.${index}.pricing_type`] ? true : undefined}>
                                                                <FieldLabel>{copy.price_type_label}</FieldLabel>
                                                                <Select
                                                                    value={pricingOption.pricing_type}
                                                                    onValueChange={(value) => changePricingOption(index, {
                                                                        ...pricingOption,
                                                                        pricing_type: value as PriceType,
                                                                    })}
                                                                >
                                                                    <SelectTrigger className="w-full" aria-invalid={Boolean(formErrors[`pricing_options.${index}.pricing_type`])}>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent position="popper">
                                                                        <SelectGroup>
                                                                            {priceTypes.map((priceType) => (
                                                                                <SelectItem key={priceType.value} value={priceType.value}>
                                                                                    {priceType.label}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectGroup>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FieldError>{formErrors[`pricing_options.${index}.pricing_type`]}</FieldError>
                                                            </Field>
                                                        ) : (
                                                            <Field orientation="horizontal">
                                                                <FieldLabel>{copy.price_type_label}</FieldLabel>
                                                                <FieldDescription>
                                                                    {priceTypes.find((priceType) => priceType.value === pricingOption.pricing_type)?.priceTypeLabel || copy.review_empty_value}
                                                                </FieldDescription>
                                                            </Field>
                                                        )}

                                                        <Field data-invalid={formErrors[`pricing_options.${index}.name`] ? true : undefined}>
                                                            <FieldLabel htmlFor={`package-name-${index}`}>{copy.price_name_label}</FieldLabel>
                                                            <Input
                                                                id={`package-name-${index}`}
                                                                value={pricingOption.name}
                                                                onChange={(event) => changePricingOption(index, {
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
                                                            <FieldLabel htmlFor={`package-price-${index}`}>{copy.price_amount_label}</FieldLabel>
                                                            <InputGroup>
                                                                <InputGroupAddon>EUR</InputGroupAddon>
                                                                <InputGroupInput
                                                                    id={`package-price-${index}`}
                                                                    inputMode="decimal"
                                                                    value={pricingOption.price_in_minor}
                                                                    onChange={(event) => changePricingOption(index, {
                                                                        ...pricingOption,
                                                                        price_in_minor: normalizePriceAmount(event.target.value),
                                                                    })}
                                                                    placeholder={copy.price_placeholder}
                                                                    aria-invalid={Boolean(formErrors[`pricing_options.${index}.price_in_minor`])}
                                                                />
                                                                <InputGroupAddon align="inline-end">
                                                                    {formatPriceAmountDescription(pricingOption.price_in_minor, locale)}
                                                                </InputGroupAddon>
                                                            </InputGroup>
                                                            <FieldError>{formErrors[`pricing_options.${index}.price_in_minor`]}</FieldError>
                                                        </Field>

                                                        {priceFeatures.length > 0 ? (
                                                            <FieldSet>
                                                                <FieldLegend>{copy.price_features_label}</FieldLegend>
                                                                <FieldGroup data-slot="checkbox-group" className="grid grid-cols-2">
                                                                    {priceFeatures.map((feature) => (
                                                                        <Field key={feature.value} orientation="horizontal">
                                                                            <Checkbox
                                                                                id={`price-feature-${index}-${feature.value}`}
                                                                                checked={pricingOption.features.some((selectedFeature) => selectedFeature.feature_key === feature.value)}
                                                                                onCheckedChange={(checked) => changePricingOptionFeature(index, feature.value, checked === true)}
                                                                            />
                                                                            <FieldLabel htmlFor={`price-feature-${index}-${feature.value}`}>
                                                                                {feature.label}
                                                                            </FieldLabel>
                                                                        </Field>
                                                                    ))}
                                                                </FieldGroup>
                                                            </FieldSet>
                                                        ) : null}

                                                        <Field data-invalid={formErrors[`pricing_options.${index}.description`] ? true : undefined}>
                                                            <FieldLabel htmlFor={`package-description-${index}`}>{copy.price_description_label}</FieldLabel>
                                                            <Textarea
                                                                id={`package-description-${index}`}
                                                                className="field-sizing-fixed"
                                                                value={pricingOption.description}
                                                                rows={4}
                                                                maxLength={2000}
                                                                onChange={(event) => changePricingOption(index, {
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
                                                    <Button type="button" variant="outline" onClick={addPrice} disabled={! firstPriceType}>
                                                        <PlusIcon data-icon="inline-start" />
                                                        {copy.add_price}
                                                    </Button>
                                                ) : null}
                                            </FieldGroup>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {step === 'photos' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{copy.media_section_label}</CardTitle>
                                    <CardDescription>{copy.media_section_description}</CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <FieldGroup>
                                        <Field data-invalid={Boolean(errors.media || mediaUploadErrors.length)}>
                                            <div
                                                className="flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-input bg-background p-6 text-center transition-colors hover:bg-accent hover:text-accent-foreground data-[dragging=true]:bg-accent data-[dragging=true]:text-accent-foreground"
                                                data-dragging={isDragging ? true : undefined}
                                                onClick={openFileDialog}
                                                onDragEnter={handleDragEnter}
                                                onDragLeave={handleDragLeave}
                                                onDragOver={handleDragOver}
                                                onDrop={handleDrop}
                                            >
                                                <ImagesSquareIcon className="size-6" />
                                                <FieldContent className="items-center">
                                                    <FieldLabel htmlFor="service-media">{copy.media_upload_label}</FieldLabel>
                                                    <FieldDescription>{copy.media_upload_help}</FieldDescription>
                                                </FieldContent>
                                                <Button type="button" variant="outline" size="sm">
                                                    <PlusIcon data-icon="inline-start" />
                                                    {copy.media_upload_action}
                                                </Button>
                                            </div>
                                            <Input
                                                {...getInputProps({
                                                    id: 'service-media',
                                                    accept: 'image/*',
                                                    className: 'sr-only',
                                                    multiple: true,
                                                    'aria-invalid': Boolean(errors.media || mediaUploadErrors.length),
                                                })}
                                            />

                                            {files.length > 0 ? (
                                                <div className="grid grid-cols-3 gap-3">
                                                    {files.map((file) => (
                                                        <div key={file.id} className="flex flex-col gap-2">
                                                            <div className="aspect-square overflow-hidden border border-input bg-muted">
                                                                {file.preview ? (
                                                                    <img src={file.preview} alt="" className="size-full object-cover" />
                                                                ) : null}
                                                            </div>
                                                            <Button type="button" variant="outline" size="sm" onClick={() => removeFile(file.id)}>
                                                                <XIcon data-icon="inline-start" />
                                                                {copy.media_remove}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}

                                            <FieldError>{errors.media}</FieldError>
                                            <FieldError>{mediaUploadErrors[0]}</FieldError>
                                        </Field>
                                    </FieldGroup>
                                </CardContent>
                            </Card>
                        )}

                        {step === 'review' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{copy.review_section_label}</CardTitle>
                                    <CardDescription>{copy.review_section_description}</CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <FieldGroup>
                                        <Card className='pt-0'>
                                            <div className="aspect-[16/9] w-full overflow-hidden bg-muted/50">
                                                {files[0]?.preview ? (
                                                    <img src={files[0].preview} alt="" className="size-full object-cover" />
                                                ) : (
                                                    <div className="flex size-full items-center justify-center text-muted-foreground">
                                                        <ImagesSquareIcon className="size-8" />
                                                    </div>
                                                )}
                                            </div>
	                                            <CardHeader>
	                                                <div className="flex flex-wrap gap-2">
	                                                    <Badge variant="secondary">{selectedCategory || copy.review_category_empty}</Badge>
	                                                </div>
                                                {data.name ? (
                                                    <CardTitle>{data.name}</CardTitle>
                                                ) : (
                                                    <CardDescription>{copy.review_service_name_missing}</CardDescription>
                                                )}

                                                <p className="text-xs whitespace-pre-line text-muted-foreground">
                                                    {data.has_description && data.description ? data.description : copy.review_no_description}
                                                </p>

                                            </CardHeader>


                                            <CardContent className="flex flex-col gap-4">
                                                {visiblePricingOptions.map((pricingOption, index) => (
                                                    <ServicePricingCard
                                                        key={index}
                                                        title={pricingOption.name || data.name}
                                                        formattedPrice={formatPriceAmountDescription(pricingOption.price_in_minor, locale)}
                                                        priceLabel={pricingOptionPriceLabel(pricingOption)}
                                                        description={pricingOption.description}
                                                        features={selectedFeatureLabels(pricingOption).map((feature) => ({
                                                            key: feature.value,
                                                            label: feature.label,
                                                        }))}
                                                    />
                                                ))}
                                            </CardContent>
                                        </Card>
                                    </FieldGroup>
                                </CardContent>
                            </Card>
                        )}
                    </Tabs>

                    <div className="flex justify-end gap-2">
                        {step === 'service' ? (
                            <Button type="button" variant="outline" asChild>
                                <Link href={overview()}>{copy.cancel}</Link>
                            </Button>
                        ) : (
                            <Button type="button" variant="outline" onClick={goToPreviousStep}>
                                {copy.step_back}
                            </Button>
                        )}

                        {step === 'review' ? (
                            <>
                                <Button type="button" variant="outline" disabled={processing} onClick={() => submitService(false)}>
                                    {isSaveAsDraftInFlight ? <Spinner data-icon="inline-start" /> : <FileDashedIcon/>}
                                    {copy.submit_draft}
                                </Button>

                                <Button type="submit" disabled={processing}>
                                    {isSaveAndPublishInFlight ? <Spinner data-icon="inline-start" /> : <GlobeSimpleIcon data-icon="inline-start" />}
                                    {copy.submit}
                                </Button>
                            </>
                        ) : (
                            <Button type="button" onClick={goToNextStep}>
                                {copy.step_continue}
                                <ArrowRightIcon data-icon="inline-end" />
                            </Button>
                        )}
                    </div>
                </form>
            </main>
        </>
    );
};

CreateServicePage.layout = AppLayout;

export default CreateServicePage;
