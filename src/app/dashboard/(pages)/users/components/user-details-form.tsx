"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserAPISchema } from "@/types/api-schemas";
import { Loader2 } from "lucide-react";

interface UserDetailsFormProps {
  user: UserAPISchema;
  onSuccess: () => void;
  onCancel: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  cpf: string;
  type: string;
  birthDate: string;
  assistant: boolean;
  password?: string;
}

export function UserDetailsForm({ user, onSuccess, onCancel }: UserDetailsFormProps) {
  // Convert birthDate to format expected by date input (YYYY-MM-DD)
  const birthDateStr = user.birthDate instanceof Date 
    ? user.birthDate.toISOString().split('T')[0] 
    : new Date(user.birthDate).toISOString().split('T')[0];

  const [formData, setFormData] = useState<UserFormData>({
    name: user.name,
    email: user.email,
    cpf: user.cpf,
    type: user.type,
    birthDate: birthDateStr,
    assistant: user.assistant,
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = e.target.checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Create a copy of formData to send to the API
    const dataToSend: Record<string, any> = { ...formData };
    
    // Remove the password if it's empty
    if (dataToSend.password === '') {
      delete dataToSend.password;
    }

    try {
      // Usar try/catch para capturar erros de rede
      let response;
      try {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${user.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dataToSend)
        });
      } catch (networkError) {
        console.error("Erro de rede ao atualizar usuário:", networkError);
        throw new Error("Erro de conexão. Verifique sua internet e tente novamente.");
      }

      if (!response.ok) {
        // Se a resposta não for ok, tentar extrair a mensagem de erro
        let errorMessage = `Erro ao atualizar o usuário (${response.status})`;
        
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
      console.error("Error updating user:", error);
      setError(error instanceof Error ? error.message : "Erro ao atualizar o usuário");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Editar Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Usuário</Label>
              <Select
                value={formData.type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MECHANIC">Mecânico</SelectItem>
                  <SelectItem value="BUDGETIST">Orçamentista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                required
              />
            </div>

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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 pt-4">
                <Checkbox
                  id="assistant"
                  name="assistant"
                  checked={formData.assistant}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, assistant: checked === true }))
                  }
                />
                <Label htmlFor="assistant">Assistente</Label>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Deixe em branco para manter a senha atual"
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
