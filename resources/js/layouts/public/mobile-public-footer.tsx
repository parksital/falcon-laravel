import { PublicFooterWordmark } from '@/components/public-footer-wordmark';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function MobilePublicFooter() {
    const { layoutCopy, locale } = usePage<SharedData>().props;

    return (
        <footer className="border-t bg-background">
            <div className="flex flex-col gap-8 px-4 pt-10">
                <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 text-sm text-muted-foreground">
                    <p className="text-xs">{layoutCopy.footer_tagline}</p>
                    <nav className="col-start-2 row-span-4 row-start-1 grid grid-rows-subgrid justify-items-end">
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
