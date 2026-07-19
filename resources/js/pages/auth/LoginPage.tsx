import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function LoginPage({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <AuthSplitLayout>
            <Head title="Log in" />

            <div className="mx-auto flex w-[350px] flex-col justify-center space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-xl font-medium">
                        Log in to your account
                    </h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Enter your email and password below to log in
                    </p>
                </div>

                <Form
                    {...store()}
                    options={{ preserveState: false, replace: true }}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        {canResetPassword && (
                                            <Link
                                                href={request()}
                                                className="ml-auto text-foreground text-xs underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
                                                tabIndex={5}
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Password"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label htmlFor="remember">
                                        Remember me
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-4 w-full"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && <Spinner />}
                                    Log in
                                </Button>
                            </div>

                            {canRegister && (
                                <div className="text-center text-xs text-muted-foreground">
                                    Don't have an account?{' '}
                                    <Link
                                        href={register()}
                                        tabIndex={5}
                                        className="text-foreground text-xs underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </Form>

                {status && (
                    <div className="mb-4 text-center text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}
            </div>
        </AuthSplitLayout>
    );
}
