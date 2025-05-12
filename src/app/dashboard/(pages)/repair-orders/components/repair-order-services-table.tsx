"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ServiceDetailsDialog } from "./service-details-dialog";
import { ServiceEditDialog } from "./service-edit-dialog";
import type { RepairOrderServiceAPISchema } from "@/types/api-schemas";

interface RepairOrderServicesTableProps {
  repairOrderId: string;
  services: RepairOrderServiceAPISchema[];
  onRefresh: () => void;
}

export function RepairOrderServicesTable({ repairOrderId, services, onRefresh }: RepairOrderServicesTableProps) {
  const [selectedService, setSelectedService] = useState<RepairOrderServiceAPISchema | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedService) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-services/${selectedService.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao excluir serviço");
      }

      toast.success("Serviço excluído com sucesso");
      setIsDeleteDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error("Erro ao excluir serviço:", error);
      toast.error("Erro ao excluir serviço");
    } finally {
      setIsDeleting(false);
    }
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
    <>
      <Card>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum serviço encontrado
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.item?.name || "N/A"}</TableCell>
                    <TableCell>{service.quantity}</TableCell>
                    <TableCell>{getCategoryLabel(service.category)}</TableCell>
                    <TableCell>{getTypeLabel(service.type)}</TableCell>
                    <TableCell>
                      {service.item?.value 
                        ? formatCurrency(Number(service.item.value) * service.quantity) 
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedService(service);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedService(service);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedService(service);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Diálogo de visualização de detalhes */}
      {selectedService && (
        <ServiceDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          service={selectedService}
        />
      )}

      {/* Diálogo de edição */}
      {selectedService && (
        <ServiceEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          service={selectedService}
          repairOrderId={repairOrderId}
          onSuccess={() => {
            onRefresh();
            setIsEditDialogOpen(false);
          }}
        />
      )}

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
