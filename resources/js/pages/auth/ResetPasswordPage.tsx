import { Form, Head } from '@inertiajs/react';

import { store } from '@/actions/Laravel/Fortify/Http/Controllers/NewPasswordController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
    copy: {
        title: string;
        heading: string;
        description: string;
        email_label: string;
        password_label: string;
        password_placeholder: string;
        password_confirmation_label: string;
        password_confirmation_placeholder: string;
        submit: string;
    };
}

export default function ResetPasswordPage({
    token,
    email,
    copy,
}: ResetPasswordProps) {
    return (
        <AuthSplitLayout>
            <Head title={copy.title} />

            <div className="mx-auto flex w-[350px] flex-col justify-center space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-xl font-medium">{copy.heading}</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        {copy.description}
                    </p>
                </div>

                <Form
                    {...store.form()}
                    transform={(data) => ({ ...data, token, email })}
                    resetOnSuccess={['password', 'password_confirmation']}
                >
                    {({ processing, errors }) => (
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">{copy.email_label}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    className="mt-1 block w-full"
                                    readOnly
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">{copy.password_label}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    autoComplete="new-password"
                                    className="mt-1 block w-full"
                                    autoFocus
                                    placeholder={copy.password_placeholder}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    {copy.password_confirmation_label}
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    className="mt-1 block w-full"
                                    placeholder={copy.password_confirmation_placeholder}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                disabled={processing}
                                data-test="reset-password-button"
                            >
                                {processing && <Spinner />}
                                {copy.submit}
                            </Button>
                        </div>
                    )}
                </Form>
            </div>
        </AuthSplitLayout>
    );
}
