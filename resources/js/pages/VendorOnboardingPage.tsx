import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { store } from '@/routes/vendor';
import { Head, useForm } from '@inertiajs/react';
import { CheckIcon } from '@phosphor-icons/react';

interface VendorOnboardingPageProps {
    initialValues: {
        business_name: string;
        location: string;
    };
}

export default function VendorOnboardingPage({
    initialValues,
}: VendorOnboardingPageProps) {
    const form = useForm({
        business_name: initialValues.business_name,
        location: initialValues.location,
    });

    return (
        <AuthSplitLayout>
            <Head title="Onboarding" />

            <main className="mx-auto flex min-h-dvh w-full max-w-[350px] flex-col justify-center space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-xl font-medium">Welcome</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Add the basics for your vendor profile.
                    </p>
                </div>

                <form
                    className="flex flex-col gap-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post(store().url);
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor="business-name">Business name</Label>
                        <Input
                            id="business-name"
                            name="business_name"
                            type="text"
                            autoFocus
                            required
                            maxLength={120}
                            placeholder="Required"
                            value={form.data.business_name}
                            onChange={(event) =>
                                form.setData(
                                    'business_name',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={form.errors.business_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="location">City</Label>
                        <Input
                            id="location"
                            name="location"
                            type="text"
                            required
                            maxLength={120}
                            placeholder="Where are you based?"
                            value={form.data.location}
                            onChange={(event) =>
                                form.setData('location', event.target.value)
                            }
                        />
                        <InputError message={form.errors.location} />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={form.processing}
                    >
                        {form.processing ? <Spinner /> : <CheckIcon />}
                        Continue
                    </Button>
                </form>
            </main>
        </AuthSplitLayout>
    );
}
