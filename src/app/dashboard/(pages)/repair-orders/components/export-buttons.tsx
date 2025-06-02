"use client";

import { Button } from "@/components/ui/button";
import { exportMultipleRepairOrdersToZip, exportSingleRepairOrderToPDF } from "@/lib/pdf-generator";
import type { RepairOrderAPISchema } from "@/types/api-schemas";
import { Download, FileDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExportButtonsProps {
  selectedRows: RepairOrderAPISchema[];
  allData: RepairOrderAPISchema[];
}

export function ExportButtons({ selectedRows, allData }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportSelected = async () => {
    if (selectedRows.length === 0) {
      toast.error("Selecione pelo menos uma guia de remessa para exportar");
      return;
    }

    setIsExporting(true);
    try {
      if (selectedRows.length === 1) {
        // Exportar uma única GR como PDF
        exportSingleRepairOrderToPDF(selectedRows[0]);
        toast.success("Guia de remessa exportada com sucesso");
      } else {
        // Exportar múltiplas GRs como ZIP
        await exportMultipleRepairOrdersToZip(selectedRows);
        toast.success(`${selectedRows.length} Guias de remessa exportadas com sucesso`);
      }
    } catch (error) {
      console.error("Erro ao exportar guias de remessa:", error);
      toast.error("Erro ao exportar guias de remessa");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    if (allData.length === 0) {
      toast.error("Não há guias de remessa para exportar");
      return;
    }

    setIsExporting(true);
    try {
      if (allData.length === 1) {
        // Exportar uma única GR como PDF
        exportSingleRepairOrderToPDF(allData[0]);
        toast.success("Guia de remessa exportada com sucesso");
      } else {
        // Exportar múltiplas GRs como ZIP
        await exportMultipleRepairOrdersToZip(allData);
        toast.success(`${allData.length} Guias de remessa exportadas com sucesso`);
      }
    } catch (error) {
      console.error("Erro ao exportar todas as guias de remessa:", error);
      toast.error("Erro ao exportar todas as guias de remessa");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportSelected}
        disabled={isExporting || selectedRows.length === 0}
      >
        <FileDown className="h-4 w-4 mr-2" />
        Exportar selecionadas
        {selectedRows.length > 0 && ` (${selectedRows.length})`}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportAll}
        disabled={isExporting || allData.length === 0}
      >
        <Download className="h-4 w-4 mr-2" />
        Exportar todas
        {allData.length > 0 && ` (${allData.length})`}
      </Button>
    </div>
  );
}
