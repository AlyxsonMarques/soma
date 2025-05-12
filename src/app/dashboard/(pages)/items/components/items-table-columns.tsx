"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { createTableColumns } from "@/components/data-table/create-table-columns";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { RepairOrderServiceItemAPISchema } from "@/types/api-schemas";
import type { ColumnDef } from "@tanstack/react-table";

interface CreateItemColumnsOptions {
  onRefresh: () => void;
}

export function createItemColumns({ onRefresh }: CreateItemColumnsOptions) {
  // Define the columns specific to items
  const itemColumns: ColumnDef<RepairOrderServiceItemAPISchema>[] = [

  {
    accessorKey: "id",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="ID" />;
    },
  },
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "value",
    header: "Valor",
  },
  {
    accessorKey: "base",
    header: "Base",
    cell: ({ row }) => {
      return <span>{row.original.base.name}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Criado em" />;
    },
    cell: ({ row }) => {
      return <span>{row.original.createdAt.toLocaleDateString("pt-BR")}</span>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Atualizado em" />;
    },
    cell: ({ row }) => {
      return <span>{row.original.updatedAt.toLocaleDateString("pt-BR")}</span>;
    },
  },

  ];

  // Use the createTableColumns factory to add select and actions columns
  return createTableColumns({
    idAccessor: "id",
    endpoint: "repair-order-service-items",
    onRefresh,
    deleteConfirmationTitle: "Excluir item",
    deleteConfirmationMessage: "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.",
    additionalColumns: itemColumns,
    additionalActions: (row) => (
      <>
        <DropdownMenuItem>Editar</DropdownMenuItem>
      </>
    ),
  });
}
