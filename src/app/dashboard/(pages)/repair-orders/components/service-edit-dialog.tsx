"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker-range";
import { Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import type { BaseAPISchema, RepairOrderServiceAPISchema, RepairOrderServiceItemAPISchema } from "@/types/api-schemas";

// Schema para validação do formulário
const formSchema = z.object({
  quantity: z.coerce.number().min(1, "Quantidade deve ser maior que 0"),
  itemId: z.string().min(1, "Item é obrigatório"),
  category: z.enum(["LABOR", "MATERIAL"]),
  type: z.enum(["PREVENTIVE", "CORRECTIVE", "HELP"]),
  status: z.enum(["PENDING", "APPROVED", "CANCELLED"]),
  labor: z.string().optional(),
  value: z.coerce.number().min(0, "Valor deve ser maior ou igual a 0"),
  discount: z.coerce.number().min(0, "Desconto deve ser maior ou igual a 0"),
  duration: z.object({
    from: z.date(),
    to: z.date(),
  }),
  photo: z.any().refine(val => val instanceof File || val === undefined || val === null, {
    message: "Foto é obrigatória",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: RepairOrderServiceAPISchema;
  repairOrderId: string;
  onSuccess: () => void;
}

export function ServiceEditDialog({ isOpen, onClose, service, repairOrderId, onSuccess }: ServiceEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<RepairOrderServiceItemAPISchema[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(service.photo || null);
  
  // Estados para o diálogo de adicionar item
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [bases, setBases] = useState<BaseAPISchema[]>([]);

  // Buscar itens para o select
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-service-items`);
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      } catch (error) {
        console.error("Erro ao buscar itens:", error);
        toast.error("Erro ao carregar itens");
      }
    };

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

    fetchItems();
    fetchBases();
  }, [isAddItemDialogOpen]);

  // Configurar o formulário com os valores iniciais
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: service.quantity || 1,
      itemId: service.item?.id || "",
      category: service.category as "LABOR" | "MATERIAL",
      type: service.type as "PREVENTIVE" | "CORRECTIVE" | "HELP",
      status: service.status || "PENDING",
      labor: service.labor || "",
      value: service.value ? Number(service.value) : 0,
      discount: service.discount ? Number(service.discount) : 0,
      duration: {
        from: service.duration?.from ? new Date(service.duration.from) : new Date(),
        to: service.duration?.to ? new Date(service.duration.to) : new Date(),
      },
      photo: undefined,
    },
  });

  // Função para enviar o formulário
  const onSubmit = async (values: FormValues) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Criar FormData para enviar multipart/form-data (necessário para a imagem)
      const formData = new FormData();
      
      formData.append("quantity", values.quantity.toString());
      formData.append("itemId", values.itemId);
      formData.append("category", values.category);
      formData.append("type", values.type);
      formData.append("status", values.status);
      formData.append("labor", values.labor || "");
      formData.append("value", values.value.toString());
      formData.append("discount", values.discount.toString());
      formData.append("duration", JSON.stringify({
        from: values.duration.from.toISOString(),
        to: values.duration.to.toISOString(),
      }));
      
      // Adicionar foto se foi selecionada
      if (values.photo instanceof File) {
        formData.append("photo", values.photo);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-services/${service.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Erro ao atualizar o serviço";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Erro ao processar resposta:", parseError);
        }
        throw new Error(errorMessage);
      }

      toast.success("Serviço atualizado com sucesso!");
      
      // Notificar o sucesso e fechar o diálogo
      onSuccess();
      onClose(); // Fechar explicitamente o diálogo após o sucesso
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar o serviço");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          // Garante que o diálogo só pode ser fechado se não estiver em submissão
          if (!open) {
            if (isSubmitting) {
              // Se estiver em submissão, não permite fechar
              return;
            }
            // Resetar o formulário para evitar estado inconsistente
            form.reset();
            // Notificar o componente pai para fechar o diálogo
            onClose();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
            <DialogDescription>
              Modifique os detalhes do serviço conforme necessário.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="itemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um item" />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                            <div className="px-2 py-2 border-t">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                className="w-full justify-start text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // Abrir o diálogo sem setTimeout para evitar problemas de interação
                                  setIsAddItemDialogOpen(true);
                                }}
                              >
                                + Cadastrar novo item
                              </Button>
                            </div>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LABOR">Mão de Obra</SelectItem>
                            <SelectItem value="MATERIAL">Material</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PREVENTIVE">Preventivo</SelectItem>
                            <SelectItem value="CORRECTIVE">Corretivo</SelectItem>
                            <SelectItem value="HELP">Ajuda</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pendente</SelectItem>
                            <SelectItem value="APPROVED">Aprovado Integralmente</SelectItem>
                            <SelectItem value="CANCELLED">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="labor"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Descrição da Mão de Obra</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Troca de óleo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Duração</FormLabel>
                      <FormControl>
                        <DatePickerWithRange field={field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Valor do Serviço</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                            R$
                          </div>
                          <Input type="number" placeholder="0,00" {...field} className="pl-8" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Desconto do Serviço</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                            R$
                          </div>
                          <Input type="number" placeholder="0,00" {...field} className="pl-8" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Foto <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("service-photo")?.click()}
                            >
                              <Camera className="mr-2 h-4 w-4" />
                              Selecionar Foto
                            </Button>
                            <Input
                              id="service-photo"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  onChange(file);
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    if (e.target?.result) {
                                      setPhotoPreview(e.target.result as string);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              {...field}
                            />
                          </div>
                          {photoPreview && (
                            <div className="relative h-48 w-full overflow-hidden rounded-md">
                              <Image
                                src={photoPreview}
                                alt="Prévia da foto"
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    // Garantir que o diálogo seja fechado mesmo se estiver em estado de submissão
                    form.reset(); // Resetar o formulário para evitar estado inconsistente
                    onClose();
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para adicionar novo item */}
      {isAddItemDialogOpen && (
        <Dialog 
          open={isAddItemDialogOpen} 
          onOpenChange={(open) => {
            // Garante que o diálogo seja fechado corretamente
            if (!open) {
              // Fecha o diálogo diretamente
              setIsAddItemDialogOpen(false);
            }
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Item</DialogTitle>
              <DialogDescription>
                Preencha os dados para cadastrar um novo item.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-item-name">Nome do Item</Label>
                <Input id="new-item-name" placeholder="Ex: Troca de óleo" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-item-value">Valor do Item</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    R$
                  </div>
                  <Input 
                    id="new-item-value" 
                    type="number" 
                    placeholder="0,00" 
                    className="pl-8" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-item-base">Base</Label>
                <Select>
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
            
            <DialogFooter className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  // Fecha o diálogo diretamente
                  setIsAddItemDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                onClick={async () => {
                  const nameInput = document.getElementById('new-item-name') as HTMLInputElement;
                  const valueInput = document.getElementById('new-item-value') as HTMLInputElement;
                  const baseSelect = document.querySelector('[data-value]') as HTMLElement;
                  
                  if (!nameInput?.value) {
                    toast.error("Nome do item é obrigatório");
                    return;
                  }
                  
                  if (!baseSelect?.getAttribute('data-value')) {
                    toast.error("Selecione uma base");
                    return;
                  }
                  
                  try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-service-items`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        name: nameInput.value,
                        value: parseFloat(valueInput.value) || 0,
                        baseId: baseSelect.getAttribute('data-value')
                      })
                    });
                    
                    if (!response.ok) {
                      throw new Error("Erro ao criar o item");
                    }
                    
                    const newItem = await response.json();
                    // Atualiza a lista de itens e seleciona o novo item
                    setItems(prev => [...prev, newItem]);
                    form.setValue('itemId', newItem.id);
                    toast.success(`Item "${newItem.name}" adicionado com sucesso!`);
                    
                    // Fecha o diálogo diretamente
                    setIsAddItemDialogOpen(false);
                  } catch (error) {
                    console.error("Erro ao criar item:", error);
                    toast.error("Erro ao criar o item. Tente novamente.");
                  }
                }}
              >
                Cadastrar Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
