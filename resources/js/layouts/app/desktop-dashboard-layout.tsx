import { AppContent } from '@/components/app-content';
import AppLogoIcon from '@/components/app-logo-icon';
import { AppShell } from '@/components/app-shell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/sonner';
import { UserInfo } from '@/components/user-info';
import { useInitials } from '@/hooks/use-initials';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout, overview } from '@/routes';
import { update as updateLocale } from '@/routes/locale';
import { type BreadcrumbItem as BreadcrumbItemType, SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { SignOutIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Fragment, useEffect, type PropsWithChildren } from 'react';

type DesktopDashboardLayoutProps = PropsWithChildren<{
    breadcrumbs?: BreadcrumbItemType[];
}>;

export default function DesktopDashboardLayout({ children, breadcrumbs = [] }: DesktopDashboardLayoutProps) {
    const page = usePage<SharedData>();
    const { auth, flash, layoutCopy, name } = page.props;
    const currentLocale =
        auth.user.preferred_locale === 'en' || auth.user.preferred_locale === 'nl'
            ? auth.user.preferred_locale
            : page.props.locale;

    const getInitials = useInitials();
    const cleanup = useMobileNavigation();

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success, { id: 'flash-success' });
        }
    }, [flash.success]);

    const handleLogout = () => {
        cleanup();
        router.flushAll();
        router.post(logout.url(), {}, { preserveState: false, replace: true });
    };

    const handleLocaleChange = (locale: string) => {
        router.patch(updateLocale.url(), { locale }, { preserveScroll: true });
    };

    return (
        <AppShell>
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex flex-col px-4 max-w-7xl">
                    <div className="flex h-16 items-center gap-6">
                        <Link href={overview.url()} className="flex items-center gap-2">
                            <AppLogoIcon className="size-6 fill-current text-black dark:text-white" />
                            <span className="font-semibold text-foreground text-xs">
                                {name}
                            </span>
                        </Link>

                        <Breadcrumb className='mr-auto'>
                            <BreadcrumbList className="flex-nowrap gap-2 text-sm">
                                {breadcrumbs.map((item, index) => (
                                    <Fragment key={`${item.title}-${index}`}>
                                        {index > 0 && (
                                            <BreadcrumbSeparator/>
                                        )}

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

                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <div className="flex flex-row items-center">
                                    <Avatar>
                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                        <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <UserInfo user={auth.user} showEmail={true} />
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>{layoutCopy.language}</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuRadioGroup value={currentLocale} onValueChange={handleLocaleChange}>
                                            <DropdownMenuRadioItem value="en">
                                                {layoutCopy.language_english}
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="nl">
                                                {layoutCopy.language_dutch}
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={(event) => {
                                        event.preventDefault();
                                        handleLogout();
                                    }}
                                    data-test="logout-button"
                                >
                                    <SignOutIcon />
                                    {layoutCopy.logout}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <AppContent>
                {children}
            </AppContent>

            <Toaster />
        </AppShell>
    );
}
