import { useMediaQuery } from '@/hooks/use-media-query';
import PublicLayout from '@/layouts/public/public-layout';
import DesktopPublicBookingPage from '@/pages/public-booking/DesktopPublicBookingPage';
import MobilePublicVendorPage from '@/pages/public-booking/MobilePublicVendorPage';
import { type PublicVendorPageProps } from '@/pages/public-booking/types';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

export default function PublicVendorPage(props: PublicVendorPageProps) {
    const isMobile = useMediaQuery('(max-width: 640px)');
    const breadcrumbs: BreadcrumbItem[] = [
        { title: props.vendor.name, href: props.vendor.url },
    ];

    return (
        <PublicLayout breadcrumbs={breadcrumbs}>
            <Head title={props.seo.title}>
                <meta name="description" content={props.seo.description} />
                <link rel="canonical" href={props.seo.canonical} />
            </Head>

            {isMobile ? (
                <MobilePublicVendorPage {...props} />
            ) : (
                <DesktopPublicBookingPage {...props} />
            )}
        </PublicLayout>
    );
}
