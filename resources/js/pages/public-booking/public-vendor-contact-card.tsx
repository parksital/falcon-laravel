import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type Vendor } from './types';

type PublicVendorContactCardProps = {
    copy: Record<string, string>;
    vendor: Vendor;
};

export function PublicVendorContactCard({ copy, vendor }: PublicVendorContactCardProps) {
    if (!vendor.contact_email && !vendor.contact_phone && !vendor.website_url) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{copy.contact_title}</CardTitle>
                <CardDescription>{copy.contact_description.replace(':vendor', vendor.name)}</CardDescription>
            </CardHeader>
            <CardContent>
                <dl className="grid gap-2 text-sm">
                    {vendor.contact_email ? (
                        <div className="flex gap-2">
                            <dt className="text-muted-foreground">{copy.contact_email_label}</dt>
                            <dd><a href={`mailto:${vendor.contact_email}`} className="underline">{vendor.contact_email}</a></dd>
                        </div>
                    ) : null}
                    {vendor.contact_phone ? (
                        <div className="flex gap-2">
                            <dt className="text-muted-foreground">{copy.contact_phone_label}</dt>
                            <dd><a href={`tel:${vendor.contact_phone}`} className="underline">{vendor.contact_phone}</a></dd>
                        </div>
                    ) : null}
                    {vendor.website_url ? (
                        <div className="flex gap-2">
                            <dt className="text-muted-foreground">{copy.contact_website_label}</dt>
                            <dd><a href={vendor.website_url} target="_blank" rel="noopener noreferrer" className="underline">{vendor.website_url}</a></dd>
                        </div>
                    ) : null}
                </dl>
            </CardContent>
        </Card>
    );
}
