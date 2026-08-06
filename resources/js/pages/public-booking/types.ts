export type Vendor = {
    id: number;
    name: string;
    slug: string;
    location: string;
    short_description: string | null;
    joined_at: string | null;
    url: string;
};

export type Service = {
    id: number;
    name: string;
    slug: string;
    category: string;
    category_label: string;
    description: string | null;
    price_in_minor: number | null;
    unit: string | null;
    unit_label: string | null;
    url: string;
};

export type PublicBookingPageProps = {
    copy: Record<string, string>;
    vendor: Vendor;
    services: Service[];
    featuredServiceSlug: string | null;
    locale: string;
    seo: {
        title: string;
        description: string;
        canonical: string;
    };
};
