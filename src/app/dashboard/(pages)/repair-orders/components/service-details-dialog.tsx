"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { formatImageUrl } from "@/lib/image-utils";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import type { RepairOrderServiceAPISchema, RepairOrderServiceItemAPISchema } from "@/types/api-schemas";

interface ServiceDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: RepairOrderServiceAPISchema;
}

export function ServiceDetailsDialog({ isOpen, onClose, service }: ServiceDetailsDialogProps) {
  const [items, setItems] = useState<RepairOrderServiceItemAPISchema[]>([]);

  // Buscar itens para o select (apenas para exibição)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-service-items`);
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      } catch (error) {
        console.error("Erro ao buscar itens:", error);
      }
    };

    if (isOpen) {
      fetchItems();
    }
  }, [isOpen]);

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      "LABOR": "Mão de Obra",
      "MATERIAL": "Material"
    };
    return categories[category] || category;
  };

  const getServiceStatusBadge = (status: string) => {
    // Define custom type for badge variants that includes all possible values
    type BadgeVariant = "default" | "destructive" | "outline" | "secondary" | "success" | "warning";
    
    // Map status to appropriate badge variant and label
    const statusMap: Record<string, { label: string; variant: BadgeVariant; icon: React.ReactNode }> = {
      "PENDING": { label: "Pendente", variant: "outline", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
      "APPROVED": { label: "Aprovado Integralmente", variant: "success", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      "CANCELLED": { label: "Cancelado", variant: "destructive", icon: <XCircle className="h-3 w-3 mr-1" /> }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: "default" as BadgeVariant, icon: <AlertCircle className="h-3 w-3 mr-1" /> };
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center justify-center">
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      "PREVENTIVE": "Preventivo",
      "CORRECTIVE": "Corretivo",
      "HELP": "Socorro"
    };
    return types[type] || type;
  };

  // Encontrar o item selecionado
  const selectedItem = items.find(item => item.id === service.item?.id);

  // Preparar os dados de duração para exibição
  const durationFrom = service.duration?.from ? new Date(service.duration.from) : new Date();
  const durationTo = service.duration?.to ? new Date(service.duration.to) : new Date();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Serviço</DialogTitle>
          <DialogDescription>
            Informações completas sobre o serviço
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-1 space-y-2">
              <p className="text-sm font-medium">Item</p>
              <div className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                {selectedItem?.name || service.item?.name || "N/A"}
              </div>
            </div>

            <div className="col-span-1 space-y-2">
              <p className="text-sm font-medium">Quantidade</p>
              <div className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                {service.quantity}
              </div>
            </div>

            <div className="col-span-1 space-y-2">
              <p className="text-sm font-medium">Categoria</p>
              <div className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                {getCategoryLabel(service.category)}
              </div>
            </div>

            <div className="col-span-1 space-y-2">
              <p className="text-sm font-medium">Tipo</p>
              <div className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                {getTypeLabel(service.type)}
              </div>
            </div>

            <div className="col-span-1 space-y-2">
              <p className="text-sm font-medium">Status</p>
              <div className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex items-center">
                {getServiceStatusBadge(service.status || "PENDING")}
              </div>
            </div>

            {service.labor && (
              <div className="col-span-2 space-y-2">
                <p className="text-sm font-medium">Mão de Obra</p>
                <div className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {service.labor}
                </div>
              </div>
            )}

            <div className="col-span-1 space-y-2">
              <p className="text-sm font-medium">Valor do Serviço</p>
              <div className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                {formatCurrency(Number(service.value || 0))}
              </div>
            </div>

            <div className="col-span-1 space-y-2">
              <p className="text-sm font-medium">Desconto do Serviço</p>
              <div className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                {formatCurrency(Number(service.discount || 0))}
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <p className="text-sm font-medium">Período</p>
              <div className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex justify-between">
                <span>De: {durationFrom.toLocaleDateString('pt-BR')}</span>
                <span>Até: {durationTo.toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {service.photo && (
              <div className="col-span-2 space-y-2">
                <p className="text-sm font-medium">Foto</p>
                <div className="relative h-48 w-full overflow-hidden rounded-md border border-input">
                  <img
                    src={formatImageUrl(service.photo)}
                    alt="Foto do serviço"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
