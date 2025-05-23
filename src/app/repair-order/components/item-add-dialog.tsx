"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { BaseAPISchema } from "@/types/api-schemas";

// Schema para validação do formulário
const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  value: z.coerce.number().min(0, "Valor deve ser maior ou igual a 0"),
  baseId: z.string().min(1, "Base é obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

interface ItemAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newItem: { id: string; name: string }) => void;
}

export function ItemAddDialog({ isOpen, onClose, onSuccess }: ItemAddDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bases, setBases] = useState<BaseAPISchema[]>([]);

  // Buscar bases disponíveis
  useEffect(() => {
    const fetchBases = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bases`);
        if (response.ok) {
          const data = await response.json();
          setBases(data);
        }
      } catch (error) {
        console.error("Erro ao buscar bases:", error);
        toast.error("Erro ao carregar bases");
      }
    };

    if (isOpen) {
      fetchBases();
    }
  }, [isOpen]);

  // Configurar o formulário com os valores iniciais
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      value: 0,
      baseId: "",
    },
  });

  // Função para enviar o formulário
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-service-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar o item");
      }

      const newItem = await response.json();
      toast.success("Item criado com sucesso!");
      onSuccess(newItem);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Erro ao criar item:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao criar o item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Item</DialogTitle>
          <DialogDescription>
            Preencha os dados para cadastrar um novo item.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Item</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Troca de óleo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Item</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="0,00" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                        R$
                      </div>
                      <div className="pl-8">
                        {/* This div adds padding to push the input text after the R$ prefix */}
                      </div>
                    </div>
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma base" />
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cadastrar Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
