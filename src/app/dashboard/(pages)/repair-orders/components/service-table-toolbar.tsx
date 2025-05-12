"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ServiceTableToolbarProps {
  selectedServices: string[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

export function ServiceTableToolbar({ selectedServices, onClearSelection, onRefresh }: ServiceTableToolbarProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBulkDelete = async () => {
    if (selectedServices.length === 0) return;
    
    setIsDeleting(true);
    try {
      // Delete each selected service
      const deletePromises = selectedServices.map(id => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-services/${id}`, {
          method: "DELETE",
        })
      );
      
      const results = await Promise.allSettled(deletePromises);
      
      // Check if all deletions were successful
      const allSuccessful = results.every(result => result.status === "fulfilled" && (result.value as Response).ok);
      
      if (allSuccessful) {
        toast.success(`${selectedServices.length} serviço(s) excluído(s) com sucesso`);
        onClearSelection();
        onRefresh();
      } else {
        const failedCount = results.filter(result => 
          result.status === "rejected" || ((result.status === "fulfilled" && !(result.value as Response).ok))
        ).length;
        
        if (failedCount === selectedServices.length) {
          toast.error("Falha ao excluir serviços");
        } else {
          toast.warning(`${selectedServices.length - failedCount} serviço(s) excluído(s), ${failedCount} falhou(aram)`);
          onClearSelection();
          onRefresh();
        }
      }
    } catch (error) {
      console.error("Erro ao excluir serviços:", error);
      toast.error("Erro ao excluir serviços");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (selectedServices.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 py-4">
        <div className="text-sm text-muted-foreground">
          {selectedServices.length} item(ns) selecionado(s)
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="h-8 px-2 lg:px-3"
        >
          <Trash2 className="h-4 w-4" />
          <span className="ml-2 hidden md:inline">Excluir</span>
        </Button>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir serviços</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedServices.length} serviço(s)? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
