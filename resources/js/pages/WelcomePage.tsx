import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

type WelcomePageProps = {
    canRegister?: boolean;
}

export default function WelcomePage({ canRegister = true }: WelcomePageProps) {

    const { auth } = usePage<SharedData>().props;

    return (
        <main className="flex min-h-screen flex-col items-center">
            <Head title="Welcome" />

            <header className="w-full p-2">
                <nav className="flex items-center justify-end gap-2">
                    {auth.user ? (
                        <Link href={dashboard()}>
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Button className='px-0' variant={"link"} size={"sm"} asChild>
                                <Link href={login()}>
                                    Log in
                                </Link>
                            </Button>

                            {canRegister && (
                                <Button className='px-0' variant={"link"} size={"sm"} asChild>
                                    <Link href={register()}>
                                        Register
                                    </Link>
                                </Button>
                            )}
                        </>
                    )}
                </nav>
            </header>

            <div className=''>

            </div>
        </main >
    );
}
