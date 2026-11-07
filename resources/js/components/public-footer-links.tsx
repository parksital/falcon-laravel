import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function PublicFooterLinks({ size }: { size: 'default' | 'lg' }) {
    const { layoutCopy } = usePage<SharedData>().props;

    return (
        <>
            <Button asChild variant="link" size={size}>
                <a href="mailto:info@huurmaar.nl">{layoutCopy.footer_contact}</a>
            </Button>
            <Button asChild variant="link" size={size}>
                <a href="https://www.instagram.com/huurmaar.nl/" target="_blank" rel="noopener noreferrer">{layoutCopy.footer_instagram}</a>
            </Button>
            <Button asChild variant="link" size={size}>
                <a href="/legal.txt">{layoutCopy.footer_legal}</a>
            </Button>
            <Button asChild variant="link" size={size}>
                <a href="/privacy.txt">{layoutCopy.footer_privacy}</a>
            </Button>
        </>
    );
}
