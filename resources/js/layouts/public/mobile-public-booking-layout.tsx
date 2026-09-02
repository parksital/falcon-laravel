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
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from '@/components/ui/empty';
import { Toaster } from '@/components/ui/sonner';
import { index } from '@/routes';
import { type BreadcrumbItem as BreadcrumbItemType, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Fragment, type ReactNode } from 'react';

type MobilePublicBookingLayoutProps = {
    breadcrumbs: BreadcrumbItemType[];
    children: ReactNode;
    headerAction?: ReactNode;
};

export default function MobilePublicBookingLayout({ breadcrumbs, headerAction }: MobilePublicBookingLayoutProps) {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
            <header className="shrink-0 border-b border-sidebar-border/80 bg-background">
                <div className="flex h-16 items-center gap-3 px-4">
                    <Link href={index()} className="flex shrink-0 items-center gap-2">
                        <AppLogoIcon className="size-6 fill-current text-black dark:text-white" />
                        <span className="text-xs font-semibold text-foreground">
                            {name}
                        </span>
                    </Link>

                    <Breadcrumb className="mr-auto min-w-0">
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

                    {headerAction}
                </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <Empty className="min-h-full border-0">
                    <EmptyHeader>
                        <EmptyTitle>Desktop only for now</EmptyTitle>
                        <EmptyDescription>
                            {name} is currently only supported on desktop.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
            <Toaster />
        </div>
    );
}
