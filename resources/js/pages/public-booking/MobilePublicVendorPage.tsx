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

export default function MobilePublicVendorPage({ copy, vendor, services }: PublicVendorPageProps) {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-4">
            <section className="flex flex-col gap-2">
                <div className="flex flex-row gap-2">
                    {vendor.logo_url && (
                        <div className="size-16 overflow-hidden border">
                            <img src={vendor.logo_url} alt={vendor.name} className="size-full object-cover" />
                        </div>
                    )}

                    <div className="flex flex-col gap-0">
                        <p className="text-sm text-muted-foreground">{vendor.location}</p>
                        <h1 className="text-2xl font-semibold text-foreground">{vendor.name}</h1>

                        {vendor.short_description ? (
                            <p className="text-sm text-muted-foreground">{vendor.short_description}</p>
                        ) : null}
                        {vendor.joined_at ? (
                            <p className="text-xs text-muted-foreground">
                                {interpolate(copy.joined, { formatted_date: vendor.joined_at })}
                            </p>
                        ) : null}
                    </div>
                </div>
            </section>

            <section className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-foreground">
                    {copy.services_heading}
                </h2>
                {services.length > 0 ? (
                    <div className="grid gap-4">
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
