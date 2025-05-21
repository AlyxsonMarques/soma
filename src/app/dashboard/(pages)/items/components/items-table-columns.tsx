"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { createTableColumns } from "@/components/data-table/create-table-columns";
import type { BaseAPISchema, RepairOrderServiceItemAPISchema } from "@/types/api-schemas";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CreateItemColumnsOptions {
  onRefresh: () => void;
}



export function createItemColumns({ onRefresh }: CreateItemColumnsOptions) {
  const router = useRouter();
  const [bases, setBases] = useState<BaseAPISchema[]>([]);

  // Buscar as bases disponíveis para o select
  useEffect(() => {
    const fetchBases = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bases`);
        const data = await response.json();
        setBases(data);
      } catch (error) {
        console.error("Erro ao buscar bases:", error);
      }
    };

    fetchBases();
  }, []);

  const handleEditClick = (item: RepairOrderServiceItemAPISchema) => {
    // Navigate to the item details page
    console.log(`Navigating to item details: ${item.id}`);
    // No Next.js, grupos de rotas com parênteses não afetam a URL
    router.push(`/dashboard/items/${item.id}`);
  };



  // Define the columns specific to items
  const itemColumns: ColumnDef<RepairOrderServiceItemAPISchema>[] = [

  {
    accessorKey: "id",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="ID" />;
    },
    meta: {
      label: "ID"
    },
  },
  {
    accessorKey: "name",
    header: "Nome",
    meta: {
      label: "Nome"
    },
  },
  {
    accessorKey: "value",
    header: "Valor",
    meta: {
      label: "Valor"
    },
  },
  {
    accessorKey: "base",
    header: "Base",
    cell: ({ row }) => {
      return <span>{row.original.base.name}</span>;
    },
    meta: {
      label: "Base"
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
    meta: {
      label: "Criado em"
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
    meta: {
      label: "Atualizado em"
    },
  },

  ];

  // Use the createTableColumns factory to add select and actions columns
  const columns = createTableColumns({
    idAccessor: "id",
    endpoint: "repair-order-service-items",
    onRefresh,
    deleteConfirmationTitle: "Excluir item",
    deleteConfirmationMessage: "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.",
    additionalColumns: itemColumns,
    onEdit: handleEditClick
  });
  
  return columns;
}
