import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { store } from '@/routes/vendor';
import { Form, Head } from '@inertiajs/react';
import { CheckIcon } from '@phosphor-icons/react';

interface VendorOnboardingPageProps {
    vendor: {
        business_name: string;
        location: string;
    };
    copy: {
        title: string;
        heading: string;
        description: string;
        business_name_label: string;
        business_name_placeholder: string;
        location_label: string;
        location_placeholder: string;
        submit: string;
    };
}

export default function VendorOnboardingPage({
    vendor,
    copy,
}: VendorOnboardingPageProps) {
    return (
        <AuthSplitLayout>
            <Head title={copy.title} />

            <main className="mx-auto flex min-h-dvh w-full max-w-[350px] flex-col justify-center space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-xl font-medium">{copy.heading}</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        {copy.description}
                    </p>
                </div>

                <Form
                    {...store.form()}
                    disableWhileProcessing
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="business-name">{copy.business_name_label}</Label>
                                <Input
                                    id="business-name"
                                    name="business_name"
                                    type="text"
                                    autoFocus
                                    required
                                    maxLength={120}
                                    placeholder={copy.business_name_placeholder}
                                    defaultValue={vendor.business_name}
                                />
                                <InputError message={errors.business_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="location">{copy.location_label}</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    type="text"
                                    required
                                    maxLength={120}
                                    placeholder={copy.location_placeholder}
                                    defaultValue={vendor.location}
                                />
                                <InputError message={errors.location} />
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? <Spinner /> : <CheckIcon />}
                                {copy.submit}
                            </Button>
                        </>
                    )}
                </Form>
            </main>
        </AuthSplitLayout>
    );
}
