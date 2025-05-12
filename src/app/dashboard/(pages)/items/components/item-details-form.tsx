"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BaseAPISchema, RepairOrderServiceItemAPISchema } from "@/types/api-schemas";
import { Loader2 } from "lucide-react";

interface ItemDetailsFormProps {
  item: RepairOrderServiceItemAPISchema;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ItemFormData {
  name: string;
  value: number;
  baseId: string;
}

export function ItemDetailsForm({ item, onSuccess, onCancel }: ItemDetailsFormProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: item.name,
    value: Number(item.value),
    baseId: item.base.id
  });
  const [bases, setBases] = useState<BaseAPISchema[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch available bases for the select
  useEffect(() => {
    const fetchBases = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bases`);
        const data = await response.json();
        setBases(data);
      } catch (error) {
        console.error("Error fetching bases:", error);
      }
    };

    fetchBases();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'value') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-service-items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar o item");
      }

      onSuccess();
    } catch (error) {
      console.error("Error updating item:", error);
      setError(error instanceof Error ? error.message : "Erro ao atualizar o item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Editar Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseId">Base</Label>
              <select
                id="baseId"
                name="baseId"
                value={formData.baseId}
                onChange={handleInputChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                required
              >
                <option value="">Selecione uma base</option>
                {bases.map((base) => (
                  <option key={base.id} value={base.id}>
                    {base.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
