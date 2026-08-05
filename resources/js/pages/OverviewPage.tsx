import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';
import {
    destroy as destroyService,
    update as updateService,
} from '@/routes/services';
import { Head, router, useForm } from '@inertiajs/react';
import { create } from '@/routes/services';
import { PlusIcon } from '@phosphor-icons/react';
import { useState } from 'react';

interface Vendor {
    id: number;
    name: string;
    slug: string;
    location: string;
    short_description: string | null;
    is_public: boolean;
    created_at: string | null;
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

export default function OverviewPage({
    vendor,
    services,
    serviceCategories,
    pricingStructuresByCategory,
    copy,
}: OverviewPageProps) {
    const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
    const [isDeleteServiceOpen, setIsDeleteServiceOpen] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);

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

    console.log(vendor);

    return (
        <AppLayout>
            <Head title={copy.title} />

            <main className="container mx-auto flex h-full w-full flex-1 flex-col gap-10 p-6">
                <section className="flex flex-col gap-3">
                    <h1 className="flex gap-2 text-2xl font-semibold">
                        <span>{copy.overview_heading}</span>
                        <span className="text-muted-foreground">·</span>
                        <span>{vendor.name}</span>
                    </h1>

                    <Card>
                        <CardContent className="grid grid-cols-5 gap-4">
                            <div className="grid gap-1">
                                <p className="text-muted-foreground">{copy.overview_slug}</p>
                                <p className="font-medium">/{vendor.slug}</p>
                            </div>

                            <div className="grid gap-1">
                                <p className="text-muted-foreground">{copy.overview_location}</p>
                                <p className="font-medium">{vendor.location}</p>
                            </div>

                            <div className="grid gap-1">
                                <p className="text-muted-foreground">{copy.overview_status}</p>
                                <Badge variant={vendor.is_public ? 'default' : 'secondary'}>
                                    {vendor.is_public ? copy.public_status : copy.draft_status}
                                </Badge>
                            </div>

                            <div className="grid gap-1">
                                <p className="text-muted-foreground">{copy.overview_created_at}</p>
                                <p className="font-medium">
                                    {vendor.created_at ?? copy.not_available}
                                </p>
                            </div>

                            <div className="grid gap-1 sm:col-span-3">
                                <p className="text-muted-foreground">{copy.overview_short_description}</p>
                                <p className="font-medium">{vendor.short_description ?? copy.not_set}</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">{copy.services_heading}</h2>

                        <Button
                            onClick={() => {router.visit(create())}}
                        >
                            <PlusIcon />
                            {copy.services_add}
                        </Button>
                    </div>

                    <Table className='border'>
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
                                            // router.visit()
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
            </main>

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
        </AppLayout>
    );
}
