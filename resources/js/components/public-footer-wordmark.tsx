import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function PublicFooterWordmark() {
    const { layoutCopy } = usePage<SharedData>().props;

    return (
        <svg viewBox="0 0 948.5 148" role="img" aria-label={layoutCopy.app_name} className="pointer-events-none w-full overflow-hidden select-none">
            <text x="-14.6" y="145.5" textLength="967" lengthAdjust="spacingAndGlyphs" fontSize="200" className="fill-muted-foreground/20 font-heading font-semibold">
                {layoutCopy.app_name}
            </text>
        </svg>
    );
}
