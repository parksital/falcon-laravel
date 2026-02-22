import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { useForm } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

type Product = {
    id: number;
    name: string;
    description?: string | null;
    created_at: string;
};

type ProductsPageProps = {
    products: Product[];
};

export default function ProductsPage({ products }: ProductsPageProps) {
    const [productName, setProductName] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const editForm = useForm({
        name: editingProduct?.name ?? '',
        description: editingProduct?.description ?? '',
    });

    const deleteForm = useForm({});

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        editForm.setData({
            name: product.name,
            description: product.description ?? '',
        });
    };

    const sortedProducts = useMemo(
        () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
        [products]
    );

    return (
        <AppSidebarLayout>
            <div className="border-b border-sidebar-border/80 bg-background">
                <Dialog>
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-2 px-4 py-3">
                        <DialogTrigger asChild>
                            <Button type="button">New product</Button>
                        </DialogTrigger>
                    </div>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create a new product</DialogTitle>
                            <DialogDescription>
                                Enter a name to start your new product.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-foreground" htmlFor="product-name">
                                Product name
                            </label>
                            <Input
                                id="product-name"
                                placeholder="e.g. Falcon Air"
                                value={productName}
                                onChange={(event) => setProductName(event.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" disabled={!productName.trim()}>
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <main className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 rounded-xl p-6">
                {products.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                        No products yet. Create your first product to get started.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Service</th>
                                    <th className="px-4 py-3 font-medium">Description</th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="group border-t border-border"
                                    >
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {product.name}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {product.description ?? '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="opacity-0 transition-opacity group-hover:opacity-100"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <Dialog
                                                            open={editingProduct?.id === product.id}
                                                            onOpenChange={(open) =>
                                                                setEditingProduct(open ? product : null)
                                                            }
                                                        >
                                                            <DialogTrigger asChild>
                                                                <DropdownMenuItem
                                                                    onSelect={(event) => {
                                                                        event.preventDefault();
                                                                        openEdit(product);
                                                                    }}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-md">
                                                                <DialogHeader>
                                                                    <DialogTitle>
                                                                        Edit product
                                                                    </DialogTitle>
                                                                    <DialogDescription>
                                                                        Update the product details.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <form
                                                                    className="grid gap-4"
                                                                    onSubmit={(event) => {
                                                                        event.preventDefault();
                                                                        if (!editingProduct) return;
                                                                        editForm.patch(
                                                                            `/products/${editingProduct.id}`,
                                                                            {
                                                                                onSuccess: () =>
                                                                                    setEditingProduct(null),
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    <div className="grid gap-2">
                                                                        <label
                                                                            className="text-sm font-medium text-foreground"
                                                                            htmlFor="edit-title"
                                                                        >
                                                                            Title
                                                                        </label>
                                                                        <Input
                                                                            id="edit-title"
                                                                            value={editForm.data.name}
                                                                            onChange={(event) =>
                                                                                editForm.setData(
                                                                                    'name',
                                                                                    event.target.value
                                                                                )
                                                                            }
                                                                        />
                                                                        {editForm.errors.name ? (
                                                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                                                {editForm.errors.name}
                                                                            </p>
                                                                        ) : null}
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        <label
                                                                            className="text-sm font-medium text-foreground"
                                                                            htmlFor="edit-description"
                                                                        >
                                                                            Description
                                                                        </label>
                                                                        <textarea
                                                                            id="edit-description"
                                                                            rows={4}
                                                                            className={cn(
                                                                                "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none",
                                                                                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                                                                                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                                                                            )}
                                                                            value={editForm.data.description}
                                                                            onChange={(event) =>
                                                                                editForm.setData(
                                                                                    'description',
                                                                                    event.target.value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <DialogFooter className="gap-2">
                                                                        <DialogClose asChild>
                                                                            <Button
                                                                                type="button"
                                                                                variant="secondary"
                                                                            >
                                                                                Cancel
                                                                            </Button>
                                                                        </DialogClose>
                                                                        <Button
                                                                            type="submit"
                                                                            disabled={editForm.processing}
                                                                        >
                                                                            Save
                                                                        </Button>
                                                                    </DialogFooter>
                                                                </form>
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <DropdownMenuItem
                                                                    variant="destructive"
                                                                    onSelect={(event) => {
                                                                        event.preventDefault();
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-sm">
                                                                <DialogHeader>
                                                                    <DialogTitle>
                                                                        Delete product?
                                                                    </DialogTitle>
                                                                    <DialogDescription>
                                                                        This action cannot be undone.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <DialogFooter className="gap-2">
                                                                    <DialogClose asChild>
                                                                        <Button
                                                                            type="button"
                                                                            variant="secondary"
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                    </DialogClose>
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        onClick={() =>
                                                                            deleteForm.delete(
                                                                                `/products/${product.id}`
                                                                            )
                                                                        }
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </AppSidebarLayout>
    );
}
