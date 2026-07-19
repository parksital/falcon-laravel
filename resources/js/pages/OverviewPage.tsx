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
    store as storeService,
    update as updateService,
} from '@/routes/services';
import { Head, useForm } from '@inertiajs/react';
import { PlusIcon } from '@phosphor-icons/react';
import { useState } from 'react';

interface OverviewPageProps {
    vendor: {
        id: number;
        title: string;
        slug: string;
        location: string;
        short_description: string | null;
        is_public: boolean;
        created_at: string | null;
    };
    services: {
        id: number;
        name: string;
        category: string;
        category_label: string;
        custom_category: string | null;
        description: string | null;
        price_in_minor: number | null;
        unit: string | null;
        is_public: boolean;
    }[];
    serviceCategories: {
        value: string;
        label: string;
    }[];
}

function getServiceCategoryLabel(
    serviceCategories: OverviewPageProps['serviceCategories'],
    category: string,
    customCategory: string,
) {
    if (category === 'other') {
        return (
            customCategory ||
            serviceCategories.find(
                (serviceCategory) => serviceCategory.value === category,
            )?.label ||
            'Other'
        );
    }

    return (
        serviceCategories.find((serviceCategory) => serviceCategory.value === category)?.label || 'Not set'
    );
}

function formatPriceInMinor(priceInMinor: string | number | null) {
    if (priceInMinor === null || priceInMinor === '') return 'Not set';

    return formatPriceInMinorValue(String(priceInMinor));
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

const serviceFormDefaults = {
    name: '',
    category: '',
    custom_category: '',
    description: '',
    price_in_minor: '',
    unit: '',
    is_public: false,
};

export default function OverviewPage({
    vendor,
    services,
    serviceCategories,
}: OverviewPageProps) {
    const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
    const [isCancelAddServiceOpen, setIsCancelAddServiceOpen] = useState(false);
    const [addServiceStep, setAddServiceStep] = useState(1);
    const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
    const [isDeleteServiceOpen, setIsDeleteServiceOpen] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const addForm = useForm(serviceFormDefaults);
    const editForm = useForm(serviceFormDefaults);
    const deleteForm = useForm({
        confirmation_name: '',
    });
    const editingService = services.find((service) => service.id === editingServiceId);

    return (
        <AppLayout>
            <Head title="Overview" />

            <main className="container mx-auto flex h-full w-full flex-1 flex-col gap-10 p-6">
                <section className="flex flex-col gap-3">
                    <h1 className="flex gap-2 text-2xl font-semibold">
                        <span>Overview</span>
                        <span className="text-muted-foreground">·</span>
                        <span>{vendor.title}</span>
                    </h1>

                    <Card>
                        <CardContent className="grid grid-cols-5 gap-4">
                            <div className="grid gap-1">
                                <p className="text-muted-foreground">Slug</p>
                                <p className="font-medium">/{vendor.slug}</p>
                            </div>

                            <div className="grid gap-1">
                                <p className="text-muted-foreground">Location</p>
                                <p className="font-medium">{vendor.location}</p>
                            </div>

                            <div className="grid gap-1">
                                <p className="text-muted-foreground">Status</p>
                                <Badge variant={vendor.is_public ? 'default' : 'secondary'}>
                                    {vendor.is_public ? 'Public' : 'Draft'}
                                </Badge>
                            </div>

                            <div className="grid gap-1">
                                <p className="text-muted-foreground">Created at</p>
                                <p className="font-medium">
                                    {vendor.created_at ?? 'Not available'}
                                </p>
                            </div>

                            <div className="grid gap-1 sm:col-span-3">
                                <p className="text-muted-foreground">Short description</p>
                                <p className="font-medium">{vendor.short_description ?? 'Not set'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Services</h2>

                        <Button
                            onClick={() => {
                                setAddServiceStep(1);
                                addForm.reset();
                                addForm.clearErrors();
                                setIsAddServiceOpen(true);
                            }}
                        >
                            <PlusIcon />
                            Add service
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.length > 0 ? (
                                services.map((service) => (
                                    <TableRow
                                        key={service.id}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            const serviceData = {
                                                name: service.name,
                                                category: service.category,
                                                custom_category: service.custom_category ?? '',
                                                description: service.description ?? '',
                                                price_in_minor: service.price_in_minor === null ? '' : String(service.price_in_minor),
                                                unit: service.unit ?? '',
                                                is_public: service.is_public,
                                            };

                                            setEditingServiceId(service.id);
                                            editForm.setData(serviceData);
                                            editForm.setDefaults(serviceData);
                                            editForm.clearErrors();
                                            setIsEditServiceOpen(true);
                                        }}
                                    >
                                        <TableCell className="font-medium">{service.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{service.category_label}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {formatPriceInMinor(service.price_in_minor)}
                                            {service.unit ? ` / ${service.unit}` : ''}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={service.is_public ? 'default' : 'secondary'}>
                                                {service.is_public ? 'Public' : 'Draft'}
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
                                        No services have been added yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </section>
            </main>

            <Dialog open={isAddServiceOpen}>
                <DialogContent showCloseButton={false}>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(event) => {
                            event.preventDefault();

                            if (addServiceStep < 3) {
                                setAddServiceStep(addServiceStep + 1);
                                return;
                            }

                            addForm.post(storeService().url, {
                                preserveScroll: true,
                                onBefore: () => {
                                    addForm.clearErrors();
                                },
                                onError: (errors) => {
                                    if (errors.name || errors.category || errors.custom_category || errors.description) {
                                        setAddServiceStep(1);
                                        return;
                                    }

                                    if (errors.price_in_minor || errors.unit) {
                                        setAddServiceStep(2);
                                    }
                                },
                                onSuccess: () => {
                                    setIsAddServiceOpen(false);
                                    setAddServiceStep(1);
                                    addForm.reset();
                                    addForm.clearErrors();
                                },
                            });
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle>Add service</DialogTitle>
                            <DialogDescription>
                                Step {addServiceStep} of 3
                            </DialogDescription>
                        </DialogHeader>

                        {addServiceStep === 1 ? (
                            <div className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="service-name">Name</Label>
                                    <Input
                                        id="service-name"
                                        name="name"
                                        required
                                        value={addForm.data.name}
                                        onChange={(event) =>
                                            addForm.setData('name', event.target.value)
                                        }
                                    />
                                    <InputError message={addForm.errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="service-category">
                                        Category
                                    </Label>
                                    <Select
                                        name="category"
                                        required
                                        value={addForm.data.category}
                                        onValueChange={(value) =>
                                            addForm.setData('category', value)
                                        }
                                    >
                                        <SelectTrigger
                                            id="service-category"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Select category" />
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
                                    <InputError message={addForm.errors.category} />
                                </div>

                                {addForm.data.category === 'other' ? (
                                    <div className="grid gap-2">
                                        <Label htmlFor="service-custom-category">
                                            Custom category
                                        </Label>
                                        <Input
                                            id="service-custom-category"
                                            name="custom_category"
                                            required
                                            value={addForm.data.custom_category}
                                            onChange={(event) =>
                                                addForm.setData('custom_category', event.target.value)
                                            }
                                        />
                                        <InputError message={addForm.errors.custom_category} />
                                    </div>
                                ) : null}

                                <div className="grid gap-2">
                                    <Label htmlFor="service-description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="service-description"
                                        name="description"
                                        value={addForm.data.description}
                                        onChange={(event) =>
                                            addForm.setData('description', event.target.value)
                                        }
                                    />
                                    <InputError message={addForm.errors.description} />
                                </div>
                            </div>
                        ) : null}

                        {addServiceStep === 2 ? (
                            <div className="flex flex-col gap-4">
                                <Field>
                                    <FieldLabel htmlFor="service-price">
                                        Price in cents
                                    </FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            id="service-price"
                                            name="price_in_minor"
                                            inputMode="numeric"
                                            type="text"
                                            required
                                            placeholder="0"
                                            value={addForm.data.price_in_minor}
                                            onChange={(event) => addForm.setData('price_in_minor', event.target.value.replace(/\D/g, ''))}
                                        />

                                        <InputGroupAddon align="inline-end">{formatPriceInMinorDescription(addForm.data.price_in_minor)}</InputGroupAddon>

                                    </InputGroup>
                                    <InputError message={addForm.errors.price_in_minor} />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="service-unit">
                                        Charge per
                                    </FieldLabel>
                                    <Select
                                        name="unit"
                                        value={addForm.data.unit}
                                        onValueChange={(value) =>
                                            addForm.setData('unit', value)
                                        }
                                    >
                                        <SelectTrigger
                                            id="service-unit"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectGroup>
                                                <SelectItem value="package">
                                                    Package
                                                </SelectItem>
                                                <SelectItem value="hour">
                                                    Hour
                                                </SelectItem>
                                                <SelectItem value="person">
                                                    Person
                                                </SelectItem>
                                                <SelectItem value="day">
                                                    Day
                                                </SelectItem>
                                                <SelectItem value="event">
                                                    Event
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FieldDescription>
                                        Choose what this price applies to, like
                                        event, hour, or person.
                                    </FieldDescription>
                                    <InputError message={addForm.errors.unit} />
                                </Field>

                            </div>
                        ) : null}

                        {addServiceStep === 3 ? (
                            <Card>
                                <CardContent className="grid gap-4">
                                    <div className="grid gap-1">
                                        <Badge variant="default">
                                            {getServiceCategoryLabel(
                                                serviceCategories,
                                                addForm.data.category,
                                                addForm.data.custom_category,
                                            )}
                                        </Badge>

                                        <h2 className="text-xl">
                                            {addForm.data.name}
                                        </h2>

                                        <p>
                                            By <strong>{vendor.title}</strong>
                                        </p>

                                        <p className="font-medium">
                                            {addForm.data.description}
                                        </p>
                                    </div>


                                    <div className='flex justify-between items-start gap-2'>

                                        <div className="grid gap-1">
                                            <p className="text-muted-foreground">
                                                Price
                                            </p>
                                            <p className="font-medium">{formatPriceInMinor(addForm.data.price_in_minor)}</p>
                                        </div>

                                        <div className="grid gap-1">
                                            <p className="text-muted-foreground">Per</p>
                                            <p className="font-medium capitalize">
                                                {addForm.data.unit}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}

                        {addServiceStep === 3 ? (
                            <Field orientation="horizontal">
                                <Checkbox
                                    id="service-is-public"
                                    name="is_public"
                                    checked={addForm.data.is_public}
                                    onCheckedChange={(checked) =>
                                        addForm.setData('is_public', checked === true)
                                    }
                                />
                                <FieldContent>
                                    <FieldLabel htmlFor="service-is-public">
                                        Make public
                                    </FieldLabel>
                                    <FieldDescription>
                                        Show this service on your public vendor
                                        page once it has been saved.
                                    </FieldDescription>
                                </FieldContent>
                            </Field>
                        ) : null}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsCancelAddServiceOpen(true);
                                }}
                            >
                                Cancel
                            </Button>
                            {addServiceStep > 1 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setAddServiceStep(
                                            addServiceStep - 1,
                                        );
                                    }}
                                >
                                    Back
                                </Button>
                            ) : null}
                            <Button type="submit" disabled={addForm.processing}>
                                {addServiceStep < 3
                                    ? 'Continue'
                                    : addForm.processing
                                        ? <Spinner />
                                        : 'Save service'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isCancelAddServiceOpen}
                onOpenChange={setIsCancelAddServiceOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel service?</DialogTitle>
                        <DialogDescription>
                            Any details you entered for this service will be lost.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsCancelAddServiceOpen(false);
                            }}
                        >
                            Keep editing
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                setIsCancelAddServiceOpen(false);
                                setIsAddServiceOpen(false);
                                setAddServiceStep(1);
                                addForm.reset();
                                addForm.clearErrors();
                            }}
                        >
                            Cancel service
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Sheet open={isEditServiceOpen}>
                <SheetContent showCloseButton={false}>
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
                            <SheetTitle>Edit service</SheetTitle>
                            <SheetDescription>
                                Update the details shown for this service.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-service-name">Name</Label>
                                <Input
                                    id="edit-service-name"
                                    name="name"
                                    required
                                    value={editForm.data.name}
                                    onChange={(event) => editForm.setData('name', event.target.value)}
                                />
                                <InputError message={editForm.errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-service-category">Category</Label>
                                <Select
                                    name="category"
                                    required
                                    value={editForm.data.category}
                                    onValueChange={(value) => editForm.setData('category', value)}
                                >
                                    <SelectTrigger
                                        id="edit-service-category"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select category" />
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
                                <InputError message={editForm.errors.category} />
                            </div>

                            {editForm.data.category === 'other' ? (
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-service-custom-category">
                                        Custom category
                                    </Label>
                                    <Input
                                        id="edit-service-custom-category"
                                        name="custom_category"
                                        required
                                        value={editForm.data.custom_category}
                                        onChange={(event) => editForm.setData('custom_category', event.target.value)}
                                    />
                                    <InputError message={editForm.errors.custom_category} />
                                </div>
                            ) : null}

                            <div className="grid gap-2">
                                <Label htmlFor="edit-service-description">Description</Label>
                                <Textarea
                                    id="edit-service-description"
                                    name="description"
                                    value={editForm.data.description}
                                    onChange={(event) => editForm.setData('description', event.target.value)}
                                />
                                <InputError message={editForm.errors.description} />
                            </div>

                            <Field>
                                <FieldLabel htmlFor="edit-service-price">
                                    Price in cents
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        id="edit-service-price"
                                        name="price_in_minor"
                                        inputMode="numeric"
                                        type="text"
                                        required
                                        placeholder="0"
                                        value={editForm.data.price_in_minor}
                                        onChange={(event) => editForm.setData('price_in_minor', event.target.value.replace(/\D/g, ''))}
                                    />

                                    <InputGroupAddon align="inline-end">{formatPriceInMinorDescription(editForm.data.price_in_minor)}</InputGroupAddon>
                                </InputGroup>
                                <InputError message={editForm.errors.price_in_minor} />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="edit-service-unit">
                                    Charge per
                                </FieldLabel>
                                <Select
                                    name="unit"
                                    value={editForm.data.unit}
                                    onValueChange={(value) => editForm.setData('unit', value)}
                                >
                                    <SelectTrigger
                                        id="edit-service-unit"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectItem value="package">
                                                Package
                                            </SelectItem>
                                            <SelectItem value="hour">
                                                Hour
                                            </SelectItem>
                                            <SelectItem value="person">
                                                Person
                                            </SelectItem>
                                            <SelectItem value="day">
                                                Day
                                            </SelectItem>
                                            <SelectItem value="event">
                                                Event
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldDescription>
                                    Choose what this price applies to, like
                                    event, hour, or person.
                                </FieldDescription>
                                <InputError message={editForm.errors.unit} />
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
                                        Make public
                                    </FieldLabel>
                                    <FieldDescription>
                                        Show this service on your public vendor
                                        page once it has been saved.
                                    </FieldDescription>
                                </FieldContent>
                            </Field>

                            <div className="flex flex-col gap-3 border-t pt-4">
                                <h3 className="font-medium">Danger zone</h3>
                                <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                    deleteForm.reset();
                                    deleteForm.clearErrors();
                                    setIsDeleteServiceOpen(true);
                                }}
                            >
                                    Delete service
                                </Button>
                            </div>
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
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!editForm.isDirty || editForm.processing}>
                                {editForm.processing ? <Spinner /> : 'Save changes'}
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
                        <DialogTitle>Delete service?</DialogTitle>
                        <DialogDescription>
                            This service will be removed from your vendor page.
                            <br />
                            Type <span className="font-medium text-foreground">{editingService?.name ?? 'the service name'}</span> to confirm.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="delete-service-confirmation-name">
                            Service name
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
                            Keep service
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
                            {deleteForm.processing ? <Spinner /> : 'Delete service'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
