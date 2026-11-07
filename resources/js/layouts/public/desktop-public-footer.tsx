import { PublicFooterLinks } from '@/components/public-footer-links';
import { PublicFooterWordmark } from '@/components/public-footer-wordmark';

export default function DesktopPublicFooter() {
    return (
        <footer className="border-t bg-background">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pt-10">
                <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} huurmaar.nl</p>
                    <nav className="-mr-2.5 flex">
                        <PublicFooterLinks size="default" />
                    </nav>
                </div>

                <PublicFooterWordmark />
            </div>
        </footer>
    );
}
