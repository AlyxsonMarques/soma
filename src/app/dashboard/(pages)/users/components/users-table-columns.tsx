"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { createTableColumns } from "@/components/data-table/create-table-columns";
import { EditDialog } from "@/components/ui/edit-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditItem } from "@/hooks/useEditItem";
import type { UserAPISchema } from "@/types/api-schemas";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

// Interface para o formulário de edição de usuários
interface UserEditFormData {
  name?: string;
  email?: string;
  cpf?: string;
  type?: string;
  birthDate?: string;
  assistant?: boolean;
  password?: string;
}

interface CreateUserColumnsOptions {
  onRefresh: () => void;
}

export function createUserColumns({ onRefresh }: CreateUserColumnsOptions) {
  const [editingUser, setEditingUser] = useState<UserAPISchema | null>(null);
  const [formData, setFormData] = useState<UserEditFormData>({});
  const { editItem, isEditing } = useEditItem<UserAPISchema>("users", onRefresh);

  const handleEditClick = (user: UserAPISchema) => {
    setEditingUser(user);
    
    // Converter a data para formato string de data HTML (YYYY-MM-DD)
    const birthDateStr = user.birthDate instanceof Date 
      ? user.birthDate.toISOString().split('T')[0] 
      : new Date(user.birthDate).toISOString().split('T')[0];
    
    setFormData({
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      type: user.type,
      birthDate: birthDateStr,
      assistant: user.assistant,
      password: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  const handleSave = async () => {
    if (!editingUser) return;
    
    // Criar uma cópia do formData para enviar para a API
    const dataToSend: Record<string, any> = { ...formData };
    
    // Remover a senha se estiver vazia
    if (dataToSend.password === '') {
      delete dataToSend.password;
    }
    
    await editItem(editingUser.id, dataToSend);
    setEditingUser(null);
  };

  const renderEditDialog = (user: UserAPISchema) => (
    <EditDialog
      isOpen={editingUser?.id === user.id}
      onClose={() => setEditingUser(null)}
      onConfirm={handleSave}
      title="Editar Usuário"
      isLoading={isEditing[user.id] || false}
    >
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right">
            Tipo de Usuário
          </Label>
          <select
            id="type"
            name="type"
            value={formData.type || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            <option value="MECHANIC">Mecânico</option>
            <option value="BUDGET_ANALYST">Orçamentista</option>
          </select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="cpf" className="text-right">
            CPF
          </Label>
          <Input
            id="cpf"
            name="cpf"
            value={formData.cpf || ""}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nome
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email || ""}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="birthDate" className="text-right">
            Data de Nascimento
          </Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            value={formData.birthDate || ""}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="assistant" className="text-right">
            Assistente
          </Label>
          <div className="col-span-3 flex items-center">
            <Input
              id="assistant"
              name="assistant"
              type="checkbox"
              checked={formData.assistant || false}
              onChange={handleInputChange}
              className="h-4 w-4"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="password" className="text-right">
            Nova Senha
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password || ""}
            onChange={handleInputChange}
            className="col-span-3"
            placeholder="Deixe em branco para manter a senha atual"
          />
        </div>
      </div>
    </EditDialog>
  );

  // Define the columns specific to users
  const userColumns: ColumnDef<UserAPISchema>[] = [


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

  ];

  // Use the createTableColumns factory to add select and actions columns
  const columns = createTableColumns({
    idAccessor: "id",
    endpoint: "users",
    onRefresh,
    deleteConfirmationTitle: "Excluir usuário",
    deleteConfirmationMessage: "Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.",
    additionalColumns: userColumns,
    onEdit: handleEditClick,
    editDialogContent: renderEditDialog,
  });

  // Adicionar o diálogo de edição como uma propriedade ao array de colunas
  // @ts-ignore - Adicionando uma propriedade personalizada ao array
  columns.EditDialog = editingUser ? renderEditDialog(editingUser) : null;
  
  return columns;
}
