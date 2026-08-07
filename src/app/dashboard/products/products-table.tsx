"use client";

import { useMemo, useState, useTransition } from "react";
import { MoreHorizontal, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { computeAiInsight } from "@/lib/mock-data";
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
  const [viewing, setViewing] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();

  const sorted = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  );

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
        setDeleting(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No products yet. Add your first product to get started.
                </TableCell>
              </TableRow>
            )}
            {sorted.map((product) => (
              <TableRow
                key={product.id}
                className="cursor-pointer"
                onClick={() => setViewing(product)}
              >
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  {product.categories ? (
                    <Badge variant="outline">{product.categories.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>{product.suppliers?.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={product.quantity <= LOW_STOCK_THRESHOLD ? "destructive" : "secondary"}>
                    {product.quantity} {product.unit}
                  </Badge>
                </TableCell>
                <TableCell>{product.expiry_date}</TableCell>
                <TableCell>{product.price != null ? `₹${product.price}` : "—"}</TableCell>
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
                      <DropdownMenuItem onClick={() => setViewing(product)}>
                        View AI insight
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(product)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleting(product)}
                      >
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

      <Sheet open={!!viewing} onOpenChange={(next) => !next && setViewing(null)}>
        <SheetContent>
          {viewing && (
            <ProductDetail
              product={viewing}
              onEdit={() => {
                setViewing(null);
                openEdit(viewing);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ProductDetail({ product, onEdit }: { product: Product; onEdit: () => void }) {
  const { score, note } = computeAiInsight(product);
  return (
    <>
      <SheetHeader>
        <SheetTitle>{product.name}</SheetTitle>
      </SheetHeader>
      <div className="flex flex-col gap-4 px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-3">
            <div className="text-[11px] text-muted-foreground">Stock</div>
            <div className="text-lg font-semibold">
              {product.quantity} {product.unit}
            </div>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="text-[11px] text-muted-foreground">AI Score</div>
            <div className="text-lg font-semibold text-primary">{score}/100</div>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="text-[11px] text-muted-foreground">Selling Price</div>
            <div className="text-lg font-semibold">
              {product.price != null ? `₹${product.price}` : "—"}
            </div>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="text-[11px] text-muted-foreground">Expiry</div>
            <div className="text-lg font-semibold">{product.expiry_date}</div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-3">
          <div className="text-[10px] font-medium tracking-wider text-primary uppercase">
            Supplier
          </div>
          <div className="text-sm font-medium">{product.suppliers?.name ?? "Unassigned"}</div>
          {product.location && (
            <div className="text-xs text-muted-foreground">Location: {product.location}</div>
          )}
        </div>

        <div className="rounded-lg border border-primary/40 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-primary uppercase">
            <Sparkles className="size-3" />
            AI Recommendation
          </div>
          <p className="text-sm text-muted-foreground">{note}</p>
        </div>

        <Button onClick={onEdit}>Quick Edit</Button>
      </div>
    </>
  );
}
