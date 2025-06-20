"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DashboardHeader } from "../../../components/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Loader2, ArrowLeft, Edit, Plus, FileText } from "lucide-react";
import { viewRepairOrderPDF } from "@/lib/pdf-generator";
import { RepairOrderDetailsForm } from "../components/repair-order-details-form";
import { RepairOrderServicesTable } from "../components/repair-order-services-table";
import type { RepairOrderAPISchema } from "@/types/api-schemas";

export default function RepairOrderDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [repairOrder, setRepairOrder] = useState<RepairOrderAPISchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const fetchRepairOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-orders/${id}`);
      if (!response.ok) {
        throw new Error("Falha ao buscar a ordem de reparo");
      }
      const data = await response.json();
      setRepairOrder(data);
    } catch (error) {
      console.error("Error fetching repair order:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairOrder();
  }, [id]);

  const handleBackClick = () => {
    router.back();
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Calcular o valor total dos serviços
  const calculateTotalValue = () => {
    if (!repairOrder?.services || repairOrder.services.length === 0) {
      return 0;
    }
    
    return repairOrder.services.reduce((total, service) => {
      return total + Number(service.value || 0);
    }, 0);
  };
  
  // Calcular o desconto total dos serviços
  const calculateTotalDiscount = () => {
    if (!repairOrder?.services || repairOrder.services.length === 0) {
      return 0;
    }
    
    return repairOrder.services.reduce((total, service) => {
      return total + Number(service.discount || 0);
    }, 0);
  };

  const getStatusBadge = (status: string) => {
    // Define custom type for badge variants that includes all possible values
    type BadgeVariant = "default" | "destructive" | "outline" | "secondary" | "success" | "warning";
    
    // Map status to appropriate badge variant and label
    const statusMap: Record<string, { label: string; variant: BadgeVariant }> = {
      "PENDING": { label: "Pendente", variant: "outline" },
      "REVISION": { label: "Revisão", variant: "outline" },
      "APPROVED": { label: "Aprovado Integralmente", variant: "default" },
      "PARTIALLY_APPROVED": { label: "Parcialmente Aprovado", variant: "secondary" },
      "INVOICE_APPROVED": { label: "Aprovado para Nota Fiscal", variant: "secondary" },
      "CANCELLED": { label: "Cancelado", variant: "destructive" }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: "default" as BadgeVariant };
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!repairOrder) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">Ordem de reparo não encontrada</h1>
        <Button onClick={handleBackClick}>Voltar</Button>
      </div>
    );
  }

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Detalhes da GR</h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">GCAF: {repairOrder.gcaf}</h2>
              {getStatusBadge(repairOrder.status)}
            </div>
            <p className="text-muted-foreground">Placa: {repairOrder.plate}</p>
          </div>
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={handleBackClick} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => viewRepairOrderPDF(id)} 
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Visualizar PDF
              </Button>
              <Button 
                variant={isEditing ? "default" : "outline"} 
                onClick={handleEditToggle}
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                {isEditing ? "Cancelar Edição" : "Editar Ordem"}
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 pt-4">
            {isEditing ? (
              <RepairOrderDetailsForm 
                repairOrder={repairOrder} 
                onSuccess={() => {
                  fetchRepairOrder();
                  setIsEditing(false);
                }}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Guia de Remessa</CardTitle>
                  <CardDescription>Detalhes completos da Guia de Remessa</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">GCAF</p>
                    <p>{repairOrder.gcaf}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Base</p>
                    <p>{repairOrder.base?.name || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Placa</p>
                    <p>{repairOrder.plate}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Kilometragem</p>
                    <p>{repairOrder.kilometers} km</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Status</p>
                    <p>{getStatusBadge(repairOrder.status)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Valor Total</p>
                    <p>{formatCurrency(calculateTotalValue())}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Desconto Total</p>
                    <p>{formatCurrency(calculateTotalDiscount())}</p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <p className="text-sm font-medium">Observações</p>
                    <p>{repairOrder.observations || "Nenhuma observação"}</p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <p className="text-sm font-medium">Mecânicos Responsáveis</p>
                    <div className="flex flex-wrap gap-2">
                      {repairOrder.users && repairOrder.users.length > 0 ? (
                        repairOrder.users.map((user) => (
                          <Badge key={user.id} variant="outline">
                            {user.name}
                          </Badge>
                        ))
                      ) : (
                        <p>Nenhum usuário associado</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="services" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Serviços da Guia de Remessa</h3>
            </div>
            <RepairOrderServicesTable 
              repairOrderId={id} 
              services={repairOrder.services || []} 
              onRefresh={fetchRepairOrder}
              onServiceEdit={() => setActiveTab("services")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
