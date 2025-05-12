"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { createTableColumns } from "@/components/data-table/create-table-columns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditDialog } from "@/components/ui/edit-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditItem } from "@/hooks/useEditItem";
import type { BaseAPISchema, RepairOrderAPISchema, UserAPISchema } from "@/types/api-schemas";
import { RepairOrderStatus } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";

interface CreateRepairOrderColumnsOptions {
  onRefresh: () => void;
}

// Interface para o formulário de edição de ordens de reparo
interface RepairOrderEditFormData {
  gcaf?: number;
  baseId?: string;
  userIds?: string[];
  plate?: string;
  kilometers?: number;
  status?: RepairOrderStatus;
  observations?: string;
  discount?: number;
}

export function createRepairOrderColumns({ onRefresh }: CreateRepairOrderColumnsOptions) {
  const [editingOrder, setEditingOrder] = useState<RepairOrderAPISchema | null>(null);
  const [formData, setFormData] = useState<RepairOrderEditFormData>({});
  const [bases, setBases] = useState<BaseAPISchema[]>([]);
  const [users, setUsers] = useState<UserAPISchema[]>([]);
  const { editItem, isEditing } = useEditItem<RepairOrderAPISchema>("repair-orders", onRefresh);

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
    setEditingOrder(order);
    setFormData({
      gcaf: Number(order.gcaf),
      baseId: order.base?.id,
      userIds: order.users?.map(user => user.id) || [],
      plate: order.plate,
      kilometers: order.kilometers,
      status: order.status,
      observations: order.observations || "",
      discount: Number(order.discount)
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'kilometers' || name === 'discount') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'gcaf') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else if (name === 'status') {
      setFormData(prev => ({ ...prev, [name]: value as RepairOrderStatus }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUserSelection = (userId: string) => {
    setFormData(prev => {
      const currentUserIds = prev.userIds || [];
      if (currentUserIds.includes(userId)) {
        return { ...prev, userIds: currentUserIds.filter(id => id !== userId) };
      } else {
        return { ...prev, userIds: [...currentUserIds, userId] };
      }
    });
  };

  const handleSave = async () => {
    if (!editingOrder) return;
    await editItem(editingOrder.id, formData);
    setEditingOrder(null);
  };

  const renderEditDialog = (order: RepairOrderAPISchema) => (
    <EditDialog
      isOpen={editingOrder?.id === order.id}
      onClose={() => setEditingOrder(null)}
      onConfirm={handleSave}
      title="Editar Ordem de Reparo"
      isLoading={isEditing[order.id] || false}
    >
      <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="gcaf" className="text-right">
            GCAF
          </Label>
          <Input
            id="gcaf"
            name="gcaf"
            type="number"
            value={formData.gcaf || ""}
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

        <div className="grid grid-cols-4 items-start gap-4">
          <Label className="text-right mt-2">
            Usuários
          </Label>
          <div className="col-span-3 grid gap-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`user-${user.id}`}
                  checked={formData.userIds?.includes(user.id) || false}
                  onChange={() => handleUserSelection(user.id)}
                  className="h-4 w-4"
                />
                <label htmlFor={`user-${user.id}`}>{user.name}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="plate" className="text-right">
            Placa
          </Label>
          <Input
            id="plate"
            name="plate"
            value={formData.plate || ""}
            onChange={handleInputChange}
            className="col-span-3"
            maxLength={7}
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="kilometers" className="text-right">
            Kilometragem
          </Label>
          <Input
            id="kilometers"
            name="kilometers"
            type="number"
            value={formData.kilometers || ""}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="text-right">
            Status
          </Label>
          <select
            id="status"
            name="status"
            value={formData.status || ""}
            onChange={handleInputChange}
            className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            <option value="PENDING">Pendente</option>
            <option value="REVISION">Revisão</option>
            <option value="APPROVED">Aprovado</option>
            <option value="PARTIALLY_APPROVED">Parcialmente Aprovado</option>
            <option value="INVOICE_APPROVED">Aprovado para Nota Fiscal</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="discount" className="text-right">
            Desconto
          </Label>
          <Input
            id="discount"
            name="discount"
            type="number"
            step="0.01"
            value={formData.discount || ""}
            onChange={handleInputChange}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="observations" className="text-right mt-2">
            Observações
          </Label>
          <textarea
            id="observations"
            name="observations"
            value={formData.observations || ""}
            onChange={handleInputChange}
            className="col-span-3 min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          />
        </div>

        <div className="border-t pt-4 mt-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Serviços</h3>
            <p className="text-sm text-muted-foreground">Para editar serviços, use a página de detalhes da ordem</p>
          </div>
        </div>
      </div>
    </EditDialog>
  );

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
    onEdit: handleEditClick,
    editDialogContent: renderEditDialog,
  });

  // Adicionar o diálogo de edição como uma propriedade ao array de colunas
  // @ts-ignore - Adicionando uma propriedade personalizada ao array
  columns.EditDialog = editingOrder ? renderEditDialog(editingOrder) : null;
  
  return columns;
}
