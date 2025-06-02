"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "../../../components/dashboard-header";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UserCreateForm } from "../components/user-create-form";

export default function NewUser() {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const handleSuccess = () => {
    // Redirecionar para a lista de usuários após criação bem-sucedida
    router.push("/dashboard/users");
  };

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Novo Usuário</h1>
        </div>

        <Separator />

        <UserCreateForm 
          onSuccess={handleSuccess}
          onCancel={handleBackClick}
        />
      </div>
    </>
  );
}
