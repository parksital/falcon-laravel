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
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
    copy: {
        title: string;
        heading: string;
        description: string;
        email_label: string;
        email_placeholder: string;
        password_label: string;
        password_placeholder: string;
        forgot_password: string;
        submit: string;
        register_prompt: string;
        register_link: string;
    };
}

export default function LoginPage({
    status,
    canResetPassword,
    canRegister,
    copy,
}: LoginProps) {
    return (
        <AuthSplitLayout>
            <Head title={copy.title} />

            <div className="mx-auto flex w-[350px] flex-col justify-center gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-xl font-medium">
                        {copy.heading}
                    </h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        {copy.description}
                    </p>
                </div>

                <Form
                    {...store.form()}
                    options={{ replace: true }}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex flex-col gap-6">
                                <FieldGroup>
                                    <Field data-invalid={errors.email ? true : undefined}>
                                        <FieldLabel htmlFor="email">{copy.email_label}</FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder={copy.email_placeholder}
                                            aria-invalid={Boolean(errors.email)}
                                        />
                                        <FieldError>{errors.email}</FieldError>
                                    </Field>

                                    <Field data-invalid={errors.password ? true : undefined}>
                                        <div className="flex items-center">
                                            <FieldLabel htmlFor="password">
                                                {copy.password_label}
                                            </FieldLabel>
                                            {canResetPassword && (
                                                <Link
                                                    href={request()}
                                                    className="ml-auto text-foreground text-xs underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
                                                    tabIndex={5}
                                                >
                                                    {copy.forgot_password}
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
                                            placeholder={copy.password_placeholder}
                                            aria-invalid={Boolean(errors.password)}
                                        />
                                        <FieldError>{errors.password}</FieldError>
                                    </Field>
                                </FieldGroup>

                                <Button
                                    type="submit"
                                    className="mt-4 w-full"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && <Spinner data-icon="inline-start" />}
                                    {copy.submit}
                                </Button>
                            </div>

                            {canRegister && (
                                <div className="text-center text-xs text-muted-foreground">
                                    {copy.register_prompt}{' '}
                                    <Link
                                        href={register()}
                                        tabIndex={5}
                                        className="text-foreground text-xs underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
                                    >
                                        {copy.register_link}
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
