"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "../../../components/dashboard-header";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RepairOrderCreateForm } from "../components/repair-order-create-form";

export default function NewRepairOrder() {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const handleSuccess = (id: string) => {
    // Redirecionar para a página de detalhes da GR após criação bem-sucedida
    router.push(`/dashboard/repair-orders/${id}`);
  };

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Nova Guia de Reparo</h1>
        </div>

        <Separator />

        <RepairOrderCreateForm 
          onSuccess={handleSuccess}
          onCancel={handleBackClick}
        />
      </div>
    </>
  );
}
