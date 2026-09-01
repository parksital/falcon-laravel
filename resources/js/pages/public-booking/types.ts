export type Vendor = {
    id: number;
    name: string;
    slug: string;
    location: string;
    short_description: string | null;
    joined_at: string | null;
    url: string;
    logo_url: string | null;
};

export type Service = {
    id: number;
    name: string;
    slug: string;
    category: string;
    category_label: string;
    description: string | null;
    price_in_minor: number | null;
    pricing_type: string | null;
    price_type_label: string | null;
    url: string;
};

export type PublicBookingPageProps = {
    copy: Record<string, string>;
    vendor: Vendor;
    services: Service[];
    locale: string;
    seo: {
        title: string;
        description: string;
        canonical: string;
    };
};

export type PublicBookingServicePageProps = {
    copy: Record<string, string>;
    vendor: Vendor;
    service: Service;
    locale: string;
    seo: {
        title: string;
        description: string;
        canonical: string;
    };
};
