import { useState } from "react";
import { toast } from "sonner";

export function useEditItem<T>(
  endpoint: string,
  onSuccess?: () => void
) {
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});

  const editItem = async (id: string, data: Partial<T>) => {
    if (isEditing[id]) return;

    setIsEditing((prev) => ({ ...prev, [id]: true }));
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/${endpoint}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      if (responseData.error) {
        toast.error(responseData.message || "Erro ao editar item");
      } else {
        toast.success(responseData.message || "Item editado com sucesso");
        if (onSuccess) onSuccess();
      }

      return responseData;
    } catch (error) {
      toast.error("Erro ao conectar com o servidor");
      console.error(error);
      return { error: true, message: "Erro ao conectar com o servidor" };
    } finally {
      setIsEditing((prev) => ({ ...prev, [id]: false }));
    }
  };

  return { editItem, isEditing };
}
