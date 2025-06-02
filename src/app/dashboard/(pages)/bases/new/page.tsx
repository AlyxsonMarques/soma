"use client";

import { useRouter } from "next/navigation";
import { BaseCreateForm } from "../components/base-create-form";
import { DashboardHeader } from "../../../components/dashboard-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function NewBasePage() {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const handleSuccess = (baseId: string) => {
    // Redirecionar para a página de detalhes da base após criação bem-sucedida
    router.push(`/dashboard/bases/${baseId}`);
  };

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Nova Base</h1>
        </div>

        <Separator />

        <BaseCreateForm 
          onSuccess={handleSuccess}
          onCancel={handleBackClick} />
      </div>
    </>
  );
}
