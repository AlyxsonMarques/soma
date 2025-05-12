"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DashboardHeader } from "../../../components/dashboard-header";
import { Loader2, ArrowLeft, Edit } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { RepairOrderServiceItemAPISchema } from "@/types/api-schemas";
import { ItemDetailsForm } from "../components/item-details-form";

export default function ItemDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [item, setItem] = useState<RepairOrderServiceItemAPISchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const fetchItem = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-service-items/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch item");
      }
      const data = await response.json();
      setItem(data);
    } catch (error) {
      console.error("Error fetching item:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const handleBackClick = () => {
    router.back();
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">Item não encontrado</h1>
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
          <h1 className="text-2xl font-bold">Detalhes do Item</h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="text-muted-foreground">Valor: {formatCurrency(Number(item.value))}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={isEditing ? "default" : "outline"} 
              onClick={handleEditToggle}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancelar Edição" : "Editar Item"}
            </Button>
          </div>
        </div>

        <Separator />

        {isEditing ? (
          <ItemDetailsForm 
            item={item} 
            onSuccess={() => {
              fetchItem();
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Informações do Item</CardTitle>
              <CardDescription>Detalhes completos do item</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Nome</p>
                <p>{item.name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Valor</p>
                <p>{formatCurrency(Number(item.value))}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Base</p>
                <p>{item.base.name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">ID da Base</p>
                <p>{item.base.id}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Criado em</p>
                <p>{new Date(item.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Atualizado em</p>
                <p>{new Date(item.updatedAt).toLocaleDateString("pt-BR")}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
