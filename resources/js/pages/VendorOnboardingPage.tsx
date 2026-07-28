import { Button } from '@/components/ui/button';
import {
    Field,
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

interface VendorOnboardingPageProps {
    copy: Record<string, string>;
}

export default function VendorOnboardingPage({ copy }: VendorOnboardingPageProps) {
    const form = useForm({
        business_name: '',
    });
    const { data, errors, processing } = form;

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
                            <Field data-invalid={errors.business_name ? true : undefined}>
                                <FieldLabel htmlFor="business-name">{copy.business_name_label}</FieldLabel>
                                <Input
                                    id="business-name"
                                    value={data.business_name}
                                    onChange={(event) => form.setData('business_name', event.target.value)}
                                    placeholder={copy.business_name_placeholder}
                                    maxLength={120}
                                    aria-invalid={Boolean(errors.business_name)}
                                    autoFocus
                                />
                                <FieldError>{errors.business_name}</FieldError>
                            </Field>
                        </FieldGroup>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={!data.business_name.trim() || processing}>
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
