"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { UserAPISchema } from "@/types/user";
import type { ColumnDef } from "@tanstack/react-table";
import { EllipsisVerticalIcon } from "lucide-react";

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
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "pending"
              ? "secondary"
              : status === "revision"
                ? "outline"
                : status === "approved"
                  ? "default"
                  : status === "partial_approved"
                    ? "default"
                    : status === "nf_approved"
                      ? "default"
                      : "destructive"
          }
        >
          {status === "pending"
            ? "Pendente"
            : status === "revision"
              ? "Revisão"
              : status === "approved"
                ? "Aprovado"
                : status === "partial_approved"
                  ? "Aprovado parcialmente"
                  : status === "nf_approved"
                    ? "Aprovado NF"
                    : "Reprovado"}
        </Badge>
      );
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
  },
  {
    accessorKey: "type",
    header: "Tipo de usuário",
    cell: ({ row }) => {
      return row.original.type === "mechanic" ? "Mecânico" : "Orçamentista";
    },
  },
  {
    accessorKey: "cpf",
    header: "CPF",
    cell: ({ row }) => {
      return row.original.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "base",
    header: "Base",
  },
  {
    accessorKey: "assistant",
    header: "Assistente",
    cell: ({ row }) => {
      return row.original.assistant ? "Sim" : "Não";
    },
  },
  {
    accessorKey: "actions",
    header: "Ações",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Aprovar</DropdownMenuItem>
            <DropdownMenuItem>Rejeitar</DropdownMenuItem>
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem>Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
