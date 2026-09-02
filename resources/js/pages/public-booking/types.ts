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

export type ServiceMedia = {
    id: number;
    url: string;
    sort_order: number;
};

export type ServicePriceFeature = {
    id: number;
    feature_key: string;
    label: string;
    is_included: boolean;
    value: string | null;
    sort_order: number;
};

export type ServicePricingOption = {
    id: number;
    name: string;
    description: string | null;
    price_in_minor: number;
    pricing_type: string;
    price_type_label: string;
    features: ServicePriceFeature[];
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
    pricing_options: ServicePricingOption[];
    media: ServiceMedia[];
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
