import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { store } from '@/routes/onboarding/vendor';
import { Head, useForm } from '@inertiajs/react';
import { CheckIcon } from '@phosphor-icons/react';
import { useState } from 'react';

interface VendorOnboardingPageProps {
    bookingPageBaseUrl: string;
    copy: Record<string, string>;
}

function slugifyTyping(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, '')
        .replace(/--+/g, '-');
}

function slugify(text: string) {
    return slugifyTyping(text).replace(/^-+|-+$/g, '');
}

export default function VendorOnboardingPage({ bookingPageBaseUrl, copy }: VendorOnboardingPageProps) {
    const [hasEditedSlug, setHasEditedSlug] = useState(false);
    const form = useForm({
        business_name: '',
        slug: '',
    });
    const { data, errors, processing } = form;
    const previewSlug = slugify(data.slug);
    const previewBookingPageUrl = `${bookingPageBaseUrl}${previewSlug}`;

    return (
        <AuthSplitLayout>
            <Head title={copy.title} />

            <main className="relative flex min-h-dvh w-full items-center justify-center px-6 py-8 lg:px-8">
                <section className="flex w-full max-w-xl flex-col items-start gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-xl font-medium">{copy.heading}</h1>
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.transform((formData) => ({
                                ...formData,
                                slug: slugify(formData.slug),
                            }));
                            form.submit(store());
                        }}
                        inert={processing ? true : undefined}
                        className="flex w-full flex-col gap-6"
                    >
                        <FieldGroup>
                            <Field data-invalid={errors.business_name ? true : undefined}>
                                <FieldLabel htmlFor="business-name">{copy.business_name_label}</FieldLabel>
                                <Input
                                    id="business-name"
                                    value={data.business_name}
                                    onChange={(event) => {
                                        const businessName = event.target.value;

                                        form.setData({
                                            ...data,
                                            business_name: businessName,
                                            slug: hasEditedSlug ? data.slug : slugifyTyping(businessName),
                                        });
                                    }}
                                    placeholder={copy.business_name_placeholder}
                                    maxLength={120}
                                    aria-invalid={Boolean(errors.business_name)}
                                    autoFocus
                                />
                                <FieldError>{errors.business_name}</FieldError>
                            </Field>

                            <Field data-invalid={errors.slug ? true : undefined}>
                                <FieldLabel htmlFor="booking-page-url">{copy.booking_page_url_label}</FieldLabel>
                                <Input
                                    id="booking-page-url"
                                    value={data.slug}
                                    onChange={(event) => {
                                        setHasEditedSlug(true);
                                        form.setData('slug', slugifyTyping(event.target.value));
                                    }}
                                    onBlur={() => form.setData('slug', previewSlug)}
                                    placeholder={copy.booking_page_url_placeholder}
                                    maxLength={120}
                                    aria-invalid={Boolean(errors.slug)}
                                />
                                <FieldDescription>
                                    {copy.booking_page_url_help.replace(':url', previewBookingPageUrl)}
                                </FieldDescription>
                                <FieldError>{errors.slug}</FieldError>
                            </Field>
                        </FieldGroup>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={!data.business_name.trim() || !previewSlug || processing}>
                                {processing ? <Spinner /> : <CheckIcon data-icon="inline-start" />}
                                {copy.submit}
                            </Button>
                        </div>
                    </form>
                </section>
            </main>
        </AuthSplitLayout>
    );
}
