import { AppContent } from '@/components/app-content';
import AppLogoIcon from '@/components/app-logo-icon';
import { AppShell } from '@/components/app-shell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
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
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Menu, Settings } from 'lucide-react';
import type { PropsWithChildren } from 'react';

export default function AppHeaderLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;

    const getInitials = useInitials();

    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <AppShell>
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex items-center px-4 py-2 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px]"
                                >
                                    <Menu className="h-5 w-5" />
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
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="flex h-full w-full items-center justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <div className="flex flex-row items-center">
                                    <Avatar className="">
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <p></p>
                                    </div>
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
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            className="block w-full"
                                            href={edit()}
                                            as="button"
                                            prefetch
                                            onClick={cleanup}
                                        >
                                            <Settings className="mr-2" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        className="block w-full"
                                        href={logout()}
                                        as="button"
                                        onClick={handleLogout}
                                        data-test="logout-button"
                                    >
                                        <LogOut className="mr-2" />
                                        Log out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <AppContent>{children}</AppContent>
        </AppShell>
    );
}
