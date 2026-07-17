import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { store } from '@/routes/vendor';
import { SelectOption } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { CheckIcon } from '@phosphor-icons/react';

interface VendorOnboardingPageProps {
    vendorCategories: SelectOption[];
    initialValues: {
        business_name: string;
        category: string;
        category_other: string;
        based_in: string;
    };
}

export default function VendorOnboardingPage({
    vendorCategories,
    initialValues,
}: VendorOnboardingPageProps) {
    const form = useForm({
        business_name: initialValues.business_name,
        category: initialValues.category,
        category_other: initialValues.category_other,
        based_in: initialValues.based_in,
    });

    return (
        <AuthSplitLayout>
            <Head title="Onboarding" />

            <main className="mx-auto flex min-h-dvh w-full max-w-[350px] flex-col justify-center space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-xl font-medium">Welcome</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Add the basics for your vendor profile.
                    </p>
                </div>

                <form
                    className="flex flex-col gap-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post(store().url);
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor="business-name">Business name</Label>
                        <Input
                            id="business-name"
                            name="business_name"
                            type="text"
                            autoFocus
                            placeholder="Required"
                            value={form.data.business_name}
                            onChange={(event) =>
                                form.setData(
                                    'business_name',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={form.errors.business_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="vendor-category">
                            Business category
                        </Label>
                        <Select
                            name="category"
                            value={form.data.category}
                            onValueChange={(value) =>
                                form.setData('category', value)
                            }
                        >
                            <SelectTrigger
                                id="vendor-category"
                                className="w-full"
                            >
                                <SelectValue placeholder="Required" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                {vendorCategories.map((vendorCategory) => (
                                    <SelectItem
                                        key={vendorCategory.value}
                                        value={vendorCategory.value}
                                    >
                                        {vendorCategory.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.category} />
                    </div>

                    {form.data.category === 'other' ? (
                        <div className="grid gap-2">
                            <Label htmlFor="vendor-category-other">
                                What type of business is it?
                            </Label>
                            <Input
                                id="vendor-category-other"
                                name="category_other"
                                type="text"
                                placeholder="Event styling, rentals, planning..."
                                value={form.data.category_other}
                                onChange={(event) =>
                                    form.setData(
                                        'category_other',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.category_other} />
                        </div>
                    ) : null}

                    <div className="grid gap-2">
                        <Label htmlFor="based-in">Based in</Label>
                        <Input
                            id="based-in"
                            name="based_in"
                            type="text"
                            placeholder="Amsterdam, Noord-Holland"
                            value={form.data.based_in}
                            onChange={(event) =>
                                form.setData('based_in', event.target.value)
                            }
                        />
                        <InputError message={form.errors.based_in} />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={form.processing}
                    >
                        {form.processing ? <Spinner /> : <CheckIcon />}
                        Continue
                    </Button>
                </form>
            </main>
        </AuthSplitLayout>
    );
}
