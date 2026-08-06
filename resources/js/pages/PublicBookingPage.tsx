import { useMediaQuery } from '@/hooks/use-media-query';
import PublicLayout from '@/layouts/public/public-layout';
import DesktopPublicBookingPage from '@/pages/public-booking/DesktopPublicBookingPage';
import MobilePublicBookingPage from '@/pages/public-booking/MobilePublicBookingPage';
import { type PublicBookingPageProps } from '@/pages/public-booking/types';
import { Head } from '@inertiajs/react';

export default function PublicBookingPage(props: PublicBookingPageProps) {
    const isMobile = useMediaQuery('(max-width: 640px)');

    return (
        <PublicLayout>
            <Head title={props.seo.title}>
                <meta name="description" content={props.seo.description} />
                <link rel="canonical" href={props.seo.canonical} />
            </Head>

            {isMobile ? (
                <MobilePublicBookingPage {...props} />
            ) : (
                <DesktopPublicBookingPage {...props} />
            )}
        </PublicLayout>
    );
}
