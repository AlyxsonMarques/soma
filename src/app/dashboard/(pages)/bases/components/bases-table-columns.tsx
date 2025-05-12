"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { createTableColumns } from "@/components/data-table/create-table-columns";
import type { BaseAPISchema } from "@/types/api-schemas";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

interface CreateBaseColumnsOptions {
  onRefresh: () => void;
}

export function createBaseColumns({ onRefresh }: CreateBaseColumnsOptions) {
  const router = useRouter();

  const handleEditClick = (base: BaseAPISchema) => {
    // Navigate to the base details page
    console.log(`Navigating to base details: ${base.id}`);
    // No Next.js, grupos de rotas com parênteses não afetam a URL
    router.push(`/dashboard/bases/${base.id}`);
  };



  // Define the columns specific to bases
  const baseColumns: ColumnDef<BaseAPISchema>[] = [

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
    accessorKey: "phone",
    header: "Telefone",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Criado em" />;
    },
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return <span>{date.toLocaleDateString("pt-BR")}</span>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = new Date(rowA.original.createdAt).getTime();
      const dateB = new Date(rowB.original.createdAt).getTime();
      return dateA > dateB ? 1 : dateA < dateB ? -1 : 0;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Atualizado em" />;
    },
    cell: ({ row }) => {
      const date = new Date(row.original.updatedAt);
      return <span>{date.toLocaleDateString("pt-BR")}</span>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = new Date(rowA.original.updatedAt).getTime();
      const dateB = new Date(rowB.original.updatedAt).getTime();
      return dateA > dateB ? 1 : dateA < dateB ? -1 : 0;
    },
  },

  ];

  // Use the createTableColumns factory to add select and actions columns
  const columns = createTableColumns({
    idAccessor: "id",
    endpoint: "bases",
    onRefresh,
    deleteConfirmationTitle: "Excluir base",
    deleteConfirmationMessage: "Tem certeza que deseja excluir esta base? Esta ação não pode ser desfeita.",
    additionalColumns: baseColumns,
    onEdit: handleEditClick
  });
  
  return columns;
}
