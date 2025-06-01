"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Eye, Check, AlertCircle, CheckCircle, XCircle } from "lucide-react";
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

import { Badge } from "@/components/ui/badge";
import { ServiceDetailsDialog } from "./service-details-dialog";
import { ServiceEditDialog } from "./service-edit-dialog";
import { ServiceAddDialog } from "./service-add-dialog";
import { ServiceTableToolbar } from "./service-table-toolbar";
import type { RepairOrderServiceAPISchema } from "@/types/api-schemas";

interface RepairOrderServicesTableProps {
  repairOrderId: string;
  services: RepairOrderServiceAPISchema[];
  onRefresh: () => void;
  onServiceEdit?: () => void;
}

export function RepairOrderServicesTable({ repairOrderId, services, onRefresh, onServiceEdit }: RepairOrderServicesTableProps) {
  // Definir um serviço padrão para evitar erros quando nenhum serviço é selecionado
  const defaultService = services.length > 0 ? services[0] : null;
  
  const [selectedService, setSelectedService] = useState<RepairOrderServiceAPISchema | null>(defaultService);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Atualizar o serviço selecionado quando a lista de serviços mudar
  useEffect(() => {
    if (services.length > 0 && !selectedService) {
      setSelectedService(services[0]);
    }
  }, [services, selectedService]);

  // Effect to handle select all checkbox
  useEffect(() => {
    if (selectAll) {
      setSelectedServices(services.map(service => service.id));
    } else if (selectedServices.length === services.length) {
      // If all items are manually selected, update selectAll state
      setSelectAll(true);
    }
  }, [selectAll, services]);

  const handleSelectService = (serviceId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedServices(prev => [...prev, serviceId]);
    } else {
      setSelectedServices(prev => prev.filter(id => id !== serviceId));
      setSelectAll(false);
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    setSelectAll(isSelected);
    if (!isSelected) {
      setSelectedServices([]);
    }
  };

  const clearSelection = () => {
    setSelectedServices([]);
    setSelectAll(false);
  };

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
      // Remove from selected services if it was selected
      setSelectedServices(prev => prev.filter(id => id !== selectedService.id));
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

  const getServiceStatusBadge = (status: string) => {
    // Define custom type for badge variants that includes all possible values
    type BadgeVariant = "default" | "destructive" | "outline" | "secondary" | "success" | "warning";
    
    // Map status to appropriate badge variant and label
    const statusMap: Record<string, { label: string; variant: BadgeVariant; icon: React.ReactNode }> = {
      "PENDING": { label: "Pendente", variant: "outline", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
      "APPROVED": { label: "Aprovado Integralmente", variant: "default", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
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
    const types: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" | "success" | "warning" }> = {
      "CORRECTIVE": { label: "Corretivo", variant: "destructive" },
      "PREVENTIVE": { label: "Preventivo", variant: "outline" },
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Serviços</h2>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          Adicionar Serviço
        </Button>
      </div>
      
      {/* Toolbar for bulk actions */}
      <ServiceTableToolbar 
        selectedServices={selectedServices} 
        onClearSelection={clearSelection} 
        onRefresh={onRefresh} 
      />
      
      <Card>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </div>
                </TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Nenhum serviço encontrado
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service.id} className={selectedServices.includes(service.id) ? "bg-muted/50" : ""}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={selectedServices.includes(service.id)}
                          onChange={(e) => handleSelectService(service.id, e.target.checked)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{service.item?.name || "N/A"}</TableCell>
                    <TableCell>{service.quantity}</TableCell>
                    <TableCell>{getCategoryLabel(service.category)}</TableCell>
                    <TableCell>{getTypeLabel(service.type)}</TableCell>
                    <TableCell>
                      {service.value
                        ? formatCurrency(service.value)
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {getServiceStatusBadge(service.status || "PENDING")}
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
                              // Definir o serviço selecionado e abrir o modal imediatamente
                              setSelectedService(service);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              // Definir o serviço selecionado e abrir o modal imediatamente
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
          key={`view-${selectedService.id}`}
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          service={selectedService}
        />
      )}

      {/* Diálogo de edição */}
      {selectedService && isEditDialogOpen && (
        <ServiceEditDialog
          key={`edit-${selectedService.id}`}
          isOpen={true}
          onClose={() => {
            // Primeiro fechamos o diálogo localmente
            setIsEditDialogOpen(false);
            // Limpamos a seleção após um pequeno atraso para evitar problemas de renderização
            setTimeout(() => {
              setSelectedService(null);
            }, 300);
          }}
          service={selectedService}
          repairOrderId={repairOrderId}
          onSuccess={() => {
            // Primeiro atualizamos os dados
            onRefresh();
            // Depois mudamos para a aba de serviços se necessário
            if (onServiceEdit) onServiceEdit();
            // Fechamos o diálogo após todas as ações
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

      {/* Diálogo de adição de serviço */}
      <ServiceAddDialog
        key="add-service-dialog"
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        repairOrderId={repairOrderId}
        onSuccess={() => {
          onRefresh();
          setIsAddDialogOpen(false);
        }}
      />
    </>
  );
}
