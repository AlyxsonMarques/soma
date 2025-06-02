"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BaseAPISchema } from "@/types/api-schemas";
import { Loader2 } from "lucide-react";

interface ItemCreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ItemFormData {
  name: string;
  value: number;
  baseId: string;
}

export function ItemCreateForm({ onSuccess, onCancel }: ItemCreateFormProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    value: 0,
    baseId: ''
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
        
        // Se houver bases disponíveis, selecionar a primeira por padrão
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, baseId: data[0].id }));
        }
      } catch (error) {
        console.error("Error fetching bases:", error);
      }
    };

    fetchBases();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'value') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBaseChange = (value: string) => {
    setFormData(prev => ({ ...prev, baseId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-service-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        // Se a resposta não for ok, tentar extrair a mensagem de erro
        let errorMessage = `Erro ao criar o item (${response.status})`;
        
        // Clonar a resposta para poder ler o corpo
        const responseClone = response.clone();
        
        try {
          // Tentar ler como texto primeiro
          const text = await responseClone.text();
          
          if (text && text.trim()) {
            // Se tiver texto, tentar parsear como JSON
            try {
              const errorData = JSON.parse(text);
              errorMessage = errorData.message || errorData.error || errorData.msg || errorMessage;
            } catch (jsonError) {
              // Se não for JSON válido, usar o texto como mensagem de erro
              console.warn("Resposta não é um JSON válido:", text);
              if (text.length < 100) errorMessage = text; // Usar o texto como mensagem se for curto
            }
          }
        } catch (parseError) {
          console.error("Erro ao processar resposta:", parseError);
        }
        
        throw new Error(errorMessage);
      }

      // Se chegou aqui, a operação foi bem-sucedida
      onSuccess();
    } catch (error) {
      console.error("Error creating item:", error);
      setError(error instanceof Error ? error.message : "Erro ao criar o item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Novo Item</CardTitle>
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
              <Select
                value={formData.baseId}
                onValueChange={handleBaseChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma base" />
                </SelectTrigger>
                <SelectContent>
                  {bases.map((base) => (
                    <SelectItem key={base.id} value={base.id}>
                      {base.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                Criando...
              </>
            ) : (
              "Criar Item"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
