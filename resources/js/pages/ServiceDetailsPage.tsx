import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AppLayout from '@/layouts/app-layout';
import { overview } from '@/routes';
import { destroy as destroyPricingOption, store as storePricingOption, update as updatePricingOption } from '@/routes/services/pricing-options';
import { destroy as destroyService, show as showService, update as updateService } from '@/routes/services';
import { Head, setLayoutProps, useForm } from '@inertiajs/react';
import { DotsThreeIcon, FileDashedIcon, GlobeSimpleIcon, ImagesSquareIcon, MoneyIcon, PencilIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { type BreadcrumbItem } from '@/types';

type PricingMode = 'fixed' | 'variable';
type PricingUnit = 'person' | 'item' | 'hour';
type PricingUnitFormValue = '' | PricingUnit;

interface PricingUnitOption {
    value: PricingUnit;
    label: string;
    priceUnit: string;
}

interface PricingOptionForm {
    name: string;
    description: string;
    price_in_minor: string;
    pricing_mode: PricingMode;
    pricing_unit: PricingUnitFormValue;
}

interface ServiceDetailsPageProps {
    vendor: {
        name: string;
    };
    service: {
        id: number;
        name: string;
        description: string | null;
        category_label: string;
        is_public: boolean;
        media: {
            id: number;
            url: string;
            sort_order: number;
        }[];
        pricing_options: {
            id: number;
            name: string;
            description: string | null;
            price_in_minor: number;
            formatted_amount: string;
            currency: string;
            pricing_mode: PricingMode;
            pricing_mode_label: string;
            pricing_unit: PricingUnit | null;
            pricing_unit_label: string | null;
            features: {
                id: number;
                feature_key: string;
                label: string;
                is_included: boolean;
                value: string | null;
                sort_order: number;
            }[];
        }[];
        formatted_created_at: string;
    };
    locale: string;
    copy: Record<string, string>;
}

function formatPriceInMinor(priceInMinor: number, locale: string) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
    }).format(priceInMinor / 100);
}

function minorToPriceAmount(priceInMinor: number) {
    return `${Math.round(priceInMinor / 100)}`;
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

function ServiceDetailsPage({
    vendor,
    service,
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
    const [serviceEditAction, setServiceEditAction] = useState<'save' | 'draft' | 'publish' | null>(null);
    const pricingUnits: PricingUnitOption[] = [
        { value: 'person', label: copy.pricing_unit_person_label, priceUnit: copy.pricing_unit_person_price_unit },
        { value: 'item', label: copy.pricing_unit_item_label, priceUnit: copy.pricing_unit_item_price_unit },
        { value: 'hour', label: copy.pricing_unit_hour_label, priceUnit: copy.pricing_unit_hour_price_unit },
    ];
    const addPriceForm = useForm<PricingOptionForm>({
        name: '',
        description: '',
        price_in_minor: '',
        pricing_mode: 'fixed',
        pricing_unit: '' as PricingUnitFormValue,
    });

    const editPriceForm = useForm<PricingOptionForm>({
        name: '',
        description: '',
        price_in_minor: '',
        pricing_mode: 'fixed',
        pricing_unit: '' as PricingUnitFormValue,
    });
    const deletePriceForm = useForm({});

    const editForm = useForm({
        name: service.name,
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

    function submitServiceEdit(action: 'save' | 'draft' | 'publish', isPublic: boolean) {
        editForm.transform((data) => ({
            ...data,
            is_public: isPublic,
        }));

        editForm.patch(updateService(service.id).url, {
            preserveScroll: true,
            onStart: () => {
                setServiceEditAction(action);
            },
            onBefore: () => {
                editForm.clearErrors();
            },
            onSuccess: () => {
                setIsEditServiceOpen(false);
                editForm.setDefaults();
                editForm.clearErrors();
            },
            onFinish: () => {
                setServiceEditAction(null);
            },
        });
    }

    function openAddPrice() {
        addPriceForm.setDefaults({
            name: '',
            description: '',
            price_in_minor: '',
            pricing_mode: 'fixed',
            pricing_unit: '',
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
        const pricingOptionDetails: PricingOptionForm = {
            name: pricingOption.name,
            description: pricingOption.description ?? '',
            price_in_minor: minorToPriceAmount(pricingOption.price_in_minor),
            pricing_mode: pricingOption.pricing_mode,
            pricing_unit: pricingOption.pricing_unit ?? '',
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

            <main className="container mx-auto max-h-full w-full px-4 flex flex-col">
                <header className='w-full py-4'>
                    <div className='flex items-center gap-2'>
                        <h1 className='text-xl font-semibold'>
                            {service.name}
                        </h1>

                        {/* Other elements */}
                    </div>
                </header>

                <section className="mt-6 pb-12 w-full flex flex-col-reverse lg:flex-row items-start gap-6">
                    <div className='flex-1 flex-col'>
                        <div>
                            <div className='flex flex-row items-center justify-between'>
                                <h1 className='text-lg font-semibold'>{copy.pricing_heading}</h1>
                                <p className='text-muted-foreground text-base invisible'></p>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={service.pricing_options.length >= 3}
                                    onClick={openAddPrice}
                                >
                                    <PlusIcon data-icon="inline-start" />
                                    {copy.add_price_action}
                                </Button>
                            </div>

                            <div className='mt-4'>
                                {service.pricing_options.length ? (
                                    <div className="flex flex-col gap-4">
                                        {service.pricing_options.map((pricingOption) => (
                                            <div key={pricingOption.id} className="flex flex-col gap-1 border p-4">
                                                <div className="flex items-center gap-3">
                                                    <p className="text-sm ">{pricingOption.formatted_amount}</p>

                                                    {pricingOption.pricing_mode === 'fixed' && (
                                                            <Badge variant="secondary">{pricingOption.pricing_mode_label}</Badge>
                                                    )}

                                                    {pricingOption.pricing_mode === 'variable' && (
                                                        <Badge variant="secondary">{pricingOption.pricing_unit_label}</Badge>
                                                    )}

                                                    <div className='flex-1'/>

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

                                                <h3 className="text-base ">{pricingOption.name}</h3>


                                                {pricingOption.features.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {pricingOption.features.map((feature) => (
                                                            <Badge key={feature.id} variant="outline">
                                                                {feature.value ? `${feature.label}: ${feature.value}` : feature.label}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                <p className="mt-2 whitespace-pre-line text-xs text-muted-foreground">
                                                    {pricingOption.description || copy.pricing_option_description_empty}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Empty className="border">
                                        <EmptyHeader>
                                                <EmptyMedia variant={"icon"}>
                                                    {/*<h1 className="text-6xl">🏝️</h1>*/}
                                                    <MoneyIcon/>
                                            </EmptyMedia>
                                            <EmptyTitle>{copy.pricing_empty_title}</EmptyTitle>
                                            <EmptyDescription>{copy.pricing_empty_description}</EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                )}

                            </div>
                        </div>

                        <Card className='mt-6'>
                            <CardHeader className='flex items-start justify-between'>
                                <div>
                                    <CardTitle>{copy.media_heading}</CardTitle>
                                    <CardDescription>{copy.media_description}</CardDescription>
                                </div>

                                {/*<Button variant={"outline"} onClick={() => console.log("implement me")}>
                                    <PlusIcon/>
                                    <span>{copy.add_media_action}</span>
                                </Button>*/}
                            </CardHeader>

                            <CardContent>
                                {service.media.length ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {service.media.map((media, index) => (
                                            <div key={media.id} className="aspect-square overflow-hidden border">
                                                <img src={media.url} alt={`${service.name} ${index + 1}`} className="size-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Empty className="border">
                                            <EmptyHeader>
                                                <EmptyMedia variant={"icon"}>
                                                    <ImagesSquareIcon/>
                                                </EmptyMedia>
                                            <EmptyTitle>{copy.media_empty_title}</EmptyTitle>
                                            <EmptyDescription>{copy.media_empty_description}</EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                )}
                            </CardContent>
                        </Card>


                    </div>

                    <aside className='w-full lg:flex-1 lg:max-w-xs'>
                        <Card>
                            <CardHeader className='flex items-start gap-2 justify-between'>
                                <div>
                                    <CardTitle>{copy.details_title}</CardTitle>
                                    <CardDescription className='sr-only'/>
                                </div>

                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            className=''
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={copy.service_actions_label}
                                        >
                                            <DotsThreeIcon />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-auto" align="end">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem className="whitespace-nowrap" onClick={openServiceEditor}>
                                                <PencilIcon className="invisible" />
                                                {copy.edit_service_action}
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                className="whitespace-nowrap"
                                                variant="destructive"
                                                onSelect={() => setIsDeleteServiceOpen(true)}
                                            >
                                                <TrashIcon />
                                                {copy.delete_service_action}
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>

                            <CardContent>
                                <FieldGroup>

                                    <Field orientation={"horizontal"}>
                                        <FieldContent>
                                            <FieldTitle>
                                                {copy.details_created_at_label}
                                            </FieldTitle>
                                        </FieldContent>

                                        <p>
                                            {service.formatted_created_at}
                                        </p>
                                    </Field>

                                    <Field orientation={"horizontal"}>
                                        <FieldContent>
                                            <FieldTitle>
                                                {copy.details_category_label}
                                            </FieldTitle>
                                        </FieldContent>

                                        <Badge className='max-w-fit' variant={"secondary"}>
                                            {service.category_label}
                                        </Badge>
                                    </Field>

                                    <Field orientation={"horizontal"}>
                                        <FieldContent>
                                            <FieldTitle>
                                                {copy.details_status_label}
                                            </FieldTitle>
                                        </FieldContent>

                                        <Badge className='max-w-fit' variant={service.is_public ? 'default' : 'secondary'}>
                                            {service.is_public ? copy.public_status : copy.draft_status}
                                        </Badge>
                                    </Field>

                                    <Field>
                                        <FieldContent>
                                            <FieldTitle>
                                                Description
                                            </FieldTitle>
                                        </FieldContent>

                                        {service.description
                                            ? <span className="whitespace-pre-line">{service.description}</span>
                                            : <span className='text-muted-foreground'>{copy.service_description_empty}</span>
                                        }
                                    </Field>
                                </FieldGroup>

                            </CardContent>
                        </Card>
                    </aside>

                </section>
            </main>

            <Sheet open={isAddPriceOpen} onOpenChange={setIsAddPriceOpen}>
                <SheetContent showCloseButton={false} className="sm:max-w-lg">
                    <form
                        className="flex min-h-0 flex-1 flex-col"
                        onSubmit={(event) => {
                            event.preventDefault();

                            addPriceForm.transform((formData) => ({
                                ...formData,
                                price_in_minor: priceAmountToMinor(formData.price_in_minor),
                                pricing_unit: formData.pricing_mode === 'variable' ? formData.pricing_unit : '',
                            }));

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
                                        pricing_mode: 'fixed',
                                        pricing_unit: '',
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
                                        maxLength={120}
                                        placeholder={copy.price_name_placeholder}
                                        aria-invalid={Boolean(addPriceForm.errors.name)}
                                        value={addPriceForm.data.name}
                                        onChange={(event) => addPriceForm.setData('name', event.target.value)}
                                    />
                                    <FieldError>{addPriceForm.errors.name}</FieldError>
                                </Field>

                                <Field data-invalid={addPriceForm.errors.pricing_mode ? true : undefined}>
                                    <FieldLabel>{copy.pricing_mode_label}</FieldLabel>
                                    <FieldDescription>{copy.pricing_mode_description}</FieldDescription>
                                    <ToggleGroup
                                        type="single"
                                        variant="outline"
                                        className="w-full"
                                        value={addPriceForm.data.pricing_mode}
                                        onValueChange={(value) => {
                                            if (! value) {
                                                return;
                                            }

                                            addPriceForm.setData({
                                                ...addPriceForm.data,
                                                pricing_mode: value as PricingMode,
                                                pricing_unit: value === 'variable' ? addPriceForm.data.pricing_unit : '',
                                            });
                                        }}
                                    >
                                        <ToggleGroupItem value="fixed" className="flex-1">
                                            {copy.pricing_mode_fixed_label}
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="variable" className="flex-1">
                                            {copy.pricing_mode_variable_label}
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                    <FieldError>{addPriceForm.errors.pricing_mode}</FieldError>
                                </Field>

                                {addPriceForm.data.pricing_mode === 'variable' ? (
                                    <Field data-invalid={addPriceForm.errors.pricing_unit ? true : undefined}>
                                        <FieldLabel>{copy.pricing_unit_label}</FieldLabel>
                                        <Select value={addPriceForm.data.pricing_unit} onValueChange={(value) => addPriceForm.setData('pricing_unit', value as PricingUnitFormValue)}>
                                            <SelectTrigger className="w-full" aria-invalid={Boolean(addPriceForm.errors.pricing_unit)}>
                                                <SelectValue placeholder={copy.pricing_unit_placeholder} />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                <SelectGroup>
                                                    {pricingUnits.map((pricingUnit) => (
                                                        <SelectItem key={pricingUnit.value} value={pricingUnit.value}>
                                                            {pricingUnit.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{addPriceForm.errors.pricing_unit}</FieldError>
                                    </Field>
                                ) : null}

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
                                            onChange={(event) => addPriceForm.setData('price_in_minor', normalizePriceAmount(event.target.value))}
                                        />
                                        <InputGroupAddon align="inline-end">
                                            {addPriceForm.data.pricing_mode === 'variable' && addPriceForm.data.pricing_unit
                                                ? `${formatPriceAmountDescription(addPriceForm.data.price_in_minor, locale)} / ${pricingUnits.find((pricingUnit) => pricingUnit.value === addPriceForm.data.pricing_unit)?.priceUnit || ''}`
                                                : formatPriceAmountDescription(addPriceForm.data.price_in_minor, locale)}
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

                            </FieldGroup>
                        </div>

                        <SheetFooter>
                            <Button type="submit" disabled={addPriceForm.processing}>
                                {addPriceForm.processing ? <Spinner data-icon="inline-start" /> : null}
                                {copy.price_add_save}
                            </Button>
                            <Button type="button" variant="outline" onClick={closeAddPrice}>
                                {copy.price_add_cancel}
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

                            editPriceForm.transform((formData) => ({
                                ...formData,
                                price_in_minor: priceAmountToMinor(formData.price_in_minor),
                                pricing_unit: formData.pricing_mode === 'variable' ? formData.pricing_unit : '',
                            }));

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
                                        maxLength={120}
                                        placeholder={copy.price_name_placeholder}
                                        aria-invalid={Boolean(editPriceForm.errors.name)}
                                        value={editPriceForm.data.name}
                                        onChange={(event) => editPriceForm.setData('name', event.target.value)}
                                    />
                                    <FieldError>{editPriceForm.errors.name}</FieldError>
                                </Field>

                                <Field data-invalid={editPriceForm.errors.pricing_mode ? true : undefined}>
                                    <FieldLabel>{copy.pricing_mode_label}</FieldLabel>
                                    <FieldDescription>{copy.pricing_mode_description}</FieldDescription>
                                    <ToggleGroup
                                        type="single"
                                        variant="outline"
                                        className="w-full"
                                        value={editPriceForm.data.pricing_mode}
                                        onValueChange={(value) => {
                                            if (! value) {
                                                return;
                                            }

                                            editPriceForm.setData({
                                                ...editPriceForm.data,
                                                pricing_mode: value as PricingMode,
                                                pricing_unit: value === 'variable' ? editPriceForm.data.pricing_unit : '',
                                            });
                                        }}
                                    >
                                        <ToggleGroupItem value="fixed" className="flex-1">
                                            {copy.pricing_mode_fixed_label}
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="variable" className="flex-1">
                                            {copy.pricing_mode_variable_label}
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                    <FieldError>{editPriceForm.errors.pricing_mode}</FieldError>
                                </Field>

                                {editPriceForm.data.pricing_mode === 'variable' ? (
                                    <Field data-invalid={editPriceForm.errors.pricing_unit ? true : undefined}>
                                        <FieldLabel>{copy.pricing_unit_label}</FieldLabel>
                                        <Select value={editPriceForm.data.pricing_unit} onValueChange={(value) => editPriceForm.setData('pricing_unit', value as PricingUnitFormValue)}>
                                            <SelectTrigger className="w-full" aria-invalid={Boolean(editPriceForm.errors.pricing_unit)}>
                                                <SelectValue placeholder={copy.pricing_unit_placeholder} />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                <SelectGroup>
                                                    {pricingUnits.map((pricingUnit) => (
                                                        <SelectItem key={pricingUnit.value} value={pricingUnit.value}>
                                                            {pricingUnit.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{editPriceForm.errors.pricing_unit}</FieldError>
                                    </Field>
                                ) : null}

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
                                            onChange={(event) => editPriceForm.setData('price_in_minor', normalizePriceAmount(event.target.value))}
                                        />
                                        <InputGroupAddon align="inline-end">
                                            {editPriceForm.data.pricing_mode === 'variable' && editPriceForm.data.pricing_unit
                                                ? `${formatPriceAmountDescription(editPriceForm.data.price_in_minor, locale)} / ${pricingUnits.find((pricingUnit) => pricingUnit.value === editPriceForm.data.pricing_unit)?.priceUnit || ''}`
                                                : formatPriceAmountDescription(editPriceForm.data.price_in_minor, locale)}
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

                            </FieldGroup>
                        </div>

                        <SheetFooter>
                            <Button type="submit" disabled={!editPriceForm.isDirty || editPriceForm.processing}>
                                {editPriceForm.processing ? <Spinner data-icon="inline-start" /> : null}
                                {copy.price_edit_save}
                            </Button>
                            <Button type="button" variant="outline" onClick={closeEditPrice}>
                                {copy.price_edit_cancel}
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
                            submitServiceEdit(service.is_public ? 'save' : 'draft', service.is_public);
                        }}
                    >
                        <SheetHeader>
                            <SheetTitle>{copy.service_edit_title}</SheetTitle>
                            <SheetDescription>{copy.service_edit_description}</SheetDescription>
                        </SheetHeader>

                        <div className="flex flex-1 flex-col overflow-y-auto p-4">
                            <FieldGroup>
                                <Field orientation={"horizontal"}>
                                    <FieldContent>
                                        <FieldLabel>{copy.service_edit_category_label}</FieldLabel>
                                        <FieldDescription>{copy.service_edit_category_description}</FieldDescription>
                                    </FieldContent>
                                    <Badge className="max-w-fit" variant="secondary">
                                        {service.category_label}
                                    </Badge>
                                </Field>

                                <Field orientation={"horizontal"}>
                                    <FieldContent>
                                        <FieldLabel>{copy.details_status_label}</FieldLabel>
                                    </FieldContent>

                                    {service.is_public ? (
                                        <Badge className="max-w-fit" variant="default">
                                            {copy.public_status}
                                        </Badge>
                                    ) : (
                                        <Badge className="max-w-fit" variant="secondary">
                                            {copy.draft_status}
                                        </Badge>
                                    )}
                                    <FieldError>{editForm.errors.is_public}</FieldError>
                                </Field>

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
                            </FieldGroup>
                        </div>

                        {service.is_public ? (
                            <SheetFooter>
                                <Button type="submit" disabled={!editForm.isDirty || editForm.processing}>
                                    {serviceEditAction === 'save' ? <Spinner data-icon="inline-start" /> : null}
                                    {copy.service_edit_save}
                                </Button>
                                <Button type="button" variant="outline" onClick={closeServiceEditor}>
                                    {copy.service_edit_cancel}
                                </Button>
                            </SheetFooter>
                        ) : (
                            <SheetFooter>
                                <Button type="submit" variant="outline" disabled={!editForm.isDirty || editForm.processing}>
                                    {serviceEditAction === 'draft' ? <Spinner data-icon="inline-start" /> : <FileDashedIcon data-icon="inline-start" />}
                                    {copy.service_edit_save_draft}
                                </Button>
                                <Button type="button" disabled={editForm.processing} onClick={() => submitServiceEdit('publish', true)}>
                                    {serviceEditAction === 'publish' ? <Spinner data-icon="inline-start" /> : <GlobeSimpleIcon data-icon="inline-start" />}
                                    {copy.service_edit_save_and_publish}
                                </Button>
                                <Button type="button" variant="outline" onClick={closeServiceEditor}>
                                    {copy.service_edit_cancel}
                                </Button>
                            </SheetFooter>
                        )}
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
}

ServiceDetailsPage.layout = AppLayout;

export default ServiceDetailsPage;
