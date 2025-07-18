"use client";

// React, Next.js imports
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// UI components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Hooks and utilities
import { useModal } from "@/providers/modal-provider";
import { useToast } from "@/hooks/use-toast";

// Lucide icons
import {
  CopyPlus,
  FilePenLine,
  MoreHorizontal,
  Store,
  Trash,
} from "lucide-react";

// Queries
import { deleteProduct } from "@/queries/product";

// Tanstack React Table
import { ColumnDef } from "@tanstack/react-table";

// Types
import { StoreProductType } from "@/lib/types";
import Link from "next/link";

export const columns: ColumnDef<StoreProductType>[] = [
  {
    accessorKey: "image",
    header: "",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <div className="flex flex-col gap-y-4">
          {/* Product name */}
          <h1 className="font-semibold text-lg truncate pb-2 border-b capitalize">
            {product.name}
          </h1>

          {/* Variants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.variants.map((variant) => (
              <div
                key={variant.id}
                className="relative group border rounded-lg shadow-sm overflow-hidden p-2"
              >
                {/* Image + hover edit link */}
                <div className="relative">
                  <Image
                    src={variant.variantImage || variant.images[0]?.url}
                    alt={`${variant.variantName} image`}
                    width={1000}
                    height={1000}
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <Link
                    href={`/dashboard/seller/stores/${product.store.url}/products/${product.id}/variants/${variant.id}`}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <FilePenLine className="text-white w-6 h-6" />
                  </Link>
                </div>

                {/* Variant Info */}
                <div className="mt-3 space-y-2">
                  {/* Variant Name */}
                  <h2 className="text-sm font-medium capitalize truncate">
                    {variant.variantName}
                  </h2>

                  {/* Colors */}
                  <div className="flex gap-1 items-center">
                    {variant.colors.map((color) => (
                      <span
                        key={color.name}
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: color.name }}
                      />
                    ))}
                  </div>

                  {/* Sizes */}
                  <div className="flex flex-wrap gap-1">
                    {variant.sizes.map((size) => (
                      <span
                        key={size.size}
                        className="text-xs px-2 py-0.5 border rounded-md bg-muted text-muted-foreground"
                      >
                        {size.size} ({size.quantity}) - ${size.price}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return <span>{row.original.category.name}</span>;
    },
  },
  {
    accessorKey: "subCategory",
    header: "SubCategory",
    cell: ({ row }) => {
      return <span>{row.original.subCategory.name}</span>;
    },
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => {
      return <span>{row.original.brand}</span>;
    },
  },

  {
    accessorKey: "new-variant",
    header: "",
    cell: ({ row }) => {
      return (
        <Link
          href={`/dashboard/seller/stores/${row.original.store.url}/products/${row.original.id}/variants/new`}
        >
          <CopyPlus className="hover:text-blue-200" />
        </Link>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rowData = row.original;

      return <CellActions productId={rowData.id} />;
    },
  },
];

// Define props interface for CellActions component
interface CellActionsProps {
  productId: string;
}

// CellActions component definition
const CellActions: React.FC<CellActionsProps> = ({ productId }) => {
  // Hooks
  const { setClose } = useModal();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Return null if rowData or rowData.id don't exist
  if (!productId) return null;

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2" onClick={() => {}}>
              <Trash size={15} /> Delete product
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            This action cannot be undone. This will permanently delete the
            product and variants that exist inside product.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive mb-2 text-white"
            onClick={async () => {
              setLoading(true);
              await deleteProduct(productId);
              toast({
                title: "Deleted product",
                description: "The product has been deleted.",
              });
              setLoading(false);
              router.refresh();
              setClose();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
