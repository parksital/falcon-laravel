import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { home } from '@/routes';
import { update as updateLocale } from '@/routes/locale';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { GlobeIcon } from '@phosphor-icons/react';
import { type PropsWithChildren } from 'react';

export default function AuthSplitLayout({ children }: PropsWithChildren) {
    const { layoutCopy, locale, name } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="absolute top-6 right-6 z-20">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                            <GlobeIcon data-icon="inline-start" />
                            {locale === 'nl' ? layoutCopy.language_dutch : layoutCopy.language_english}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>{layoutCopy.language}</DropdownMenuLabel>
                            <DropdownMenuRadioGroup
                                value={locale}
                                onValueChange={(nextLocale) => {
                                    if (nextLocale !== locale) {
                                        router.patch(updateLocale.url(), { locale: nextLocale }, {
                                            preserveScroll: true,
                                            preserveState: true,
                                        });
                                    }
                                }}
                            >
                                <DropdownMenuRadioItem value="en">
                                    {layoutCopy.language_english}
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="nl">
                                    {layoutCopy.language_dutch}
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-lg font-medium"
                >
                    <AppLogoIcon className="mr-2 size-8 fill-current text-white" />
                    {name}
                </Link>
            </div>

            <div className="w-full">{children}</div>
        </div>
    );
}
