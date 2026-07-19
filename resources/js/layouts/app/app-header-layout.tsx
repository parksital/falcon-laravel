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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserInfo } from '@/components/user-info';
import { useInitials } from '@/hooks/use-initials';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { ListIcon, SignOutIcon } from '@phosphor-icons/react';
import type { PropsWithChildren } from 'react';

export default function AppHeaderLayout({ children }: PropsWithChildren) {
    const page = usePage<SharedData>();
    const { auth, name } = page.props;
    const currentPath = page.url.split('?')[0];

    const getInitials = useInitials();

    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <AppShell>
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex flex-col px-4 md:max-w-7xl">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="lg:hidden">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="-ml-2 size-[34px]"
                                        >
                                            <ListIcon data-icon="inline-start" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent
                                        side="left"
                                        className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
                                    >
                                        <SheetTitle className="sr-only">
                                            Navigation Menu
                                        </SheetTitle>
                                        <SheetHeader className="flex justify-start text-left">
                                            <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                        </SheetHeader>
                                        <nav className="flex flex-col gap-1 px-4 text-sm font-medium text-sidebar-foreground">
                                            <Link
                                                href="/overview"
                                                className={cn(
                                                    'px-2 py-2 transition-colors hover:text-foreground',
                                                    currentPath ===
                                                        '/overview' &&
                                                        'text-foreground',
                                                )}
                                            >
                                                Overview
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className={cn(
                                                    'px-2 py-2 transition-colors hover:text-foreground',
                                                    currentPath ===
                                                        '/settings' &&
                                                        'text-foreground',
                                                )}
                                            >
                                                Settings
                                            </Link>
                                        </nav>
                                    </SheetContent>
                                </Sheet>
                            </div>

                            <AppLogoIcon className="size-6 fill-current text-black dark:text-white" />
                            <span className="text-base font-semibold text-foreground">
                                {name}
                            </span>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <div className="flex flex-row items-center">
                                    <Avatar>
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <UserInfo
                                            user={auth.user}
                                            showEmail={true}
                                        />
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        className="block w-full"
                                        href={logout()}
                                        as="button"
                                        onClick={handleLogout}
                                        data-test="logout-button"
                                    >
                                        <SignOutIcon className="mr-2" />
                                        Log out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex items-end">
                        <nav className="hidden items-center gap-4 text-sm font-medium text-muted-foreground lg:flex">
                            <Button
                                variant="ghost"
                                asChild
                                className={cn(
                                    currentPath === '/overview' &&
                                        'text-foreground',
                                )}
                            >
                                <Link href="/overview">Overview</Link>
                            </Button>
                            <Button
                                variant="ghost"
                                asChild
                                className={cn(
                                    currentPath === '/settings' &&
                                        'text-foreground',
                                )}
                            >
                                <Link href="/settings">Settings</Link>
                            </Button>
                        </nav>
                    </div>
                </div>
            </div>

            <AppContent>{children}</AppContent>
        </AppShell>
    );
}
