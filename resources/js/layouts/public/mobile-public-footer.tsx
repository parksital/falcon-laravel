import { PublicFooterLinks } from '@/components/public-footer-links';
import { PublicFooterWordmark } from '@/components/public-footer-wordmark';

export default function MobilePublicFooter() {
    return (
        <footer className="border-t bg-background">
            <div className="flex flex-col gap-8 px-4 pt-10">
                <div className="flex items-start justify-between gap-4 text-sm text-muted-foreground">
                    <p className="flex h-9 items-center">© {new Date().getFullYear()} huurmaar.nl</p>
                    <nav className="-mr-2.5 flex flex-col items-end">
                        <PublicFooterLinks size="lg" />
                    </nav>
                </div>

                <PublicFooterWordmark />
            </div>
        </footer>
    );
}
