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
      row.original.createdAt = new Date(row.original.createdAt);
      return <span>{row.original.createdAt.toLocaleDateString("pt-BR")}</span>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Atualizado em" />;
    },
    cell: ({ row }) => {
      row.original.updatedAt = new Date(row.original.updatedAt);
      return <span>{row.original.updatedAt.toLocaleDateString("pt-BR")}</span>;
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
