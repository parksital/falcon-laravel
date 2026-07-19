import {
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { SharedData, type User } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { SignOutIcon } from '@phosphor-icons/react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const { layoutCopy } = usePage<SharedData>().props;
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
        router.post(logout.url(), {}, { preserveState: false, replace: true });
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
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
        </>
    );
}
