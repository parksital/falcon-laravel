import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { PublicServiceCard } from './public-service-card';
import { type PublicVendorPageProps } from './types';

function interpolate(value: string, replacements: Record<string, string>) {
    return Object.entries(replacements).reduce(
        (result, [key, replacement]) => result.replace(`:${key}`, replacement),
        value,
    );
}

export default function DesktopPublicBookingPage({ copy, vendor, services }: PublicVendorPageProps) {
    return (
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12">
            <section className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                    {vendor.logo_url && (
                        <div className="size-24 shrink-0 overflow-hidden border">
                            <img src={vendor.logo_url} alt={vendor.name} className="size-full object-cover" />
                        </div>
                    )}

                    <div>
                        <p className="text-sm text-muted-foreground">{vendor.location}</p>
                        <h1 className="text-3xl font-semibold text-foreground">{vendor.name}</h1>
                        {vendor.short_description ? (
                            <p className="max-w-2xl text-sm text-muted-foreground">{vendor.short_description}</p>
                        ) : null}

                        <p className="text-sm text-muted-foreground">
                            {interpolate(copy.joined, { formatted_date: vendor.joined_at })}
                        </p>
                    </div>
                </div>
            </section>

            <section className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold text-foreground">
                    {copy.services_heading}
                </h2>
                {services.length > 0 ? (
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                        {services.map((service) => (
                            <PublicServiceCard key={service.id} copy={copy} service={service} />
                        ))}
                    </div>
                ) : (
                    <Empty className="border">
                        <EmptyHeader>
                            <EmptyMedia>
                                <h1 className="text-6xl">⛰️</h1>
                            </EmptyMedia>
                            <EmptyTitle>{copy.services_empty_title}</EmptyTitle>
                            <EmptyDescription>
                                {interpolate(copy.services_empty_description, { vendor: vendor.name })}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
            </section>
        </main>
    );
}
