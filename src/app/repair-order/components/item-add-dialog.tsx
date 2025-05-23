"use client";

import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import type { BaseAPISchema } from "@/types/api-schemas";
import { cn } from "@/lib/utils";

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

// Componente modal personalizado que evita problemas de interação
function CustomModal({
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Garantir que o modal seja devidamente removido ao fechar
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
  
  // Impedir a propagação de eventos para o documento principal
  useEffect(() => {
    if (isOpen) {
      const handleWheel = (e: WheelEvent) => {
        if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
          e.preventDefault();
        }
      };
      
      window.addEventListener('wheel', handleWheel, { passive: false });
      return () => window.removeEventListener('wheel', handleWheel);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <>
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          ref={contentRef}
          className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export function ItemAddDialog({ isOpen, onClose, onSuccess }: ItemAddDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bases, setBases] = useState<BaseAPISchema[]>([]);
  
  // Referência para controlar o fechamento seguro do modal
  const modalClosingRef = useRef(false);

  // Configurar o formulário com os valores iniciais
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      value: 0,
      baseId: "",
    },
  });

  // Resetar o estado quando o modal é aberto/fechado
  useEffect(() => {
    if (!isOpen) {
      // Resetar o estado quando o modal é fechado
      setTimeout(() => {
        if (modalClosingRef.current) {
          modalClosingRef.current = false;
        }
      }, 200);
    } else {
      // Quando o modal é aberto, força o fechamento de qualquer seletor aberto
      // Usando um click fora para simular o fechamento de dropdowns
      const closeEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      document.dispatchEvent(closeEvent);
      
      // Resetar o formulário quando o modal é aberto
      form.reset();
    }
  }, [isOpen, form]);

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

  // Função para fechar o modal de forma segura
  const handleClose = () => {
    if (modalClosingRef.current) return;
    
    modalClosingRef.current = true;
    
    // Garantir que a interação com a página seja preservada
    document.body.style.pointerEvents = 'none';
    
    // Fechar o modal
    onClose();
    
    // Reativar interações após um breve delay
    setTimeout(() => {
      document.body.style.pointerEvents = 'auto';
    }, 150);
  };

  // Função para enviar o formulário
  const onSubmit = async (values: FormValues) => {
    if (modalClosingRef.current) return;
    
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
      handleClose();
    } catch (error) {
      console.error("Erro ao criar item:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao criar o item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Novo Item</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os dados para cadastrar um novo item.
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      R$ 
                    </div>
                    <Input 
                      type="number" 
                      placeholder="0,00" 
                      className="pl-10"
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cadastrar Item
            </Button>
          </div>
        </form>
      </Form>
    </CustomModal>
  );
}
