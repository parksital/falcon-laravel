// Components
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head, router } from '@inertiajs/react';

export default function VerifyEmailPage({ status }: { status?: string }) {
    return (
        <AuthSplitLayout>
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <Form {...send()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            Resend verification email
                        </Button>

                        <button
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                router.post(logout.url(), {}, {
                                    preserveState: false,
                                    replace: true,
                                });
                            }}
                            className="mx-auto block text-foreground text-sm underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
                        >
                            Log out
                        </button>
                    </>
                )}
            </Form>
        </AuthSplitLayout>
    );
}
