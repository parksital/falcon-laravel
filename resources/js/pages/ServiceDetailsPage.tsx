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
import { destroy as destroyService, show as showService, update as updateService } from '@/routes/services';
import { Head, setLayoutProps, useForm } from '@inertiajs/react';
import { DotsThreeIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
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
    };
    serviceCategories: {
        value: string;
        label: string;
    }[];
    copy: Record<string, string>;
}

type ServiceDetailsPageComponent = ((props: ServiceDetailsPageProps) => ReactNode) & {
    layout?: typeof AppLayout;
};

const ServiceDetailsPage: ServiceDetailsPageComponent = function ServiceDetailsPage({
    vendor,
    service,
    serviceCategories,
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

                                {service.description ? (
                                    <CardDescription className="whitespace-pre-line">{service.description}</CardDescription>
                                ) : null}
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
                        </div>

                        <Empty className="border">
                            <EmptyHeader>
                                <EmptyMedia>
                                    <h1 className="text-6xl">🏝️</h1>
                                </EmptyMedia>
                                <EmptyTitle>{copy.pricing_empty_title}</EmptyTitle>
                                <EmptyDescription>{copy.pricing_empty_description}</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </section>
                </div>
            </main>

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
