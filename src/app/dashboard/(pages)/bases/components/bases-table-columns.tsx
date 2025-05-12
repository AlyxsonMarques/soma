"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { createTableColumns } from "@/components/data-table/create-table-columns";
import { EditDialog } from "@/components/ui/edit-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditItem } from "@/hooks/useEditItem";
import type { BaseAPISchema } from "@/types/api-schemas";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

interface CreateBaseColumnsOptions {
  onRefresh: () => void;
}

export function createBaseColumns({ onRefresh }: CreateBaseColumnsOptions) {
  const [editingBase, setEditingBase] = useState<BaseAPISchema | null>(null);
  const [formData, setFormData] = useState<Partial<BaseAPISchema>>({});
  const { editItem, isEditing } = useEditItem<BaseAPISchema>("bases", onRefresh);

  const handleEditClick = (base: BaseAPISchema) => {
    setEditingBase(base);
    setFormData({
      name: base.name,
      phone: base.phone
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editingBase) return;
    await editItem(editingBase.id, formData);
    setEditingBase(null);
  };

  const renderEditDialog = (base: BaseAPISchema) => (
    <EditDialog
      isOpen={editingBase?.id === base.id}
      onClose={() => setEditingBase(null)}
      onConfirm={handleSave}
      title="Editar Base"
      isLoading={isEditing[base.id] || false}
    >
      <div className="grid gap-4 py-4">
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
          <Label htmlFor="phone" className="text-right">
            Telefone
          </Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone || ""}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>
      </div>
    </EditDialog>
  );

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
    onEdit: handleEditClick,
    editDialogContent: renderEditDialog,
  });

  // Adicionar o diálogo de edição como uma propriedade ao array de colunas
  // @ts-ignore - Adicionando uma propriedade personalizada ao array
  columns.EditDialog = editingBase ? renderEditDialog(editingBase) : null;
  
  return columns;
}
