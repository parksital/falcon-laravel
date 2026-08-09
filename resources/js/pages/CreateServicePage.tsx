import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Field,
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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import EmptyLayout from '@/layouts/empty-layout';
import { overview } from '@/routes';
import { store } from '@/routes/services';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, CheckIcon } from '@phosphor-icons/react';

interface CreateServiceForm {
    name: string;
    category: string;
    custom_category: string;
    description: string;
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
    copy: Record<string, string>;
}

export default function CreateServicePage({
    vendor,
    serviceCategories,
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

    const { data, setData, errors, processing, submit } = useForm<CreateServiceForm>({
        name: defaultServiceName('', ''),
        category: '',
        custom_category: '',
        description: '',
    });

    const selectedCategory = serviceCategories.find((category) => category.value === data.category);
    const suggestedServiceName = data.category === 'other' ? data.custom_category : selectedCategory?.label || '';
    const generatedServiceName = defaultServiceName(data.category, data.custom_category);

    function changeCategory(category: string) {
        const customCategory = category === 'other' ? data.custom_category : '';

        setData({
            ...data,
            name: ! data.name || data.name === generatedServiceName
                ? defaultServiceName(category, customCategory)
                : data.name,
            category,
            custom_category: customCategory,
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
