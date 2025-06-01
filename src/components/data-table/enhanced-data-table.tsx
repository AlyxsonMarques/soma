"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDeleteItem } from "@/hooks/useDeleteItem";
import { Trash2 } from "lucide-react";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";

interface EnhancedDataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  filterColumn?: keyof TData;
  filterPlaceholder?: string;
  isLoading?: boolean;
  endpoint: string;
  onRefresh: () => void;
  idAccessor: keyof TData;
  deleteConfirmationTitle?: string;
  deleteConfirmationMessage?: string;
  bulkDeleteConfirmationTitle?: string;
  bulkDeleteConfirmationMessage?: string;
}

export function EnhancedDataTable<TData>({
  columns,
  data,
  filterColumn,
  filterPlaceholder = "Filtro...",
  isLoading = false,
  endpoint,
  onRefresh,
  idAccessor,
  deleteConfirmationTitle = "Confirmar exclusão",
  deleteConfirmationMessage = "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.",
  bulkDeleteConfirmationTitle = "Confirmar exclusão em massa",
  bulkDeleteConfirmationMessage = "Tem certeza que deseja excluir todos os itens selecionados? Esta ação não pode ser desfeita.",
}: EnhancedDataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = React.useState(false);
  
  const { deleteItem, isDeleting } = useDeleteItem(endpoint, onRefresh);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    // Passar a função onRefresh para o contexto da tabela para que as colunas possam acessá-la
    meta: {
      onRefresh,
    },
  });

  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    
    // Process deletions one by one
    for (const row of selectedRows) {
      const id = String(row.original[idAccessor]);
      await deleteItem(id);
    }
    
    // Clear selection after deletion
    setRowSelection({});
    setShowBulkDeleteDialog(false);
  };

  const hasSelectedRows = table.getFilteredSelectedRowModel().rows.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {filterColumn && (
            <Input
              placeholder={filterPlaceholder}
              value={(table.getColumn(filterColumn as string)?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn(filterColumn as string)?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
          )}
          
          {hasSelectedRows && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setShowBulkDeleteDialog(true)}
              className="ml-2"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir selecionados ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isLoading ? "Carregando..." : "Sem resultados."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showBulkDeleteDialog}
        onClose={() => setShowBulkDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        title={bulkDeleteConfirmationTitle}
        description={`${bulkDeleteConfirmationMessage} (${table.getFilteredSelectedRowModel().rows.length} itens selecionados)`}
        confirmText="Excluir todos"
        isLoading={Object.values(isDeleting).some(Boolean)}
      />
    </div>
  );
}
