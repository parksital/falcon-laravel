import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function PublicFooterWordmark() {
    const { layoutCopy } = usePage<SharedData>().props;

    return (
        <svg viewBox="0 0 1008.5 148" role="img" aria-label={layoutCopy.app_name} className="pointer-events-none w-full overflow-hidden fill-muted-foreground/10 font-heading font-semibold select-none">
            <text x="-14.6" y="145.5" textLength="967" lengthAdjust="spacingAndGlyphs" fontSize="200">
                {layoutCopy.app_name}
            </text>
            <text x="955.2" y="47.3" textLength="58.5" lengthAdjust="spacingAndGlyphs" fontSize="64">
                ©
            </text>
        </svg>
    );
}
