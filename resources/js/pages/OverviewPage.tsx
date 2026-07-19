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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { store as storeService } from '@/routes/services';
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

export default function OverviewPage({
    vendor,
    services,
    serviceCategories,
}: OverviewPageProps) {
    const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
    const [isCancelAddServiceOpen, setIsCancelAddServiceOpen] = useState(false);
    const [addServiceStep, setAddServiceStep] = useState(1);
    const form = useForm({
        name: '',
        category: '',
        custom_category: '',
        description: '',
        price_in_minor: '',
        unit: '',
        is_public: false,
    });

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
                                form.reset();
                                form.clearErrors();
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
                                    <TableRow key={service.id}>
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

                            form.post(storeService().url, {
                                preserveScroll: true,
                                onBefore: () => {
                                    form.clearErrors();
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
                                    form.reset();
                                    form.clearErrors();
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
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData('name', event.target.value)
                                        }
                                    />
                                    <InputError message={form.errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="service-category">
                                        Category
                                    </Label>
                                    <Select
                                        name="category"
                                        required
                                        value={form.data.category}
                                        onValueChange={(value) =>
                                            form.setData('category', value)
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
                                    <InputError message={form.errors.category} />
                                </div>

                                {form.data.category === 'other' ? (
                                    <div className="grid gap-2">
                                        <Label htmlFor="service-custom-category">
                                            Custom category
                                        </Label>
                                        <Input
                                            id="service-custom-category"
                                            name="custom_category"
                                            required
                                            value={form.data.custom_category}
                                            onChange={(event) =>
                                                form.setData('custom_category', event.target.value)
                                            }
                                        />
                                        <InputError message={form.errors.custom_category} />
                                    </div>
                                ) : null}

                                <div className="grid gap-2">
                                    <Label htmlFor="service-description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="service-description"
                                        name="description"
                                        value={form.data.description}
                                        onChange={(event) =>
                                            form.setData('description', event.target.value)
                                        }
                                    />
                                    <InputError message={form.errors.description} />
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
                                            value={form.data.price_in_minor}
                                            onChange={(event) => form.setData('price_in_minor', event.target.value.replace(/\D/g, ''))}
                                        />

                                        <InputGroupAddon align="inline-end">{formatPriceInMinorDescription(form.data.price_in_minor)}</InputGroupAddon>

                                    </InputGroup>
                                    <InputError message={form.errors.price_in_minor} />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="service-unit">
                                        Charge per
                                    </FieldLabel>
                                    <Select
                                        name="unit"
                                        value={form.data.unit}
                                        onValueChange={(value) =>
                                            form.setData('unit', value)
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
                                    <InputError message={form.errors.unit} />
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
                                                form.data.category,
                                                form.data.custom_category,
                                            )}
                                        </Badge>

                                        <h2 className="text-xl">
                                            {form.data.name}
                                        </h2>

                                        <p>
                                            By <strong>{vendor.title}</strong>
                                        </p>

                                        <p className="font-medium">
                                            {form.data.description}
                                        </p>
                                    </div>


                                    <div className='flex justify-between items-start gap-2'>

                                        <div className="grid gap-1">
                                            <p className="text-muted-foreground">
                                                Price
                                            </p>
                                            <p className="font-medium">{formatPriceInMinor(form.data.price_in_minor)}</p>
                                        </div>

                                        <div className="grid gap-1">
                                            <p className="text-muted-foreground">Per</p>
                                            <p className="font-medium capitalize">
                                                {form.data.unit}
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
                                    checked={form.data.is_public}
                                    onCheckedChange={(checked) =>
                                        form.setData('is_public', checked === true)
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
                            <Button type="submit" disabled={form.processing}>
                                {addServiceStep < 3
                                    ? 'Continue'
                                    : form.processing
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
                            Any details you entered for this service will be
                            lost.
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
                                form.reset();
                                form.clearErrors();
                            }}
                        >
                            Cancel service
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
