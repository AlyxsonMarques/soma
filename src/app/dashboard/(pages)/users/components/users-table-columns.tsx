"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { UserAPISchema } from "@/types/user";
import type { ColumnDef } from "@tanstack/react-table";
import { EllipsisVerticalIcon } from "lucide-react";
import { toast } from "sonner";

const handleDelete = async (id: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${id}`, {
    method: "DELETE",
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
      return row.original.type === "MECHANIC" ? "Mecânico" : "Orçamentista";
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
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "birthDate",
    header: "Data de nascimento",
    cell: ({ row }) => {
      return <span>{row.original.birthDate.toLocaleDateString("pt-BR")}</span>;
    },
  },
  {
    accessorKey: "assistant",
    header: "Assistente",
    cell: ({ row }) => {
      return row.original.assistant ? "Sim" : "Não";
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
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.original.id)}>Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
