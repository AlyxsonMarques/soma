"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import type { RepairOrderServiceAPISchema } from "@/types/api-schemas";

interface ServiceDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: RepairOrderServiceAPISchema;
}

export function ServiceDetailsDialog({ isOpen, onClose, service }: ServiceDetailsDialogProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      "LABOR": "Mão de Obra",
      "PART": "Peça",
      "SERVICE": "Serviço",
    };
    return categories[category] || category;
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" | "success" | "warning" }> = {
      "PREVENTIVE": { label: "Preventivo", variant: "success" },
      "CORRECTIVE": { label: "Corretivo", variant: "warning" },
      "PREDICTIVE": { label: "Preditivo", variant: "secondary" },
    };
    
    const typeInfo = types[type] || { label: type, variant: "default" };
    
    return (
      <Badge variant={typeInfo.variant}>
        {typeInfo.label}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Serviço</DialogTitle>
          <DialogDescription>
            Informações completas sobre o serviço
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Item</p>
              <p className="text-sm">{service.item?.name || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Quantidade</p>
              <p className="text-sm">{service.quantity}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Categoria</p>
              <p className="text-sm">{getCategoryLabel(service.category)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Tipo</p>
              <p className="text-sm">{getTypeLabel(service.type)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Valor Unitário</p>
              <p className="text-sm">{service.item?.value ? formatCurrency(Number(service.item.value)) : "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Valor Total</p>
              <p className="text-sm">{service.item?.value ? formatCurrency(Number(service.item.value) * service.quantity) : "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Mão de Obra</p>
              <p className="text-sm">{service.labor || "N/A"}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Período</p>
            <div className="flex gap-2 text-sm">
              <span>De: {service.duration?.from ? formatDate(service.duration.from) : "N/A"}</span>
              <span>Até: {service.duration?.to ? formatDate(service.duration.to) : "N/A"}</span>
            </div>
          </div>
          
          {service.photo && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Foto</p>
              <div className="relative h-48 w-full overflow-hidden rounded-md">
                <Image
                  src={service.photo}
                  alt="Foto do serviço"
                  fill
                  className="object-contain"
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
