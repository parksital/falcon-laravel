import { Button } from '@/components/ui/button';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { store } from '@/routes/onboarding/vendor';
import { Head, useForm } from '@inertiajs/react';
import { CheckIcon, ImageIcon, XIcon } from '@phosphor-icons/react';

interface VendorOnboardingPageProps {
    bookingPageBaseUrl: string;
    copy: Record<string, string>;
}

interface VendorOnboardingForm {
    business_name: string;
    logo: File | null;
    slug: string;
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
    const form = useForm<VendorOnboardingForm>({
        business_name: '',
        logo: null,
        slug: '',
    });
    const [{ files }, { clearFiles, getInputProps }] = useFileUpload({
        accept: 'image/*',
        maxFiles: 1,
        maxSize: 2 * 1024 * 1024,
        onFilesChange(files) {
            const logo = files[0]?.file;

            if (logo instanceof File) {
                form.setData('logo', logo);
            }
        },
    });
    const { data, errors, processing } = form;
    const previewSlug = slugify(data.slug);
    const previewBookingPageUrl = `${bookingPageBaseUrl}${previewSlug}`;
    const logoPreviewUrl = files[0]?.preview;

    function clearLogo() {
        clearFiles();
        form.setData('logo', null);
    }

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
                            form.submit(store());
                        }}
                        inert={processing ? true : undefined}
                        className="flex w-full flex-col gap-6"
                    >
                        <FieldGroup>
                            <Field orientation="vertical" data-invalid={errors.logo ? true : undefined}>
                                <div className="flex items-end gap-2">
                                    <label
                                        htmlFor="business-logo"
                                        className="flex size-24 max-w-24 cursor-pointer overflow-hidden"
                                    >
                                        {logoPreviewUrl ? (
                                            <img
                                                src={logoPreviewUrl}
                                                alt=""
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center border border-dashed border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                                                <ImageIcon className="size-5" />
                                            </div>
                                        )}
                                    </label>
                                    <Input
                                        {...getInputProps({
                                            id: 'business-logo',
                                            accept: 'image/*',
                                            className: 'sr-only',
                                            'aria-invalid': Boolean(errors.logo),
                                        })}
                                    />

                                    {logoPreviewUrl ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={clearLogo}
                                            aria-label={copy.clear_logo}
                                        >
                                            <XIcon />
                                            <span>Clear</span>
                                        </Button>
                                    ) : null}
                                </div>

                                <FieldContent>
                                    <FieldLabel htmlFor="business-logo">{copy.logo_label}</FieldLabel>
                                    <FieldDescription>{copy.logo_help}</FieldDescription>
                                </FieldContent>

                                <FieldError>{errors.logo}</FieldError>
                            </Field>

                            <Field data-invalid={errors.business_name ? true : undefined}>
                                <FieldLabel htmlFor="business-name">{copy.business_name_label}</FieldLabel>
                                <Input
                                    id="business-name"
                                    value={data.business_name}
                                    onChange={(event) => {
                                        form.setData('business_name', event.target.value);
                                        form.setData('slug', slugifyTyping(event.target.value));
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
                                    onChange={(event) => form.setData('slug', event.target.value)}
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
