"use client";

import { EnhancedDataTable } from "@/components/data-table/enhanced-data-table";
import type { UserAPISchema } from "@/types/api-schemas";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "../../components/dashboard-header";
import { createUserColumns } from "./components/users-table-columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();
  const [data, setData] = useState<UserAPISchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`);
      const result = await response.json();
      
      // Convert date strings to Date objects
      const formattedData = result.map((user: any) => ({
        ...user,
        birthDate: new Date(user.birthDate),
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      }));
      
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = createUserColumns({
    onRefresh: fetchData
  });

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Usuários</h1>
          <Button onClick={() => router.push("/dashboard/users/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
        
        <EnhancedDataTable<UserAPISchema>
          columns={columns}
          data={data}
          filterColumn="name"
          filterPlaceholder="Pesquisar por nome"
          isLoading={isLoading}
          endpoint="users"
          onRefresh={fetchData}
          idAccessor="id"
          deleteConfirmationTitle="Excluir usuário"
          deleteConfirmationMessage="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
          bulkDeleteConfirmationTitle="Excluir usuários"
          bulkDeleteConfirmationMessage="Tem certeza que deseja excluir todos os usuários selecionados? Esta ação não pode ser desfeita."
        />
      </div>
    </>
  );
}
