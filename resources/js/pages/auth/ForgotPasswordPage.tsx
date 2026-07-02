// Components
import { login } from '@/routes';
import { email } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';
import { SpinnerIcon } from '@phosphor-icons/react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

export default function ForgotPasswordPage({ status }: { status?: string }) {
    return (
        <AuthSplitLayout>
            <Head title="Forgot password" />

            <div className="mx-auto flex w-[350px] flex-col justify-center space-y-6">
                {status && (
                    <div className="mb-4 text-center text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-xl font-medium">Forgot password</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Enter your email address and we&apos;ll send you a reset
                        link.
                    </p>
                </div>

                <div className="space-y-6">
                    <Form {...email()}>
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="off"
                                        autoFocus
                                        placeholder="email@example.com"
                                    />

                                    <InputError message={errors.email} />
                                </div>

                                <div className="my-6 flex items-center justify-start">
                                    <Button
                                        className="w-full"
                                        disabled={processing}
                                        data-test="email-password-reset-link-button"
                                    >
                                        {processing && (
                                            <SpinnerIcon className="h-4 w-4 animate-spin" />
                                        )}
                                        Email password reset link
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>

                    <div className="space-x-1 text-center text-xs text-muted-foreground">
                        <span>Or, return to</span>
                        <Link
                            href={login()}
                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500 text-xs"
                        >
                            log in
                        </Link>
                    </div>
                </div>
            </div>
        </AuthSplitLayout>
    );
}
