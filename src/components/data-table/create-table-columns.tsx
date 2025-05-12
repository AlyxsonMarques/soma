"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDeleteItem } from "@/hooks/useDeleteItem";
import type { ColumnDef } from "@tanstack/react-table";
import { EllipsisVerticalIcon } from "lucide-react";
import { ReactNode, useState } from "react";

interface CreateTableColumnsOptions<TData> {
  idAccessor: keyof TData;
  endpoint: string;
  onRefresh: () => void;
  deleteConfirmationTitle?: string;
  deleteConfirmationMessage?: string;
  additionalColumns: ColumnDef<TData>[];
  additionalActions?: (row: TData) => React.ReactNode;
  onEdit?: (row: TData) => void;
  editDialogContent?: (row: TData) => ReactNode;
}

export function createTableColumns<TData>({
  idAccessor,
  endpoint,
  onRefresh,
  deleteConfirmationTitle = "Confirmar exclusão",
  deleteConfirmationMessage = "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.",
  additionalColumns,
  additionalActions,
  onEdit,
  editDialogContent,
}: CreateTableColumnsOptions<TData>): ColumnDef<TData>[] {
  // Create the select column for bulk operations
  const selectColumn: ColumnDef<TData> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  // Create the actions column with delete functionality
  const ActionsColumn: ColumnDef<TData> = {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const { deleteItem, isDeleting } = useDeleteItem(endpoint, onRefresh);
      const [showDeleteDialog, setShowDeleteDialog] = useState(false);
      const id = String(row.original[idAccessor]);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {onEdit && editDialogContent && (
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault();
                    onEdit(row.original);
                  }}
                >
                  Editar
                </DropdownMenuItem>
              )}
              {additionalActions && additionalActions(row.original)}
              <DropdownMenuItem 
                onSelect={(e) => {
                  // Prevent the default selection behavior which might cause issues
                  e.preventDefault();
                  setShowDeleteDialog(true);
                }}
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ConfirmationDialog
            isOpen={showDeleteDialog}
            onClose={() => setShowDeleteDialog(false)}
            onConfirm={async () => {
              try {
                await deleteItem(id);
              } finally {
                // Ensure dialog is closed regardless of success or failure
                setShowDeleteDialog(false);
              }
            }}
            title={deleteConfirmationTitle}
            description={deleteConfirmationMessage}
            confirmText="Excluir"
            isLoading={isDeleting[id]}
          />
        </>
      );
    },
  };

  // Combine all columns
  return [selectColumn, ...additionalColumns, ActionsColumn];
}
