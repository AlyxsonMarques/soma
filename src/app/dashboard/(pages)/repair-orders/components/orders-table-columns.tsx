"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { createTableColumns } from "@/components/data-table/create-table-columns";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { RepairOrderAPISchema } from "@/types/api-schemas";
import { RepairOrderStatus } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";

interface CreateRepairOrderColumnsOptions {
  onRefresh: () => void;
}

export function createRepairOrderColumns({ onRefresh }: CreateRepairOrderColumnsOptions) {
  // Define the columns specific to repair orders
  const repairOrderColumns: ColumnDef<RepairOrderAPISchema>[] = [

  {
    accessorKey: "id",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="ID" />;
    },
  },
  {
    accessorKey: "gcaf",
    header: "GCAF",
  },
  {
    accessorKey: "base",
    header: "Base",
    cell: ({ row }) => {
      return <span>{row.original.base?.name}</span>;
    },
  },
  {
    accessorKey: "users",
    header: "Usuários",
    cell: ({ row }) => {
      return <span>{row.original.users?.map((user: { name: string }) => user.name).join(", ")}</span>;
    },
  },
  {
    accessorKey: "plate",
    header: "Placa",
  },
  {
    accessorKey: "kilometers",
    header: "Kilometragem",
  },
  {
    accessorKey: "discount",
    header: "Desconto",
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {

      const statusVariants: Record<RepairOrderStatus, "outline" | "default" | "secondary" | "destructive"> = {
        PENDING: "outline",
        REVISION: "outline",
        APPROVED: "default",
        PARTIALLY_APPROVED: "secondary",
        INVOICE_APPROVED: "secondary",
        CANCELLED: "destructive"
      };

      const statusLabels = {
        PENDING: "Pendente",
        REVISION: "Revisão",
        APPROVED: "Aprovado",
        PARTIALLY_APPROVED: "Parcialmente Aprovado",
        INVOICE_APPROVED: "Aprovado para Nota Fiscal",
        CANCELLED: "Cancelado"
      };

      const status = row.getValue("status") as RepairOrderStatus;

      return (
        <Badge variant={statusVariants[status]}>
          {statusLabels[status]}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
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
  return createTableColumns({
    idAccessor: "id",
    endpoint: "repair-orders",
    onRefresh,
    deleteConfirmationTitle: "Excluir ordem de reparo",
    deleteConfirmationMessage: "Tem certeza que deseja excluir esta ordem de reparo? Esta ação não pode ser desfeita.",
    additionalColumns: repairOrderColumns,
    additionalActions: (row) => (
      <>
        <DropdownMenuItem>Editar</DropdownMenuItem>
      </>
    ),
  });
}
