"use client";

import { EnhancedDataTable } from "@/components/data-table/enhanced-data-table";
import type { UserAPISchema } from "@/types/user";
import { DashboardHeader } from "../../components/dashboard-header";
import { useEffect, useState } from "react";
import { columns } from "./components/pending-registrations-table-columns";

export default function PendingRegistrationsPage() {
  const [data, setData] = useState<UserAPISchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`);
      const result = await response.json();
      
      // Converter datas de string para objetos Date
      const formattedData = result.map((user: any) => ({
        ...user,
        birthDate: new Date(user.birthDate),
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      }));
      
      setData(formattedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <EnhancedDataTable<UserAPISchema>
          columns={columns}
          data={data}
          filterColumn="email"
          filterPlaceholder="Pesquisar por email"
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
