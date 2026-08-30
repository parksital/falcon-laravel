import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Empty,
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
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { overview } from '@/routes';
import { destroy as destroyPricingOption, store as storePricingOption, update as updatePricingOption } from '@/routes/services/pricing-options';
import { destroy as destroyService, show as showService, update as updateService } from '@/routes/services';
import { Head, setLayoutProps, useForm } from '@inertiajs/react';
import { DotsThreeIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { type ReactNode, useState } from 'react';
import { type BreadcrumbItem } from '@/types';

interface ServiceDetailsPageProps {
    vendor: {
        name: string;
    };
    service: {
        id: number;
        name: string;
        category: string;
        custom_category: string | null;
        description: string | null;
        category_label: string;
        is_public: boolean;
        pricing_options: {
            id: number;
            name: string;
            description: string | null;
            price_in_minor: number;
            unit: string;
            unit_label: string;
            is_public: boolean;
        }[];
    };
    serviceCategories: {
        value: string;
        label: string;
    }[];
    locale: string;
    copy: Record<string, string>;
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

type ServiceDetailsPageComponent = ((props: ServiceDetailsPageProps) => ReactNode) & {
    layout?: typeof AppLayout;
};

const ServiceDetailsPage: ServiceDetailsPageComponent = function ServiceDetailsPage({
    vendor,
    service,
    serviceCategories,
    locale,
    copy,
}: ServiceDetailsPageProps) {

    setLayoutProps<{ breadcrumbs: BreadcrumbItem[] }>({
        breadcrumbs: [
            { title: vendor.name, href: overview.url() },
            { title: service.name, href: showService.url(service.id) },
        ],
    });

    const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
    const [isDeleteServiceOpen, setIsDeleteServiceOpen] = useState(false);
    const [isAddPriceOpen, setIsAddPriceOpen] = useState(false);
    const [isEditPriceOpen, setIsEditPriceOpen] = useState(false);
    const [isDeletePriceOpen, setIsDeletePriceOpen] = useState(false);
    const [editingPricingOptionId, setEditingPricingOptionId] = useState<number | null>(null);
    const [deletingPricingOptionId, setDeletingPricingOptionId] = useState<number | null>(null);
    const packagePricingOptions = service.pricing_options.filter((pricingOption) => pricingOption.unit === 'package');
    const addPriceForm = useForm({
        name: '',
        description: '',
        price_in_minor: '',
        unit: 'package',
        is_public: service.is_public,
    });
    const editPriceForm = useForm({
        name: '',
        description: '',
        price_in_minor: '',
        unit: 'package',
        is_public: false,
    });
    const deletePriceForm = useForm({});

    const editForm = useForm({
        name: service.name,
        category: service.category,
        custom_category: service.custom_category ?? '',
        description: service.description ?? '',
        is_public: service.is_public,
    });

    const deleteForm = useForm({
        confirmation_name: service.name,
    });

    const editingPricingOption = service.pricing_options.find((pricingOption) => pricingOption.id === editingPricingOptionId);
    const deletingPricingOption = service.pricing_options.find((pricingOption) => pricingOption.id === deletingPricingOptionId);

    function openServiceEditor() {
        const serviceDetails = {
            name: service.name,
            category: service.category,
            custom_category: service.custom_category ?? '',
            description: service.description ?? '',
            is_public: service.is_public,
        };

        editForm.setDefaults(serviceDetails);
        editForm.setData(serviceDetails);
        editForm.clearErrors();
        setIsEditServiceOpen(true);
    }

    function closeServiceEditor() {
        setIsEditServiceOpen(false);
        editForm.reset();
        editForm.clearErrors();
    }

    function openAddPrice() {
        addPriceForm.setDefaults({
            name: '',
            description: '',
            price_in_minor: '',
            unit: 'package',
            is_public: service.is_public,
        });

        addPriceForm.reset();
        addPriceForm.clearErrors();
        setIsAddPriceOpen(true);
    }

    function closeAddPrice() {
        setIsAddPriceOpen(false);
        addPriceForm.reset();
        addPriceForm.clearErrors();
    }

    function openEditPrice(pricingOption: ServiceDetailsPageProps['service']['pricing_options'][number]) {
        const pricingOptionDetails = {
            name: pricingOption.name,
            description: pricingOption.description ?? '',
            price_in_minor: `${pricingOption.price_in_minor}`,
            unit: pricingOption.unit,
            is_public: pricingOption.is_public,
        };

        setEditingPricingOptionId(pricingOption.id);
        editPriceForm.setDefaults(pricingOptionDetails);
        editPriceForm.setData(pricingOptionDetails);
        editPriceForm.clearErrors();
        setIsEditPriceOpen(true);
    }

    function closeEditPrice() {
        setIsEditPriceOpen(false);
        setEditingPricingOptionId(null);
        editPriceForm.reset();
        editPriceForm.clearErrors();
    }

    function openDeletePrice(pricingOption: ServiceDetailsPageProps['service']['pricing_options'][number]) {
        setDeletingPricingOptionId(pricingOption.id);
        deletePriceForm.clearErrors();
        setIsDeletePriceOpen(true);
    }

    return (
        <>
            <Head title={service.name} />

            <main className="container mx-auto flex h-full w-full flex-1 flex-col gap-6 p-6">
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(16rem,1fr)_minmax(0,2fr)]">
                    <div className="flex flex-col gap-3">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary">{service.category_label}</Badge>
                                    <Badge variant={service.is_public ? 'default' : 'secondary'}>
                                        {service.is_public ? copy.public_status : copy.draft_status}
                                    </Badge>
                                </div>

                                <CardTitle>{service.name}</CardTitle>

                                <CardDescription className="whitespace-pre-line">
                                    {service.description
                                        ? <span>{service.description}</span>
                                        : <span>{copy.service_description_empty}</span>
                                    }
                                </CardDescription>
                            </CardHeader>

                            <CardFooter className="gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={openServiceEditor}>
                                    {copy.edit_service_action}
                                </Button>

                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={copy.service_actions_label}
                                        >
                                            <DotsThreeIcon />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem
                                                variant="destructive"
                                                onSelect={() => setIsDeleteServiceOpen(true)}
                                            >
                                                <TrashIcon/>
                                                {copy.delete_service_action}
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardFooter>
                        </Card>
                    </div>

                    <section className="flex min-w-0 flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">{copy.pricing_heading}</h2>

                            {packagePricingOptions.length < 3 ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={openAddPrice}
                                >
                                    <PlusIcon data-icon="inline-start" />
                                    {copy.add_price_action}
                                </Button>
                            ) : null}
                        </div>

                        {packagePricingOptions.length ? (
                            <div className="flex flex-col gap-2">
                                {packagePricingOptions.map((pricingOption) => (
                                    <Card key={pricingOption.id}>
                                        <CardHeader className="gap-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="min-w-0 flex flex-row items-center gap-1">
                                                    <CardTitle className="truncate text-base">{pricingOption.name}</CardTitle>
                                                    <Badge variant="secondary" className="w-fit">
                                                        {pricingOption.unit_label}
                                                    </Badge>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-2">
                                                    <p className="font-mono text-base text-secondary-foreground">
                                                        {formatPriceInMinor(pricingOption.price_in_minor, locale)}
                                                    </p>

                                                    <DropdownMenu modal={false}>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon-sm"
                                                                aria-label={copy.price_actions_label}
                                                            >
                                                                <DotsThreeIcon />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-auto">
                                                            <DropdownMenuGroup>
                                                                <DropdownMenuItem className="whitespace-nowrap" onSelect={() => openEditPrice(pricingOption)}>
                                                                    <PencilSimpleIcon className='invisible' />
                                                                    {copy.price_edit_action}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="whitespace-nowrap"
                                                                    variant="destructive"
                                                                    onSelect={() => openDeletePrice(pricingOption)}
                                                                >
                                                                    <TrashIcon />
                                                                    {copy.price_delete_action}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuGroup>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>

                                            <CardDescription className="whitespace-pre-line">
                                                {pricingOption.description
                                                    ? <span>{pricingOption.description}</span>
                                                    : <span>{copy.pricing_option_description_empty}</span>
                                                }
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Empty className="border">
                                <EmptyHeader>
                                    <EmptyMedia>
                                        <h1 className="text-6xl">🏝️</h1>
                                    </EmptyMedia>
                                    <EmptyTitle>{copy.pricing_empty_title}</EmptyTitle>
                                    <EmptyDescription>{copy.pricing_empty_description}</EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </section>
                </div>
            </main>

            <Sheet open={isAddPriceOpen} onOpenChange={setIsAddPriceOpen}>
                <SheetContent showCloseButton={false} className="sm:max-w-lg">
                    <form
                        className="flex min-h-0 flex-1 flex-col"
                        onSubmit={(event) => {
                            event.preventDefault();

                            addPriceForm.post(storePricingOption(service.id).url, {
                                preserveScroll: true,
                                onBefore: () => {
                                    addPriceForm.clearErrors();
                                },
                                onSuccess: () => {
                                    setIsAddPriceOpen(false);
                                    addPriceForm.setDefaults({
                                        name: '',
                                        description: '',
                                        price_in_minor: '',
                                        unit: 'package',
                                        is_public: service.is_public,
                                    });
                                    addPriceForm.reset();
                                    addPriceForm.clearErrors();
                                },
                            });
                        }}
                    >
                        <SheetHeader>
                            <SheetTitle>{copy.price_add_title}</SheetTitle>
                            <SheetDescription>{copy.price_add_description}</SheetDescription>
                        </SheetHeader>

                        <div className="flex flex-1 flex-col overflow-y-auto p-4">
                            <FieldGroup>
                                <Field data-invalid={addPriceForm.errors.name ? true : undefined}>
                                    <FieldLabel htmlFor="add-price-name">{copy.price_field_name}</FieldLabel>
                                    <Input
                                        id="add-price-name"
                                        required
                                        maxLength={120}
                                        placeholder={copy.price_name_placeholder}
                                        aria-invalid={Boolean(addPriceForm.errors.name)}
                                        value={addPriceForm.data.name}
                                        onChange={(event) => addPriceForm.setData('name', event.target.value)}
                                    />
                                    <FieldError>{addPriceForm.errors.name}</FieldError>
                                </Field>

                                <Field data-invalid={addPriceForm.errors.price_in_minor ? true : undefined}>
                                    <FieldLabel htmlFor="add-price-amount">{copy.price_field_amount}</FieldLabel>
                                    <InputGroup>
                                        <InputGroupAddon>EUR</InputGroupAddon>
                                        <InputGroupInput
                                            id="add-price-amount"
                                            required
                                            inputMode="decimal"
                                            placeholder={copy.price_amount_placeholder}
                                            aria-invalid={Boolean(addPriceForm.errors.price_in_minor)}
                                            value={addPriceForm.data.price_in_minor}
                                            onChange={(event) => addPriceForm.setData('price_in_minor', event.target.value.replace(/\D/g, ''))}
                                        />
                                        <InputGroupAddon align="inline-end">
                                            {formatPriceInMinorDescription(addPriceForm.data.price_in_minor, locale)}
                                        </InputGroupAddon>
                                    </InputGroup>
                                    <FieldError>{addPriceForm.errors.price_in_minor}</FieldError>
                                </Field>

                                <Field data-invalid={addPriceForm.errors.description ? true : undefined}>
                                    <FieldLabel htmlFor="add-price-description">{copy.price_field_description}</FieldLabel>
                                    <Textarea
                                        id="add-price-description"
                                        className="field-sizing-fixed"
                                        rows={5}
                                        maxLength={2000}
                                        placeholder={copy.price_description_placeholder}
                                        aria-invalid={Boolean(addPriceForm.errors.description)}
                                        value={addPriceForm.data.description}
                                        onChange={(event) => addPriceForm.setData('description', event.target.value)}
                                    />
                                    <FieldError>{addPriceForm.errors.description}</FieldError>
                                </Field>

                                <Field orientation="horizontal">
                                    <Checkbox
                                        id="add-price-is-public"
                                        checked={addPriceForm.data.is_public}
                                        onCheckedChange={(checked) => addPriceForm.setData('is_public', checked === true)}
                                    />
                                    <FieldContent>
                                        <FieldLabel htmlFor="add-price-is-public">
                                            {copy.price_field_visibility}
                                        </FieldLabel>
                                        <FieldDescription>
                                            {addPriceForm.data.is_public
                                                ? copy.price_public_description
                                                : copy.price_private_description}
                                        </FieldDescription>
                                    </FieldContent>
                                </Field>
                            </FieldGroup>
                        </div>

                        <SheetFooter>
                            <Button type="button" variant="outline" onClick={closeAddPrice}>
                                {copy.price_add_cancel}
                            </Button>
                            <Button type="submit" disabled={addPriceForm.processing}>
                                {addPriceForm.processing ? <Spinner data-icon="inline-start" /> : null}
                                {copy.price_add_save}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet open={isEditPriceOpen} onOpenChange={setIsEditPriceOpen}>
                <SheetContent showCloseButton={false} className="sm:max-w-lg">
                    <form
                        className="flex min-h-0 flex-1 flex-col"
                        onSubmit={(event) => {
                            event.preventDefault();

                            if (! editingPricingOption) {
                                return;
                            }

                            editPriceForm.patch(updatePricingOption({
                                service: service.id,
                                pricingOption: editingPricingOption.id,
                            }).url, {
                                preserveScroll: true,
                                onBefore: () => {
                                    editPriceForm.clearErrors();
                                },
                                onSuccess: () => {
                                    setIsEditPriceOpen(false);
                                    setEditingPricingOptionId(null);
                                    editPriceForm.setDefaults();
                                    editPriceForm.clearErrors();
                                },
                            });
                        }}
                    >
                        <SheetHeader>
                            <SheetTitle>{copy.price_edit_title}</SheetTitle>
                            <SheetDescription>{copy.price_edit_description}</SheetDescription>
                        </SheetHeader>

                        <div className="flex flex-1 flex-col overflow-y-auto p-4">
                            <FieldGroup>
                                <Field data-invalid={editPriceForm.errors.name ? true : undefined}>
                                    <FieldLabel htmlFor="edit-price-name">{copy.price_field_name}</FieldLabel>
                                    <Input
                                        id="edit-price-name"
                                        required
                                        maxLength={120}
                                        placeholder={copy.price_name_placeholder}
                                        aria-invalid={Boolean(editPriceForm.errors.name)}
                                        value={editPriceForm.data.name}
                                        onChange={(event) => editPriceForm.setData('name', event.target.value)}
                                    />
                                    <FieldError>{editPriceForm.errors.name}</FieldError>
                                </Field>

                                <Field data-invalid={editPriceForm.errors.price_in_minor ? true : undefined}>
                                    <FieldLabel htmlFor="edit-price-amount">{copy.price_field_amount}</FieldLabel>
                                    <InputGroup>
                                        <InputGroupAddon>EUR</InputGroupAddon>
                                        <InputGroupInput
                                            id="edit-price-amount"
                                            required
                                            inputMode="decimal"
                                            placeholder={copy.price_amount_placeholder}
                                            aria-invalid={Boolean(editPriceForm.errors.price_in_minor)}
                                            value={editPriceForm.data.price_in_minor}
                                            onChange={(event) => editPriceForm.setData('price_in_minor', event.target.value.replace(/\D/g, ''))}
                                        />
                                        <InputGroupAddon align="inline-end">
                                            {formatPriceInMinorDescription(editPriceForm.data.price_in_minor, locale)}
                                        </InputGroupAddon>
                                    </InputGroup>
                                    <FieldError>{editPriceForm.errors.price_in_minor}</FieldError>
                                </Field>

                                <Field data-invalid={editPriceForm.errors.description ? true : undefined}>
                                    <FieldLabel htmlFor="edit-price-description">{copy.price_field_description}</FieldLabel>
                                    <Textarea
                                        id="edit-price-description"
                                        className="field-sizing-fixed"
                                        rows={5}
                                        maxLength={2000}
                                        placeholder={copy.price_description_placeholder}
                                        aria-invalid={Boolean(editPriceForm.errors.description)}
                                        value={editPriceForm.data.description}
                                        onChange={(event) => editPriceForm.setData('description', event.target.value)}
                                    />
                                    <FieldError>{editPriceForm.errors.description}</FieldError>
                                </Field>

                                <Field orientation="horizontal">
                                    <Checkbox
                                        id="edit-price-is-public"
                                        checked={editPriceForm.data.is_public}
                                        onCheckedChange={(checked) => editPriceForm.setData('is_public', checked === true)}
                                    />
                                    <FieldContent>
                                        <FieldLabel htmlFor="edit-price-is-public">
                                            {copy.price_field_visibility}
                                        </FieldLabel>
                                        <FieldDescription>
                                            {editPriceForm.data.is_public
                                                ? copy.price_public_description
                                                : copy.price_private_description}
                                        </FieldDescription>
                                    </FieldContent>
                                </Field>
                            </FieldGroup>
                        </div>

                        <SheetFooter>
                            <Button type="button" variant="outline" onClick={closeEditPrice}>
                                {copy.price_edit_cancel}
                            </Button>
                            <Button type="submit" disabled={!editPriceForm.isDirty || editPriceForm.processing}>
                                {editPriceForm.processing ? <Spinner data-icon="inline-start" /> : null}
                                {copy.price_edit_save}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet open={isEditServiceOpen} onOpenChange={setIsEditServiceOpen}>
                <SheetContent showCloseButton={false} className="sm:max-w-lg">
                    <form
                        className="flex min-h-0 flex-1 flex-col"
                        onSubmit={(event) => {
                            event.preventDefault();

                            editForm.patch(updateService(service.id).url, {
                                preserveScroll: true,
                                onBefore: () => {
                                    editForm.clearErrors();
                                },
                                onSuccess: () => {
                                    setIsEditServiceOpen(false);
                                    editForm.setDefaults();
                                    editForm.clearErrors();
                                },
                            });
                        }}
                    >
                        <SheetHeader>
                            <SheetTitle>{copy.service_edit_title}</SheetTitle>
                            <SheetDescription>{copy.service_edit_description}</SheetDescription>
                        </SheetHeader>

                        <div className="flex flex-1 flex-col overflow-y-auto p-4">
                            <FieldGroup>
                                <Field data-invalid={editForm.errors.name ? true : undefined}>
                                    <FieldLabel htmlFor="edit-service-name">{copy.service_field_name}</FieldLabel>
                                    <Input
                                        id="edit-service-name"
                                        name="name"
                                        required
                                        maxLength={120}
                                        placeholder={copy.service_name_placeholder}
                                        aria-invalid={Boolean(editForm.errors.name)}
                                        value={editForm.data.name}
                                        onChange={(event) => editForm.setData('name', event.target.value)}
                                    />
                                    <FieldError>{editForm.errors.name}</FieldError>
                                </Field>

                                <Field data-invalid={editForm.errors.category ? true : undefined}>
                                    <FieldLabel htmlFor="edit-service-category">{copy.service_field_category}</FieldLabel>
                                    <Select
                                        name="category"
                                        required
                                        value={editForm.data.category}
                                        onValueChange={(value) => editForm.setData({
                                            ...editForm.data,
                                            category: value,
                                            custom_category: value === 'other' ? editForm.data.custom_category : '',
                                        })}
                                    >
                                        <SelectTrigger
                                            id="edit-service-category"
                                            className="w-full"
                                            aria-invalid={Boolean(editForm.errors.category)}
                                        >
                                            <SelectValue placeholder={copy.service_field_category_placeholder} />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectGroup>
                                                {serviceCategories.map((serviceCategory) => (
                                                    <SelectItem key={serviceCategory.value} value={serviceCategory.value}>
                                                        {serviceCategory.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{editForm.errors.category}</FieldError>
                                </Field>

                                {editForm.data.category === 'other' ? (
                                    <Field data-invalid={editForm.errors.custom_category ? true : undefined}>
                                        <FieldLabel htmlFor="edit-service-custom-category">
                                            {copy.service_field_custom_category}
                                        </FieldLabel>
                                        <Input
                                            id="edit-service-custom-category"
                                            name="custom_category"
                                            required
                                            maxLength={120}
                                            placeholder={copy.custom_category_placeholder}
                                            aria-invalid={Boolean(editForm.errors.custom_category)}
                                            value={editForm.data.custom_category}
                                            onChange={(event) => editForm.setData('custom_category', event.target.value)}
                                        />
                                        <FieldError>{editForm.errors.custom_category}</FieldError>
                                    </Field>
                                ) : null}

                                <Field data-invalid={editForm.errors.description ? true : undefined}>
                                    <FieldLabel htmlFor="edit-service-description">{copy.service_field_description}</FieldLabel>
                                    <Textarea
                                        id="edit-service-description"
                                        name="description"
                                        maxLength={2000}
                                        className='field-sizing-fixed'
                                        rows={10}
                                        placeholder={copy.service_description_placeholder.replace(':service', editForm.data.name || copy.service_description_fallback)}
                                        aria-invalid={Boolean(editForm.errors.description)}
                                        value={editForm.data.description}
                                        onChange={(event) => editForm.setData('description', event.target.value)}
                                    />
                                    <FieldError>{editForm.errors.description}</FieldError>
                                </Field>

                                <Field orientation="horizontal">
                                    <Checkbox
                                        id="edit-service-is-public"
                                        name="is_public"
                                        checked={editForm.data.is_public}
                                        onCheckedChange={(checked) => editForm.setData('is_public', checked === true)}
                                    />
                                    <FieldContent>
                                        <FieldLabel htmlFor="edit-service-is-public">
                                            {copy.service_edit_visibility_label}
                                        </FieldLabel>
                                        <FieldDescription>
                                            {editForm.data.is_public
                                                ? copy.service_edit_public_description
                                                : copy.service_edit_private_description}
                                        </FieldDescription>
                                    </FieldContent>
                                </Field>
                            </FieldGroup>
                        </div>

                        <SheetFooter>
                            <Button type="button" variant="outline" onClick={closeServiceEditor}>
                                {copy.service_edit_cancel}
                            </Button>
                            <Button type="submit" disabled={!editForm.isDirty || editForm.processing}>
                                {editForm.processing ? <Spinner /> : copy.service_edit_save}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            <AlertDialog
                open={isDeletePriceOpen}
                onOpenChange={(open) => {
                    setIsDeletePriceOpen(open);

                    if (! open) {
                        setDeletingPricingOptionId(null);
                        deletePriceForm.clearErrors();
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{copy.price_delete_title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {copy.price_delete_description.replace(':price', deletingPricingOption?.name ?? '')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {copy.price_delete_cancel}
                        </AlertDialogCancel>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={deletePriceForm.processing || ! deletingPricingOption}
                            onClick={() => {
                                if (! deletingPricingOption) {
                                    return;
                                }

                                deletePriceForm.delete(destroyPricingOption({
                                    service: service.id,
                                    pricingOption: deletingPricingOption.id,
                                }).url, {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        setIsDeletePriceOpen(false);
                                        setDeletingPricingOptionId(null);
                                        deletePriceForm.clearErrors();
                                    },
                                });
                            }}
                        >
                            {deletePriceForm.processing ? <Spinner data-icon="inline-start" /> : null}
                            {copy.price_delete_confirm}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={isDeleteServiceOpen}
                onOpenChange={(open) => {
                    setIsDeleteServiceOpen(open);

                    if (!open) {
                        deleteForm.reset();
                        deleteForm.clearErrors();
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{copy.delete_service_title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {copy.delete_service_description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {copy.delete_service_cancel}
                        </AlertDialogCancel>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={deleteForm.processing}
                            onClick={() => {
                                deleteForm.delete(destroyService(service.id).url, {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        setIsDeleteServiceOpen(false);
                                        deleteForm.reset();
                                        deleteForm.clearErrors();
                                    },
                                });
                            }}
                        >
                            {deleteForm.processing ? <Spinner /> : copy.delete_service_confirm}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

ServiceDetailsPage.layout = AppLayout;

export default ServiceDetailsPage;
