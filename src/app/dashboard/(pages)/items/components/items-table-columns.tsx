"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { createTableColumns } from "@/components/data-table/create-table-columns";
import { EditDialog } from "@/components/ui/edit-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditItem } from "@/hooks/useEditItem";
import type { BaseAPISchema, RepairOrderServiceItemAPISchema } from "@/types/api-schemas";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";

interface CreateItemColumnsOptions {
  onRefresh: () => void;
}

// Interface para o formulário de edição de itens
interface ItemEditFormData {
  name?: string;
  value?: number;
  baseId?: string;
}

export function createItemColumns({ onRefresh }: CreateItemColumnsOptions) {
  const [editingItem, setEditingItem] = useState<RepairOrderServiceItemAPISchema | null>(null);
  const [formData, setFormData] = useState<ItemEditFormData>({});
  const [bases, setBases] = useState<BaseAPISchema[]>([]);
  const { editItem, isEditing } = useEditItem<RepairOrderServiceItemAPISchema>("repair-order-service-items", onRefresh);

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
    setEditingItem(item);
    setFormData({
      name: item.name,
      value: item.value,
      baseId: item.base.id
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Converter valor para número quando for o campo 'value'
    if (name === 'value') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;
    await editItem(editingItem.id, formData);
    setEditingItem(null);
  };

  const renderEditDialog = (item: RepairOrderServiceItemAPISchema) => (
    <EditDialog
      isOpen={editingItem?.id === item.id}
      onClose={() => setEditingItem(null)}
      onConfirm={handleSave}
      title="Editar Item"
      isLoading={isEditing[item.id] || false}
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
          <Label htmlFor="value" className="text-right">
            Valor
          </Label>
          <Input
            id="value"
            name="value"
            type="number"
            step="0.01"
            value={formData.value || ""}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="baseId" className="text-right">
            Base
          </Label>
          <select
            id="baseId"
            name="baseId"
            value={formData.baseId || ""}
            onChange={handleInputChange}
            className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            <option value="">Selecione uma base</option>
            {bases.map((base) => (
              <option key={base.id} value={base.id}>
                {base.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </EditDialog>
  );

  // Define the columns specific to items
  const itemColumns: ColumnDef<RepairOrderServiceItemAPISchema>[] = [

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
    accessorKey: "value",
    header: "Valor",
  },
  {
    accessorKey: "base",
    header: "Base",
    cell: ({ row }) => {
      return <span>{row.original.base.name}</span>;
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
    endpoint: "repair-order-service-items",
    onRefresh,
    deleteConfirmationTitle: "Excluir item",
    deleteConfirmationMessage: "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.",
    additionalColumns: itemColumns,
    onEdit: handleEditClick,
    editDialogContent: renderEditDialog,
  });

  // Adicionar o diálogo de edição como uma propriedade ao array de colunas
  // @ts-ignore - Adicionando uma propriedade personalizada ao array
  columns.EditDialog = editingItem ? renderEditDialog(editingItem) : null;
  
  return columns;
}
