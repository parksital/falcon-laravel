import { PublicFooterWordmark } from '@/components/public-footer-wordmark';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function MobilePublicFooter() {
    const { layoutCopy, locale } = usePage<SharedData>().props;

    return (
        <footer className="border-t bg-background">
            <div className="flex flex-col gap-8 px-4 pt-10">
                <div className="flex items-start justify-between gap-4 text-sm text-muted-foreground">
                    <p className="text-xs">© {new Date().getFullYear()} huurmaar.nl</p>
                    <nav className="flex flex-col items-end">
                        <Button asChild variant="link" size="lg">
                            <a href="mailto:info@huurmaar.nl">{layoutCopy.footer_contact}</a>
                        </Button>
                        <Button asChild variant="link" size="lg">
                            <a href="https://www.instagram.com/huurmaar.nl/" target="_blank" rel="noopener noreferrer">{layoutCopy.footer_instagram}</a>
                        </Button>
                        <Button asChild variant="link" size="lg">
                            <a href={`/legal.${locale}.txt`} target="_blank" rel="noopener noreferrer">{layoutCopy.footer_legal}</a>
                        </Button>
                        <Button asChild variant="link" size="lg">
                            <a href={`/privacy.${locale}.txt`} target="_blank" rel="noopener noreferrer">{layoutCopy.footer_privacy}</a>
                        </Button>
                    </nav>
                </div>

                <PublicFooterWordmark />
            </div>
        </footer>
    );
}
