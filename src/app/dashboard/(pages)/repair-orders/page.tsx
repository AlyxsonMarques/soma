"use client";

import { EnhancedDataTable } from "@/components/data-table/enhanced-data-table";
import type { RepairOrderAPISchema } from "@/types/api-schemas";
import { useEffect, useState } from "react";
import { DashboardHeader } from "../../components/dashboard-header";
import { createRepairOrderColumns } from "./components/orders-table-columns";
import { ExportButtons } from "./components/export-buttons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RepairOrder() {
  const [data, setData] = useState<RepairOrderAPISchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-orders`);
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

  const columns = createRepairOrderColumns({
    onRefresh: fetchData
  });

  // Estado para rastrear as linhas selecionadas
  const [selectedRows, setSelectedRows] = useState<RepairOrderAPISchema[]>([]);

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Exportar Guias de Remessa</CardTitle>
            <CardDescription>
              Exporte uma ou mais Guias de Remessa para PDF. Selecione as guias na tabela abaixo ou exporte todas de uma vez.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExportButtons selectedRows={selectedRows} allData={data} />
          </CardContent>
        </Card>
        
        <EnhancedDataTable<RepairOrderAPISchema>
          columns={columns}
          data={data}
          filterColumn="gcaf"
          filterPlaceholder="Pesquisar por GCAF"
          isLoading={isLoading}
          endpoint="repair-orders"
          onRefresh={fetchData}
          idAccessor="id"
          deleteConfirmationTitle="Excluir ordem de reparo"
          deleteConfirmationMessage="Tem certeza que deseja excluir esta ordem de reparo? Esta ação não pode ser desfeita."
          bulkDeleteConfirmationTitle="Excluir ordens de reparo"
          bulkDeleteConfirmationMessage="Tem certeza que deseja excluir todas as ordens de reparo selecionadas? Esta ação não pode ser desfeita."
          onSelectionChange={(rows) => setSelectedRows(rows)}
        />
      </div>
    </>
  );
}
