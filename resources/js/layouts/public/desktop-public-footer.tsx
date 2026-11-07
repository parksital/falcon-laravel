import { PublicFooterWordmark } from '@/components/public-footer-wordmark';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function DesktopPublicFooter() {
    const { layoutCopy, locale } = usePage<SharedData>().props;

    return (
        <footer className="border-t bg-background">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pt-10">
                <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>{layoutCopy.footer_tagline}</p>
                    <nav className="flex">
                        <Button asChild variant="link">
                            <a href="mailto:info@huurmaar.nl">{layoutCopy.footer_contact}</a>
                        </Button>
                        <Button asChild variant="link">
                            <a href="https://www.instagram.com/huurmaar.nl/" target="_blank" rel="noopener noreferrer">{layoutCopy.footer_instagram}</a>
                        </Button>
                        <Button asChild variant="link">
                            <a href={`/legal.${locale}.txt`} target="_blank" rel="noopener noreferrer">{layoutCopy.footer_legal}</a>
                        </Button>
                        <Button asChild variant="link">
                            <a href={`/privacy.${locale}.txt`} target="_blank" rel="noopener noreferrer">{layoutCopy.footer_privacy}</a>
                        </Button>
                    </nav>
                </div>

                <PublicFooterWordmark />
            </div>
        </footer>
    );
}
