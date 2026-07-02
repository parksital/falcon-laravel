import InputError from '@/components/input-error';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { store } from '@/routes/merchant';
import { SelectOption } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { CheckIcon } from '@phosphor-icons/react';

interface MerchantOnboardingPageProps {
    merchantTypes: SelectOption[];
    initialValues: {
        business_name: string;
        business_type: string;
        contact_email: string;
        short_description: string;
    };
}

export default function MerchantOnboardingPage({
    merchantTypes,
    initialValues,
}: MerchantOnboardingPageProps) {
    const form = useForm({
        business_name: initialValues.business_name,
        business_type: initialValues.business_type,
        contact_email: initialValues.contact_email,
        short_description: initialValues.short_description,
    });

    return (
        <AuthSplitLayout>
            <Head title="Onboarding" />

            <main className="mx-auto flex min-h-dvh w-full max-w-[350px] flex-col justify-center space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-xl font-medium">Welcome</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Set up your business to get started.
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
                        <Label htmlFor="business-name">
                            Business name
                        </Label>
                        <Input
                            id="business-name"
                            name="business_name"
                            type="text"
                            autoFocus
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
                        <Label htmlFor="business-type">
                            Business type
                        </Label>
                        <Select
                            name="business_type"
                            value={form.data.business_type}
                            onValueChange={(value) =>
                                form.setData('business_type', value)
                            }
                        >
                            <SelectTrigger
                                id="business-type"
                                className="w-full"
                            >
                                <SelectValue placeholder="Required" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                {merchantTypes.map((merchantType) => (
                                    <SelectItem
                                        key={merchantType.value}
                                        value={merchantType.value}
                                    >
                                        {merchantType.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.business_type} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="contact-email">Contact email</Label>
                        <Input
                            id="contact-email"
                            name="contact_email"
                            type="email"
                            placeholder="Enter a business contact email"
                            value={form.data.contact_email}
                            onChange={(event) =>
                                form.setData(
                                    'contact_email',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={form.errors.contact_email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="short-description">
                            Short description
                        </Label>

                        <Textarea
                            id="short-description"
                            name="short_description"
                            rows={4}
                            placeholder="Summarize what you offer and the types of events you serve."
                            value={form.data.short_description}
                            onChange={(event) =>
                                form.setData(
                                    'short_description',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={form.errors.short_description} />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={form.processing}
                    >
                        {form.processing ? <Spinner /> : <CheckIcon/>}
                        Continue

                    </Button>
                </form>
            </main>
        </AuthSplitLayout>
    );
}
