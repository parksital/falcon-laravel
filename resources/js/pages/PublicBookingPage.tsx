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
import {
    NativeSelect,
    NativeSelectOption,
} from '@/components/ui/native-select';
import { useMediaQuery } from '@/hooks/use-media-query';
import PublicBookingShell from '@/layouts/public/public-booking-shell';
import DesktopPublicBookingPage from '@/pages/public-booking/DesktopPublicBookingPage';
import MobilePublicBookingPage from '@/pages/public-booking/MobilePublicBookingPage';
import { type PublicBookingPageProps } from '@/pages/public-booking/types';
import { update as updateLocale } from '@/routes/locale';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { GlobeIcon } from '@phosphor-icons/react';

export default function PublicBookingPage(props: PublicBookingPageProps) {
    const isMobile = useMediaQuery('(max-width: 640px)');
    const { layoutCopy } = usePage<SharedData>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: props.vendor.name, href: props.vendor.url },
    ];
    const languageSwitcher = (
        <>
            <div className="sm:hidden">
                <NativeSelect
                    value={props.locale}
                    aria-label={layoutCopy.language}
                    onChange={(event) => changeLocale(event.target.value)}
                >
                    <NativeSelectOption value="en">{layoutCopy.language_english}</NativeSelectOption>
                    <NativeSelectOption value="nl">{layoutCopy.language_dutch}</NativeSelectOption>
                </NativeSelect>
            </div>

            <div className="hidden sm:block">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                            <GlobeIcon data-icon="inline-start" />
                            {props.locale === 'nl' ? layoutCopy.language_dutch : layoutCopy.language_english}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>{layoutCopy.language}</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={props.locale} onValueChange={changeLocale}>
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
        </>
    );

    function changeLocale(nextLocale: string) {
        if (nextLocale !== props.locale) {
            router.patch(updateLocale.url(), { locale: nextLocale }, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    }

    return (
        <PublicBookingShell breadcrumbs={breadcrumbs} headerAction={languageSwitcher}>
            <Head title={props.seo.title}>
                <meta name="description" content={props.seo.description} />
                <link rel="canonical" href={props.seo.canonical} />
            </Head>

            {isMobile ? (
                <MobilePublicBookingPage {...props} />
            ) : (
                <DesktopPublicBookingPage {...props} />
            )}
        </PublicBookingShell>
    );
}
