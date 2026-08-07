"use client";

import { useMemo, useState, useTransition } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createProduct, deleteProduct, updateProduct } from "@/app/dashboard/products/actions";
import type { Tables } from "@/lib/supabase/types";

type Category = Pick<Tables<"categories">, "id" | "name" | "color" | "icon">;
type Supplier = Pick<Tables<"suppliers">, "id" | "name">;
type Product = Tables<"products"> & {
  categories: Pick<Tables<"categories">, "id" | "name" | "color"> | null;
  suppliers: Pick<Tables<"suppliers">, "id" | "name"> | null;
};

const LOW_STOCK_THRESHOLD = 5;

export function ProductsTable({
  products,
  categories,
  suppliers,
}: {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  const sorted = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  );

  const filtered = useMemo(() => {
    return sorted.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === "low-stock") return p.quantity <= LOW_STOCK_THRESHOLD;
      if (filter !== "all") return p.categories?.name === filter;
      return true;
    });
  }, [sorted, search, filter]);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setOpen(true);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (editing) {
          await updateProduct(editing.id, formData);
          toast.success("Product updated");
        } else {
          await createProduct(formData);
          toast.success("Product added");
        }
        setOpen(false);
        setEditing(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleDelete() {
    if (!deleting) return;
    startTransition(async () => {
      try {
        await deleteProduct(deleting.id);
        toast.success("Product deleted");
        if (selected?.id === deleting.id) setSelected(null);
        setDeleting(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  const uniqueCategoryNames = [...new Set(categories.map((c) => c.name))];
  const filterChips = [
    { key: "all", label: "All" },
    { key: "low-stock", label: "Low stock" },
    ...uniqueCategoryNames.map((name) => ({ key: name, label: name })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setEditing(null);
          }}
        >
          <DialogTrigger
            render={
              <Button onClick={openCreate}>
                <Plus />
                Add product
              </Button>
            }
          />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={editing?.name} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min={0}
                  defaultValue={editing?.quantity ?? 1}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" name="unit" defaultValue={editing?.unit ?? "pcs"} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={editing?.price ?? undefined}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="expiry_date">Expiry date</Label>
                <Input
                  id="expiry_date"
                  name="expiry_date"
                  type="date"
                  defaultValue={editing?.expiry_date}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="manufacture_date">Manufacture date</Label>
                <Input
                  id="manufacture_date"
                  name="manufacture_date"
                  type="date"
                  defaultValue={editing?.manufacture_date ?? undefined}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="batch_number">Batch number</Label>
                <Input id="batch_number" name="batch_number" defaultValue={editing?.batch_number ?? undefined} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input id="barcode" name="barcode" defaultValue={editing?.barcode ?? undefined} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="category_id">Category</Label>
                <Select name="category_id" defaultValue={editing?.category_id ?? undefined}>
                  <SelectTrigger id="category_id" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="supplier_id">Supplier</Label>
                <Select name="supplier_id" defaultValue={editing?.supplier_id ?? undefined}>
                  <SelectTrigger id="supplier_id" className="w-full">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <Label htmlFor="location">Storage location</Label>
                <Input id="location" name="location" defaultValue={editing?.location ?? undefined} />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={editing?.notes ?? undefined} />
              </div>
              <DialogFooter className="col-span-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : editing ? "Save changes" : "Add product"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr] lg:items-start">
        <Card>
          <CardContent className="flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filterChips.map((chip) => (
                <Badge
                  key={chip.key}
                  variant={filter === chip.key ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilter(chip.key)}
                >
                  {chip.label}
                </Badge>
              ))}
            </div>

            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No products match.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((product) => (
                    <TableRow
                      key={product.id}
                      className="cursor-pointer"
                      data-state={selected?.id === product.id ? "selected" : undefined}
                      onClick={() => setSelected(product)}
                    >
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        {product.categories ? (
                          <Badge variant="outline">{product.categories.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.quantity <= LOW_STOCK_THRESHOLD ? "destructive" : "secondary"}>
                          {product.quantity} {product.unit}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.price != null ? `₹${product.price}` : "—"}</TableCell>
                      <TableCell>{product.suppliers?.name ?? "—"}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(product)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(product)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {selected ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-medium tracking-wide text-primary uppercase">
                  Product detail
                </p>
                <p className="text-base font-medium">{selected.name}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Stock</p>
                    <p className="font-medium">
                      {selected.quantity} {selected.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-medium">{selected.price != null ? `₹${selected.price}` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expiry</p>
                    <p className="font-medium">{selected.expiry_date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Batch</p>
                    <p className="font-medium">{selected.batch_number ?? "—"}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Supplier: {selected.suppliers?.name ?? "—"}
                  {selected.location ? ` · Location: ${selected.location}` : ""}
                </p>
                {selected.notes && <p className="text-sm text-muted-foreground">{selected.notes}</p>}
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => openEdit(selected)}>
                    Edit
                  </Button>
                  <Button variant="outline" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Select a product to see its details.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleting} onOpenChange={(next) => !next && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
