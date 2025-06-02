"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface UserCreateFormProps {
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
  password: string;
}

export function UserCreateForm({ onSuccess, onCancel }: UserCreateFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    cpf: '',
    type: 'MECHANIC', // Valor padrão
    birthDate: new Date().toISOString().split('T')[0],
    assistant: false,
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

    try {
      // Usar try/catch para capturar erros de rede
      let response;
      try {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });
      } catch (networkError) {
        console.error("Erro de rede ao criar usuário:", networkError);
        throw new Error("Erro de conexão. Verifique sua internet e tente novamente.");
      }

      if (!response.ok) {
        // Se a resposta não for ok, tentar extrair a mensagem de erro
        let errorMessage = `Erro ao criar o usuário (${response.status})`;
        
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
      console.error("Error creating user:", error);
      setError(error instanceof Error ? error.message : "Erro ao criar o usuário");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Novo Usuário</CardTitle>
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
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
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
                Criando...
              </>
            ) : (
              "Criar Usuário"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
