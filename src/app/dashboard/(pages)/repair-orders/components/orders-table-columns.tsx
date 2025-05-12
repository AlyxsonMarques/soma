"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { createTableColumns } from "@/components/data-table/create-table-columns";
import { Badge } from "@/components/ui/badge";
import type { BaseAPISchema, RepairOrderAPISchema, UserAPISchema } from "@/types/api-schemas";
import { RepairOrderStatus } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CreateRepairOrderColumnsOptions {
  onRefresh: () => void;
}



export function createRepairOrderColumns({ onRefresh }: CreateRepairOrderColumnsOptions) {
  const router = useRouter();
  const [bases, setBases] = useState<BaseAPISchema[]>([]);
  const [users, setUsers] = useState<UserAPISchema[]>([]);

  // Buscar as bases e usuários disponíveis para os selects
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar bases
        const basesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bases`);
        const basesData = await basesResponse.json();
        setBases(basesData);

        // Buscar usuários
        const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`);
        const usersData = await usersResponse.json();
        setUsers(usersData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = (order: RepairOrderAPISchema) => {
    // Navigate to the repair order details page
    router.push(`/dashboard/repair-orders/${order.id}`);
  };

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
  const columns = createTableColumns({
    idAccessor: "id",
    endpoint: "repair-orders",
    onRefresh,
    deleteConfirmationTitle: "Excluir ordem de reparo",
    deleteConfirmationMessage: "Tem certeza que deseja excluir esta ordem de reparo? Esta ação não pode ser desfeita.",
    additionalColumns: repairOrderColumns,
    onEdit: handleEditClick
  });
  
  return columns;
}
