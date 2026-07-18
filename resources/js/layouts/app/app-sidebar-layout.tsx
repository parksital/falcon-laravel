import { AppContent } from '@/components/app-content';
import AppLogoIcon from '@/components/app-logo-icon';
import { AppShell } from '@/components/app-shell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { useInitials } from '@/hooks/use-initials';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    PackageIcon,
    SignOutIcon,
    StorefrontIcon,
} from '@phosphor-icons/react';
import type { PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children }: PropsWithChildren) {
    const page = usePage<SharedData>();
    const { auth, name } = page.props;
    const currentPath = page.url.split('?')[0];

    const getInitials = useInitials();
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const isVendorProfileActive = currentPath.startsWith('/vendor');
    const isProductsActive = currentPath.startsWith('/products');

    return (
        <AppShell variant="sidebar">
            <Sidebar collapsible="none" className="h-svh">
                <SidebarHeader>
                    <div className="flex items-center gap-2 px-2 py-1">
                        <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                        <span className="text-sm font-semibold text-foreground">
                            {name}
                        </span>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isVendorProfileActive}
                                    >
                                        <Link href="/vendor/profile">
                                            <StorefrontIcon />
                                            <span>Vendor Profile</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isProductsActive}
                                    >
                                        <Link href="/products">
                                            <PackageIcon />
                                            <span>Products</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="mt-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="w-full">
                            <div className="flex items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={auth.user.avatar}
                                        alt={auth.user.name}
                                    />
                                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <span className="truncate text-sm font-medium text-foreground">
                                        {auth.user.name}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {auth.user.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className=""
                            align="end"
                            side="top"
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <UserInfo user={auth.user} showEmail />
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
                </SidebarFooter>
            </Sidebar>

            <AppContent variant="sidebar">{children}</AppContent>
        </AppShell>
    );
}
