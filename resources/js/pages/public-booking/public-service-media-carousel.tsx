import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { type ServiceMedia } from './types';

type PublicServiceMediaCarouselProps = {
    copy: Record<string, string>;
    serviceName: string;
    media: ServiceMedia[];
};

export function PublicServiceMediaCarousel({ copy, serviceName, media }: PublicServiceMediaCarouselProps) {
    const isMobile = useMediaQuery('(max-width: 640px)');
    const [api, setApi] = useState<CarouselApi>();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const hasMultiplePhotos = media.length > 1;

    useEffect(() => {
        if (!api) {
            return;
        }

        const onSelect = () => setSelectedIndex(api.selectedScrollSnap());

        api.on('select', onSelect);

        return () => {
            api.off('select', onSelect);
        };
    }, [api]);

    return (
        <section aria-label={copy.photos_label} className={cn('flex flex-col gap-1', isMobile && '-mx-4')}>
            <Carousel setApi={setApi} className="ring-1 ring-foreground/10">
                <CarouselContent className="ml-0">
                    {media.map((item, index) => (
                        <CarouselItem key={item.id} className="pl-0">
                            <div className={cn('flex items-center justify-center bg-secondary', isMobile ? 'aspect-4/3' : 'aspect-video')}>
                                <img src={item.url} alt={`${serviceName} ${index + 1}`} className="size-full object-contain" />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {hasMultiplePhotos && isMobile ? (
                    <span aria-hidden="true" className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-background px-2 text-xs/relaxed tabular-nums ring-1 ring-foreground/10">
                        {selectedIndex + 1} / {media.length}
                    </span>
                ) : null}
            </Carousel>

            {hasMultiplePhotos ? (
                <div className="flex justify-center">
                    {media.map((item, index) => (
                        <button
                            key={item.id}
                            type="button"
                            aria-label={copy.show_photo.replace(':number', String(index + 1))}
                            aria-current={index === selectedIndex ? 'true' : undefined}
                            onClick={() => api?.scrollTo(index)}
                            className="flex size-6 touch-manipulation items-center justify-center"
                        >
                            <span
                                className={cn(
                                    'h-1.5 rounded-full transition-[width,background-color]',
                                    index === selectedIndex ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/40',
                                )}
                            />
                        </button>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
