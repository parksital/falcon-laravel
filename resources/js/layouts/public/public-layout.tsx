import AppLogoIcon from '@/components/app-logo-icon';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
import { Toaster } from '@/components/ui/sonner';
import { useMediaQuery } from '@/hooks/use-media-query';
import DesktopPublicLayout from '@/layouts/public/desktop-public-layout';
import MobilePublicLayout from '@/layouts/public/mobile-public-layout';
import { home, login, register } from '@/routes';
import { update as updateLocale } from '@/routes/locale';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { GlobeIcon } from '@phosphor-icons/react';
import { Fragment, type ReactNode } from 'react';

type PublicLayoutProps = {
    breadcrumbs?: BreadcrumbItemType[];
    children: ReactNode;
};

function PublicHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { layoutCopy, locale } = usePage<SharedData>().props;

    return (
        <header className="border-b bg-background">
            <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
                <Link href={home()} className="flex min-w-0 items-center gap-2 font-heading text-sm font-semibold">
                    <AppLogoIcon className="size-6 shrink-0 fill-current text-black dark:text-white" />
                    <span className="truncate">{layoutCopy.app_name}</span>
                </Link>

                {breadcrumbs.length > 0 ? (
                    <Breadcrumb className="min-w-0">
                        <BreadcrumbList className="flex-nowrap gap-2 text-sm">
                            {breadcrumbs.map((item, index) => (
                                <Fragment key={`${item.title}-${index}`}>
                                    {index > 0 ? <BreadcrumbSeparator /> : null}

                                    <BreadcrumbItem>
                                        <BreadcrumbLink asChild>
                                            <Button variant="ghost" disabled={index === breadcrumbs.length - 1} asChild>
                                                <Link href={item.href} className="flex min-w-0 items-center gap-2 text-foreground">
                                                    <span className="truncate">{item.title}</span>
                                                </Link>
                                            </Button>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                </Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                ) : null}

                <div className="flex-1" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="sm">
                            <GlobeIcon data-icon="inline-start" />
                            <span className="hidden sm:inline">
                                {locale === 'nl' ? layoutCopy.language_dutch : layoutCopy.language_english}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>{layoutCopy.language}</DropdownMenuLabel>
                            <DropdownMenuRadioGroup
                                value={locale}
                                onValueChange={(value) => {
                                    if (value !== locale) {
                                        router.patch(updateLocale.url(), { locale: value }, {
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

                <Button asChild variant="outline" size="sm">
                    <Link href={login()}>{layoutCopy.nav_login}</Link>
                </Button>
                <Button asChild size="sm">
                    <Link href={register()}>{layoutCopy.nav_register}</Link>
                </Button>
            </div>
        </header>
    );
}

export default function PublicLayout({ breadcrumbs = [], children }: PublicLayoutProps) {
    const isMobile = useMediaQuery('(max-width: 640px)');

    return isMobile ? (
        <MobilePublicLayout>
            <PublicHeader breadcrumbs={breadcrumbs} />
            {children}
            <Toaster />
        </MobilePublicLayout>
    ) : (
        <DesktopPublicLayout>
            <PublicHeader breadcrumbs={breadcrumbs} />
            {children}
            <Toaster />
        </DesktopPublicLayout>
    );
}
