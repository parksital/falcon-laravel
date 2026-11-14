import { store } from '@/actions/Laravel/Fortify/Http/Controllers/RegisteredUserController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { login } from '@/routes';
import { Form, Head, Link } from '@inertiajs/react';

interface RegisterPageProps {
    copy: {
        title: string;
        heading: string;
        description: string;
        name_label: string;
        name_placeholder: string;
        email_label: string;
        email_placeholder: string;
        password_label: string;
        password_placeholder: string;
        password_confirmation_label: string;
        password_confirmation_placeholder: string;
        submit: string;
        login_prompt: string;
        login_link: string;
    };
}

export default function RegisterPage({ copy }: RegisterPageProps) {
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
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">{copy.name_label}</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder={copy.name_placeholder}
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">{copy.email_label}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder={copy.email_placeholder}
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">{copy.password_label}</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
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
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder={copy.password_confirmation_placeholder}
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-2 w-full"
                                    tabIndex={5}
                                    data-test="register-user-button"
                                >
                                    {processing && <Spinner />}
                                    {copy.submit}
                                </Button>
                            </div>

                            <div className="text-center text-xs text-muted-foreground">
                                {copy.login_prompt}{' '}
                                <Link
                                    href={login()}
                                    tabIndex={6}
                                    className="text-foreground text-xs underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
                                >
                                    {copy.login_link}
                                </Link>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AuthSplitLayout>
    );
}
