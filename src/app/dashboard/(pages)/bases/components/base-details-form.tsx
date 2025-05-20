"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { BaseAPISchema, BaseAddressAPISchema } from "@/types/api-schemas";
import { Loader2 } from "lucide-react";

interface BaseDetailsFormProps {
  base: BaseAPISchema;
  onSuccess: () => void;
  onCancel: () => void;
}

interface AddressFormData {
  street: string;
  number: number;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface BaseFormData {
  name: string;
  phone: string;
  address: AddressFormData;
}

export function BaseDetailsForm({ base, onSuccess, onCancel }: BaseDetailsFormProps) {
  const [formData, setFormData] = useState<BaseFormData>({
    name: base.name,
    phone: base.phone || "",
    address: base.address ? {
      street: base.address.street,
      number: base.address.number,
      complement: base.address.complement || "",
      neighborhood: base.address.neighborhood,
      city: base.address.city,
      state: base.address.state,
      zipCode: base.address.zipCode
    } : {
      street: "",
      number: 0,
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: ""
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: addressField === 'number' ? parseInt(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bases/${base.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar a base");
      }

      onSuccess();
    } catch (error) {
      console.error("Error updating base:", error);
      setError(error instanceof Error ? error.message : "Erro ao atualizar a base");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Editar Base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <h3 className="text-lg font-medium mb-4">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="address.street">Rua</Label>
              <Input
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="address.number">Número</Label>
              <Input
                id="address.number"
                name="address.number"
                type="number"
                value={formData.address.number}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address.complement">Complemento</Label>
              <Input
                id="address.complement"
                name="address.complement"
                value={formData.address.complement || ""}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address.neighborhood">Bairro</Label>
              <Input
                id="address.neighborhood"
                name="address.neighborhood"
                value={formData.address.neighborhood}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address.city">Cidade</Label>
              <Input
                id="address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address.state">Estado</Label>
              <Input
                id="address.state"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                required
                maxLength={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address.zipCode">CEP</Label>
              <Input
                id="address.zipCode"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
                required
                maxLength={8}
              />
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
