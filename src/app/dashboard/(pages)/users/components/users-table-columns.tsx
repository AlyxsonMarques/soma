"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { createTableColumns } from "@/components/data-table/create-table-columns";
import type { UserAPISchema } from "@/types/api-schemas";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

interface CreateUserColumnsOptions {
  onRefresh: () => void;
}

export function createUserColumns({ onRefresh }: CreateUserColumnsOptions) {
  const router = useRouter();

  const handleEditClick = (user: UserAPISchema) => {
    // Navigate to the user details page
    console.log(`Navigating to user details: ${user.id}`);
    // No Next.js, grupos de rotas com parênteses não afetam a URL
    router.push(`/dashboard/users/${user.id}`);
  };

  // Define the columns specific to users
  const userColumns: ColumnDef<UserAPISchema>[] = [

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
    accessorKey: "name",
    header: "Nome",
    meta: {
      label: "Nome"
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
    accessorKey: "birthDate",
    header: "Data de nascimento",
    cell: ({ row }) => {
      return <span>{row.original.birthDate.toLocaleDateString("pt-BR")}</span>;
    },
    meta: {
      label: "Data de nascimento"
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
    endpoint: "users",
    onRefresh,
    deleteConfirmationTitle: "Excluir usuário",
    deleteConfirmationMessage: "Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.",
    additionalColumns: userColumns,
    onEdit: handleEditClick
  });
  
  return columns;
}
