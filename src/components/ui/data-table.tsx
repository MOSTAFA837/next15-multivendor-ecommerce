"use client";

// Custom components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CustomModal from "../dashboard/shared/custom-modal";

// Table components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Tanstack react table
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";

// Lucide icons
import { FilePlus2, Menu, Search } from "lucide-react";

// Modal provider hook
import { useModal } from "@/providers/modal-provider";
import Link from "next/link";
import { MobileSidebar } from "../dashboard/sidebar/mobile-sidebar";
import { adminDashboardSidebarOptions } from "@/constants/data";
import { useState } from "react";

// Props interface for the table component
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterValue: string;
  actionButtonText?: React.ReactNode;
  modalChildren?: React.ReactNode;
  newTabLink?: string;
  searchPlaceholder: string;
  heading?: string;
  subheading?: string;
  noHeader?: true;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  filterValue,
  modalChildren,
  actionButtonText,
  searchPlaceholder,
  heading,
  subheading,
  noHeader,
  newTabLink,
}: DataTableProps<TData, TValue>) {
  // Modal state
  const { setOpen } = useModal();

  // React table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="lg:ml-[300px]">
      {/* Search input and action button */}
      <div className="flex gap-4 items-center justify-between border-b border-black mb-4 px-10">
        <MobileSidebar />

        <div className="flex items-center py-4 gap-2 relative flex-1">
          <Search className="absolute left-3" />
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(filterValue)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(filterValue)?.setFilterValue(event.target.value)
            }
            className="h-12 pl-12 border border-black focus-within:translate-x-[-1] focus-within:translate-y-[-1] focus-within:shadow-[4px_4px_0_#000] focus-within:transition-all duration-200"
          />
        </div>
        <div className="flex gap-x-2">
          {modalChildren && (
            <Button
              className="flex- gap-2 h-12 hidden lg:flex"
              onClick={() => {
                if (modalChildren)
                  setOpen(
                    <CustomModal
                      heading={heading || ""}
                      subheading={subheading || ""}
                    >
                      {modalChildren}
                    </CustomModal>
                  );
              }}
            >
              {actionButtonText}
            </Button>
          )}
          {newTabLink && (
            <Link href={newTabLink}>
              <Button variant="outline" className="h-12">
                <FilePlus2 className="me-1" /> Create in new page
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Table */}

      <div className="p-10">
        <div className="border bg-background rounded-lg">
          <Table className="">
            {/* Table header */}
            {!noHeader && (
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="px-6">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
            )}

            {/* Table body */}
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => {
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="px-4"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="max-w-[400px] break-words px-4"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                // No results message
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No Results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
