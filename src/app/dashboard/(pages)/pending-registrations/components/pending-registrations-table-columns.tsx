"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { UserAPISchema } from "@/types/user";
import type { UserStatus } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { EllipsisVerticalIcon } from "lucide-react";
import { toast } from "sonner";

const handleStatusChange = async (id: string, status: "APPROVED" | "REPROVED") => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
    }),
  });
  const data = await response.json();

  if (data.error) {
    toast.error(data.message);
  } else {
    toast.success(data.message);
  }
};

export const columns: ColumnDef<UserAPISchema>[] = [
  {
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
    meta: {
      label: "Selecionar"
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    meta: {
      label: "Status"
    },
    cell: ({ row }) => {
      const statusVariants: Record<UserStatus, "default" | "destructive" | "outline" | "secondary" | "success" | "warning"> = {
        PENDING: "secondary",
        APPROVED: "default",
        REPROVED: "destructive",
      };

      const statusLabels = {
        PENDING: "Pendente",
        APPROVED: "Aprovado",
        REPROVED: "Reprovado",
      };

      const status: UserStatus = row.getValue("status");

      return <Badge variant={statusVariants[status] ?? "destructive"}>{statusLabels[status] ?? "Reprovado"}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
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
    accessorKey: "type",
    header: "Tipo de usuário",
    cell: ({ row }) => {
      return row.original.type === "MECHANIC" ? "Mecânico" : "Orçamentista";
    },
    meta: {
      label: "Tipo de usuário"
    },
  },
  {
    accessorKey: "cpf",
    header: "CPF",
    cell: ({ row }) => {
      return row.original.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    },
    meta: {
      label: "CPF"
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: {
      label: "Email"
    },
  },
  {
    accessorKey: "assistant",
    header: "Assistente",
    cell: ({ row }) => {
      return row.original.assistant ? "Sim" : "Não";
    },
    meta: {
      label: "Assistente"
    },
  },
  {
    accessorKey: "actions",
    header: "Ações",
    meta: {
      label: "Ações"
    },
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "APPROVED")}>Aprovar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "REPROVED")}>
              Rejeitar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
