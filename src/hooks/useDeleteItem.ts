import { useState } from "react";
import { toast } from "sonner";

export function useDeleteItem<T>(
  endpoint: string,
  onSuccess?: () => void
) {
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

  const deleteItem = async (id: string) => {
    if (isDeleting[id]) return;

    setIsDeleting((prev) => ({ ...prev, [id]: true }));
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/${endpoint}/${id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.error) {
        toast.error(data.message || "Erro ao excluir item");
      } else {
        toast.success(data.message || "Item excluído com sucesso");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor");
      console.error(error);
    } finally {
      setIsDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  return { deleteItem, isDeleting };
}