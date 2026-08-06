import { AppContent } from '@/components/app-content';
import AppLogoIcon from '@/components/app-logo-icon';
import { AppShell } from '@/components/app-shell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';
import { UserInfo } from '@/components/user-info';
import { useInitials } from '@/hooks/use-initials';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { cn } from '@/lib/utils';
import { logout, overview } from '@/routes';
import { update as updateLocale } from '@/routes/locale';
import { type BreadcrumbItem as BreadcrumbItemType, SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { ListIcon, SignOutIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useEffect, type PropsWithChildren } from 'react';

type MobileDashboardLayoutProps = PropsWithChildren<{
    breadcrumbs?: BreadcrumbItemType[];
}>;

export default function MobileDashboardLayout({ children, breadcrumbs = [] }: MobileDashboardLayoutProps) {
    const page = usePage<SharedData>();
    const { auth, flash, layoutCopy, name } = page.props;
    const currentPath = page.url.split('?')[0];
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
                <div className="flex h-14 items-center justify-between px-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="-ml-2 size-[34px]">
                                    <ListIcon data-icon="inline-start" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar">
                                <SheetTitle className="sr-only">
                                    {layoutCopy.navigation_menu}
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>
                                <nav className="flex flex-col gap-1 px-4 text-sm font-medium text-sidebar-foreground">
                                    <Link
                                        href="/overview"
                                        className={cn(
                                            'px-2 py-2 transition-colors hover:text-foreground',
                                            currentPath === '/overview' && 'text-foreground',
                                        )}
                                    >
                                        {layoutCopy.nav_overview}
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className={cn(
                                            'px-2 py-2 transition-colors hover:text-foreground',
                                            currentPath === '/settings' && 'text-foreground',
                                        )}
                                    >
                                        {layoutCopy.nav_settings}
                                    </Link>
                                </nav>
                            </SheetContent>
                        </Sheet>

                        <Link href={overview.url()} className="flex min-w-0 items-center gap-2">
                            <AppLogoIcon className="size-6 shrink-0 fill-current text-black dark:text-white" />
                            <span className="truncate text-base font-semibold text-foreground">
                                {breadcrumbs.at(-1)?.title || name}
                            </span>
                        </Link>
                    </div>

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

            <AppContent>{children}</AppContent>
            <Toaster />
        </AppShell>
    );
}
