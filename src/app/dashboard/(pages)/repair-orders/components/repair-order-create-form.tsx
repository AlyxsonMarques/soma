"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { BaseAPISchema, UserAPISchema } from "@/types/api-schemas";

// Schema para validação do formulário
const formSchema = z.object({
  gcaf: z.coerce.number().int().positive("GCAF deve ser um número positivo"),
  baseId: z.string().min(1, "Base é obrigatória"),
  userIds: z.array(z.string()).min(1, "Pelo menos um usuário é obrigatório"),
  plate: z.string().min(1, "Placa é obrigatória").max(7, "A placa deve ter no máximo 7 caracteres").transform(val => val.toUpperCase()),
  kilometers: z.coerce.number().min(0, "Kilometragem deve ser maior ou igual a 0"),
  status: z.enum(["PENDING", "REVISION", "APPROVED", "PARTIALLY_APPROVED", "INVOICE_APPROVED", "CANCELLED"]).default("PENDING"),
  observations: z.string().optional(),
  discount: z.coerce.number().min(0, "Desconto deve ser maior ou igual a 0").default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface RepairOrderCreateFormProps {
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

export function RepairOrderCreateForm({ onSuccess, onCancel }: RepairOrderCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bases, setBases] = useState<BaseAPISchema[]>([]);
  const [users, setUsers] = useState<UserAPISchema[]>([]);
  const [error, setError] = useState("");

  // Buscar bases e usuários para os selects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [basesResponse, usersResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bases`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`)
        ]);

        if (basesResponse.ok && usersResponse.ok) {
          const basesData = await basesResponse.json();
          const usersData = await usersResponse.json();
          setBases(basesData);
          setUsers(usersData);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Erro ao carregar bases e usuários");
      }
    };

    fetchData();
  }, []);

  // Configurar o formulário com os valores iniciais
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gcaf: 0,
      baseId: "",
      userIds: [],
      plate: "",
      kilometers: 0,
      status: "PENDING",
      observations: "",
      discount: 0,
    },
  });

  // Função para enviar o formulário
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao criar ordem de reparo");
      }

      const data = await response.json();
      toast.success("Ordem de reparo criada com sucesso");
      onSuccess(data.id);
    } catch (error) {
      console.error("Erro ao criar ordem:", error);
      setError(error instanceof Error ? error.message : "Erro ao criar ordem de reparo");
      toast.error("Erro ao criar ordem de reparo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <Card>
        <CardHeader>
          <CardTitle>Nova Guia de Reparo</CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gcaf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GCAF</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Digite o número GCAF" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="baseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a base" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bases.map((base) => (
                          <SelectItem key={base.id} value={base.id}>
                            {base.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa do Veículo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite a placa do veículo" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kilometers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilometragem</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Digite a kilometragem" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="REVISION">Revisão</SelectItem>
                        <SelectItem value="APPROVED">Aprovado Integralmente</SelectItem>
                        <SelectItem value="PARTIALLY_APPROVED">Aprovado Parcialmente</SelectItem>
                        <SelectItem value="INVOICE_APPROVED">Aprovado para Nota Fiscal</SelectItem>
                        <SelectItem value="CANCELLED">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desconto</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                          R$
                        </div>
                        <Input 
                          type="number" 
                          placeholder="Digite o valor do desconto" 
                          className="pl-8" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userIds"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Mecânicos Responsáveis</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={users.map(user => ({
                          label: user.name,
                          value: user.id
                        }))}
                        selected={Array.isArray(field.value) ? field.value : []}
                        onChange={field.onChange}
                        placeholder="Selecione os mecânicos responsáveis"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Digite observações sobre a ordem" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Guia de Reparo
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Form>
  );
}
