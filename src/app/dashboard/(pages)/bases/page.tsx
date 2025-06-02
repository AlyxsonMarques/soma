"use client";

import { EnhancedDataTable } from "@/components/data-table/enhanced-data-table";
import type { BaseAPISchema } from "@/types/api-schemas";
import { useEffect, useState } from "react";
import { DashboardHeader } from "../../components/dashboard-header";
import { createBaseColumns } from "./components/bases-table-columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BasesPage() {
  const [data, setData] = useState<BaseAPISchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bases`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = createBaseColumns({
    onRefresh: fetchData
  });

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Bases</h1>
          <Button onClick={() => router.push("/dashboard/bases/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Base
          </Button>
        </div>
        
        <EnhancedDataTable<BaseAPISchema>
          columns={columns}
          data={data}
          filterColumn="name"
          filterPlaceholder="Pesquisar por nome"
          isLoading={isLoading}
          endpoint="bases"
          onRefresh={fetchData}
          idAccessor="id"
          deleteConfirmationTitle="Excluir base"
          deleteConfirmationMessage="Tem certeza que deseja excluir esta base? Esta ação não pode ser desfeita."
          bulkDeleteConfirmationTitle="Excluir bases"
          bulkDeleteConfirmationMessage="Tem certeza que deseja excluir todas as bases selecionadas? Esta ação não pode ser desfeita."
        />
      </div>
    </>
  );
}
