"use client";

import { EnhancedDataTable } from "@/components/data-table/enhanced-data-table";
import type { RepairOrderServiceItemAPISchema } from "@/types/api-schemas";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "../../components/dashboard-header";
import { createItemColumns } from "./components/items-table-columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ItemsPage() {
  const router = useRouter();
  const [data, setData] = useState<RepairOrderServiceItemAPISchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-service-items`);
      const result = await response.json();
      
      // Convert date strings to Date objects
      const formattedData = result.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
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

  const columns = createItemColumns({
    onRefresh: fetchData
  });

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Itens da GR</h1>
          <Button onClick={() => router.push("/dashboard/items/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </Button>
        </div>
        
        <EnhancedDataTable<RepairOrderServiceItemAPISchema>
          columns={columns}
          data={data}
          filterColumn="name"
          filterPlaceholder="Pesquisar por nome"
          isLoading={isLoading}
          endpoint="repair-order-service-items"
          onRefresh={fetchData}
          idAccessor="id"
          deleteConfirmationTitle="Excluir item"
          deleteConfirmationMessage="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
          bulkDeleteConfirmationTitle="Excluir itens"
          bulkDeleteConfirmationMessage="Tem certeza que deseja excluir todos os itens selecionados? Esta ação não pode ser desfeita."
        />
      </div>
    </>
  );
}
