import {
    show as showService,
    destroy as destroyService,
    update as updateService,
} from '@/routes/services';
import { update as updateVendor } from '@/routes/vendor';
import { overview } from '@/routes';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { Head, router, setLayoutProps, useForm } from '@inertiajs/react';
import { create } from '@/routes/services';
import {
    CopyIcon,
    PencilSimpleIcon,
    PlusIcon,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { type ReactNode, useState } from 'react';
import { type BreadcrumbItem } from '@/types';

interface Vendor {
    id: number;
    name: string;
    slug: string;
    short_description: string | null;
    is_public: boolean;
    joined_at: string | null;
    public_url: string;
}

interface OverviewPageProps {
    vendor: Vendor;
    services: {
        id: number;
        name: string;
        category: string;
        category_label: string;
        custom_category: string | null;
        description: string | null;
        pricing_options_label: string,
        is_public: boolean;
    }[];
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

type EditPricingOption = {
    id: number | null;
    price_in_minor: string;
    unit: string;
};

type OverviewPageComponent = ((props: OverviewPageProps) => ReactNode) & {
    layout?: typeof AppLayout;
};

const OverviewPage: OverviewPageComponent = function OverviewPage({
    vendor,
    services,
    serviceCategories,
    pricingStructuresByCategory,
    copy,
}: OverviewPageProps) {
    setLayoutProps<{ breadcrumbs: BreadcrumbItem[] }>({
        breadcrumbs: [{ title: vendor.name, href: overview.url() }],
    });

    const [isEditVendorOpen, setIsEditVendorOpen] = useState(false);
    const [isDiscardVendorChangesOpen, setIsDiscardVendorChangesOpen] = useState(false);
    const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
    const [isDeleteServiceOpen, setIsDeleteServiceOpen] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);

    const vendorForm = useForm({
        name: vendor.name,
        short_description: vendor.short_description ?? '',
        is_public: vendor.is_public,
    });

    const editForm = useForm({
        name: '',
        category: '',
        custom_category: '',
        description: '',
        pricing_options: [] as EditPricingOption[],
        is_public: false,
    });

    const deleteForm = useForm({
        confirmation_name: '',
    });

    const editingService = services.find((service) => service.id === editingServiceId);
    const editFormErrors = editForm.errors as Record<string, string | undefined>;
    const editPricingStructures = pricingStructuresByCategory[editForm.data.category] || [];

    async function copyBookingPageUrl() {
        try {
            await navigator.clipboard.writeText(vendor.public_url);
            toast.success(copy.overview_booking_page_copied);
        } catch {
            toast.error(copy.overview_booking_page_copy_failed);
        }
    }

    function openVendorEditor() {
        const vendorDetails = {
            name: vendor.name,
            short_description: vendor.short_description ?? '',
            is_public: vendor.is_public,
        };

        vendorForm.setDefaults(vendorDetails);
        vendorForm.setData(vendorDetails);
        vendorForm.clearErrors();
        setIsEditVendorOpen(true);
    }

    function requestCloseVendorEditor() {
        if (vendorForm.isDirty) {
            setIsDiscardVendorChangesOpen(true);
            return;
        }

        setIsEditVendorOpen(false);
        vendorForm.resetAndClearErrors();
    }

    function discardVendorChanges() {
        setIsDiscardVendorChangesOpen(false);
        setIsEditVendorOpen(false);
        vendorForm.resetAndClearErrors();
    }

    return (
        <>
            <Head title={copy.title} />

            <main className="container mx-auto flex h-full w-full flex-1 flex-col gap-6 p-6">
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(16rem,1fr)_minmax(0,2fr)]">
                    <div className="flex flex-col gap-3">
                        <h1 className="text-2xl font-semibold">{copy.overview_heading}</h1>

                        <Card>
                            <CardHeader>
                                <CardTitle>{vendor.name}</CardTitle>

                                {vendor.short_description ? (
                                    <CardDescription>{vendor.short_description}</CardDescription>
                                ) : null}
                                {vendor.joined_at ? (
                                    <CardDescription>
                                        {copy.overview_joined.replace(':formatted_date', vendor.joined_at)}
                                    </CardDescription>
                                ) : null}
                            </CardHeader>

                            <CardContent>
                                <Field>
                                    <FieldLabel htmlFor="vendor-booking-page-url" className="w-full">
                                        {copy.overview_booking_page_url}
                                        <Badge variant={vendor.is_public ? 'secondary' : 'outline'} className="ml-auto">
                                            {vendor.is_public
                                                ? copy.overview_published_status
                                                : copy.overview_unpublished_status}
                                        </Badge>
                                    </FieldLabel>

                                    <InputGroup>
                                        <InputGroupInput
                                            id="vendor-booking-page-url"
                                            type="url"
                                            value={vendor.public_url}
                                            readOnly
                                        />
                                        <InputGroupAddon align="inline-end">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <InputGroupButton
                                                            size="icon-xs"
                                                            aria-label={copy.overview_copy_booking_page}
                                                            onClick={copyBookingPageUrl}
                                                        >
                                                            <CopyIcon/>
                                                        </InputGroupButton>
                                                    </TooltipTrigger>
                                                    <TooltipContent side='right'>{copy.overview_copy_booking_page}</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </Field>
                            </CardContent>

                            <CardFooter className="flex-wrap gap-2">
                                <Button variant="outline" size="sm" onClick={openVendorEditor}>
                                    <PencilSimpleIcon data-icon="inline-start" />
                                    {copy.vendor_edit_action}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    <section className="flex min-w-0 flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">{copy.services_heading}</h2>

                            <Button onClick={() => router.visit(create())}>
                                <PlusIcon data-icon="inline-start" />
                                {copy.services_add}
                            </Button>
                        </div>

                        <Table className="border">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{copy.services_table_name}</TableHead>
                                    <TableHead>{copy.services_table_category}</TableHead>
                                    <TableHead>{copy.services_table_price}</TableHead>
                                    <TableHead>{copy.services_table_status}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {services.length > 0 ? (
                                    services.map((service) => (
                                        <TableRow
                                            key={service.id}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                router.visit(showService.url(service.id));
                                            }}
                                        >
                                            <TableCell className="font-medium">{service.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{service.category_label}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium">
                                                    {service.pricing_options_label}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={service.is_public ? 'default' : 'secondary'}>
                                                    {service.is_public ? copy.public_status : copy.draft_status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center text-muted-foreground"
                                        >
                                            {copy.services_empty}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </section>
                </div>
            </main>

            <Sheet
                open={isEditVendorOpen}
                onOpenChange={(open) => {
                    if (!open) requestCloseVendorEditor();
                }}
            >
                <SheetContent showCloseButton={false} className="sm:max-w-lg">
                    <form
                        className="flex min-h-0 flex-1 flex-col"
                        onSubmit={(event) => {
                            event.preventDefault();

                            vendorForm.patch(updateVendor.url(), {
                                preserveScroll: true,
                                onSuccess: () => {
                                    setIsEditVendorOpen(false);
                                    vendorForm.setDefaults();
                                    vendorForm.clearErrors();
                                },
                            });
                        }}
                    >
                        <SheetHeader>
                            <SheetTitle>{copy.vendor_edit_title}</SheetTitle>
                            <SheetDescription>{copy.vendor_edit_description}</SheetDescription>
                        </SheetHeader>

                        <div className="flex flex-1 flex-col overflow-y-auto p-4">
                            <FieldGroup>
                                <Field data-invalid={vendorForm.errors.name ? true : undefined}>
                                    <FieldLabel htmlFor="vendor-name">{copy.vendor_field_name}</FieldLabel>
                                    <Input
                                        id="vendor-name"
                                        name="name"
                                        required
                                        maxLength={120}
                                        aria-invalid={Boolean(vendorForm.errors.name)}
                                        value={vendorForm.data.name}
                                        onChange={(event) => vendorForm.setData('name', event.target.value)}
                                    />
                                    <FieldError>{vendorForm.errors.name}</FieldError>
                                </Field>

                                <Field data-invalid={vendorForm.errors.short_description ? true : undefined}>
                                    <FieldLabel htmlFor="vendor-about">
                                        {copy.vendor_field_about}
                                    </FieldLabel>
                                    <Textarea
                                        id="vendor-about"
                                        name="short_description"
                                        maxLength={2000}
                                        aria-invalid={Boolean(vendorForm.errors.short_description)}
                                        value={vendorForm.data.short_description}
                                        onChange={(event) => vendorForm.setData('short_description', event.target.value)}
                                    />
                                    <FieldDescription>{copy.vendor_field_about_help}</FieldDescription>
                                    <FieldError>{vendorForm.errors.short_description}</FieldError>
                                </Field>

                                <Field orientation="horizontal">
                                    <Checkbox
                                        id="vendor-is-public"
                                        name="is_public"
                                        checked={vendorForm.data.is_public}
                                        onCheckedChange={(checked) => vendorForm.setData('is_public', checked === true)}
                                    />
                                    <FieldContent>
                                        <FieldLabel htmlFor="vendor-is-public">{copy.vendor_publish_label}</FieldLabel>
                                        <FieldDescription>
                                            {vendorForm.data.is_public
                                                ? copy.vendor_published_description
                                                : copy.vendor_unpublished_description}
                                        </FieldDescription>
                                    </FieldContent>
                                </Field>
                            </FieldGroup>
                        </div>

                        <SheetFooter>
                            <Button type="button" variant="outline" onClick={requestCloseVendorEditor}>
                                {copy.vendor_edit_cancel}
                            </Button>
                            <Button type="submit" disabled={!vendorForm.isDirty || vendorForm.processing}>
                                {copy.vendor_edit_save}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            <Dialog open={isDiscardVendorChangesOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{copy.vendor_discard_title}</DialogTitle>
                        <DialogDescription>{copy.vendor_discard_description}</DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsDiscardVendorChangesOpen(false);
                            }}
                        >
                            {copy.vendor_discard_keep_editing}
                        </Button>
                        <Button type="button" variant="destructive" onClick={discardVendorChanges}>
                            {copy.vendor_discard_confirm}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Sheet open={isEditServiceOpen}>
                <SheetContent showCloseButton={false} className="sm:max-w-2xl">
                    <form
                        className="flex min-h-0 flex-1 flex-col"
                        onSubmit={(event) => {
                            event.preventDefault();

                            if (editingServiceId === null) return;

                            editForm.patch(updateService(editingServiceId).url, {
                                preserveScroll: true,
                                onBefore: () => {
                                    editForm.clearErrors();
                                },
                                onSuccess: () => {
                                    setIsEditServiceOpen(false);
                                    setEditingServiceId(null);
                                    editForm.reset();
                                    editForm.clearErrors();
                                },
                            });
                        }}
                    >
                        <SheetHeader>
                            <SheetTitle>{copy.service_edit_title}</SheetTitle>
                            <SheetDescription>
                                {copy.service_edit_description}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                            <FieldGroup>
                                <Field data-invalid={editForm.errors.name ? true : undefined}>
                                    <FieldLabel htmlFor="edit-service-name">{copy.service_field_name}</FieldLabel>
                                    <Input
                                        id="edit-service-name"
                                        name="name"
                                        required
                                        maxLength={120}
                                        placeholder={copy.service_field_name_placeholder}
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
                                            pricing_options: editForm.data.pricing_options.map((pricingOption) => ({
                                                ...pricingOption,
                                                unit: pricingStructuresByCategory[value]?.some((pricingStructure) => pricingStructure.value === pricingOption.unit)
                                                    ? pricingOption.unit
                                                    : pricingStructuresByCategory[value]?.[0]?.value || '',
                                            })),
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
                                        placeholder={copy.service_field_description_placeholder}
                                        aria-invalid={Boolean(editForm.errors.description)}
                                        value={editForm.data.description}
                                        onChange={(event) => editForm.setData('description', event.target.value)}
                                    />
                                    <FieldError>{editForm.errors.description}</FieldError>
                                </Field>
                            </FieldGroup>

                            <Field>
                                <FieldLabel>{copy.service_pricing_label}</FieldLabel>

                                <div className="grid grid-cols-[minmax(0,1fr)_8rem] gap-2">
                                    <FieldLabel>
                                        {copy.service_field_price_in_minor}
                                    </FieldLabel>

                                    <FieldLabel>{copy.service_field_unit}</FieldLabel>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {editForm.data.pricing_options.map((pricingOption, index) => (
                                        <div
                                            key={pricingOption.id ?? `new-${index}`}
                                            className="grid grid-cols-[minmax(0,1fr)_8rem] gap-2"
                                        >
                                            <Field data-invalid={editFormErrors[`pricing_options.${index}.price_in_minor`] ? true : undefined}>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        id={`edit-service-price-${index}`}
                                                        inputMode="numeric"
                                                        type="text"
                                                        required
                                                        aria-invalid={Boolean(editFormErrors[`pricing_options.${index}.price_in_minor`])}
                                                        placeholder={copy.service_field_price_placeholder}
                                                        value={pricingOption.price_in_minor}
                                                        onChange={(event) => {
                                                            const pricingOptions = editForm.data.pricing_options.map((option, optionIndex) =>
                                                                optionIndex === index
                                                                    ? { ...option, price_in_minor: event.target.value.replace(/\D/g, '') }
                                                                    : option,
                                                            );

                                                            editForm.setData('pricing_options', pricingOptions);
                                                        }}
                                                    />

                                                    <InputGroupAddon align="inline-end">
                                                        {formatPriceInMinorDescription(pricingOption.price_in_minor)}
                                                    </InputGroupAddon>
                                                </InputGroup>
                                                <InputError message={editFormErrors[`pricing_options.${index}.price_in_minor`]} />
                                            </Field>

                                            <Field data-invalid={editFormErrors[`pricing_options.${index}.unit`] ? true : undefined}>
                                                <Select
                                                    value={pricingOption.unit}
                                                    onValueChange={(value) => {
                                                        const pricingOptions = editForm.data.pricing_options.map((option, optionIndex) =>
                                                            optionIndex === index
                                                                ? { ...option, unit: value }
                                                                : option,
                                                        );

                                                        editForm.setData('pricing_options', pricingOptions);
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        aria-invalid={Boolean(editFormErrors[`pricing_options.${index}.unit`])}
                                                    >
                                                        <SelectValue placeholder={copy.service_field_unit_placeholder} />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper">
                                                        <SelectGroup>
                                                            {editPricingStructures.map((pricingStructure) => (
                                                                <SelectItem key={pricingStructure.value} value={pricingStructure.value}>
                                                                    {pricingStructure.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={editFormErrors[`pricing_options.${index}.unit`]} />
                                            </Field>
                                        </div>
                                    ))}
                                </div>
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

                            <Separator />

                            <Field>
                                <FieldLabel>{copy.danger_zone_heading}</FieldLabel>
                                <FieldDescription>{copy.service_edit_danger_description}</FieldDescription>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => {
                                        deleteForm.reset();
                                        deleteForm.clearErrors();
                                        setIsDeleteServiceOpen(true);
                                    }}
                                >
                                    {copy.danger_zone_delete_service}
                                </Button>
                            </Field>
                        </div>

                        <SheetFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditServiceOpen(false);
                                    setEditingServiceId(null);
                                    editForm.reset();
                                    editForm.clearErrors();
                                }}
                            >
                                {copy.service_edit_discard_changes}
                            </Button>
                            <Button type="submit" disabled={!editForm.isDirty || editForm.processing}>
                                {editForm.processing ? <Spinner /> : copy.service_action_save_changes}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            <Dialog
                open={isDeleteServiceOpen}
                onOpenChange={(open) => {
                    setIsDeleteServiceOpen(open);

                    if (!open) {
                        deleteForm.reset();
                        deleteForm.clearErrors();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{copy.delete_service_title}</DialogTitle>
                        <DialogDescription>
                            {copy.delete_service_description}
                            <br />
                            {copy.delete_service_type_to_confirm_before}{' '}
                            <span className="font-medium text-foreground">
                                {editingService?.name ?? copy.delete_service_fallback_service_name}
                            </span>{' '}
                            {copy.delete_service_type_to_confirm_after}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="delete-service-confirmation-name">
                            {copy.delete_service_service_name}
                        </Label>
                        <Input
                            id="delete-service-confirmation-name"
                            name="confirmation_name"
                            value={deleteForm.data.confirmation_name}
                            onChange={(event) => deleteForm.setData('confirmation_name', event.target.value)}
                        />
                        <InputError message={deleteForm.errors.confirmation_name} />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsDeleteServiceOpen(false);
                                deleteForm.reset();
                                deleteForm.clearErrors();
                            }}
                        >
                            {copy.delete_service_keep_service}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={deleteForm.data.confirmation_name !== (editingService?.name ?? '') || deleteForm.processing}
                            onClick={() => {
                                if (editingServiceId === null) return;

                                deleteForm.delete(destroyService(editingServiceId).url, {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        setIsDeleteServiceOpen(false);
                                        setIsEditServiceOpen(false);
                                        setEditingServiceId(null);
                                        editForm.reset();
                                        editForm.clearErrors();
                                        deleteForm.reset();
                                        deleteForm.clearErrors();
                                    },
                                });
                            }}
                        >
                            {deleteForm.processing ? <Spinner /> : copy.delete_service_confirm}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

OverviewPage.layout = AppLayout;

export default OverviewPage;
