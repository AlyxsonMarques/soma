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
import { DatePickerWithRange } from "@/components/ui/date-picker-range";
import { Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import type { RepairOrderServiceAPISchema, RepairOrderServiceItemAPISchema } from "@/types/api-schemas";

// Schema para validação do formulário
const formSchema = z.object({
  quantity: z.coerce.number().min(1, "Quantidade deve ser maior que 0"),
  itemId: z.string().min(1, "Item é obrigatório"),
  category: z.enum(["LABOR", "PART", "SERVICE"]),
  type: z.enum(["PREVENTIVE", "CORRECTIVE", "PREDICTIVE"]),
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

    fetchItems();
  }, []);

  // Configurar o formulário com os valores iniciais
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: service.quantity || 1,
      itemId: service.item?.id || "",
      category: service.category as "LABOR" | "PART" | "SERVICE",
      type: service.type as "PREVENTIVE" | "CORRECTIVE" | "PREDICTIVE",
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
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("quantity", values.quantity.toString());
      formData.append("itemId", values.itemId);
      formData.append("category", values.category);
      formData.append("type", values.type);
      formData.append("labor", values.labor || "");
      formData.append("value", values.value.toString());
      formData.append("discount", values.discount.toString());
      formData.append("duration", JSON.stringify({
        from: values.duration.from.toISOString(),
        to: values.duration.to.toISOString(),
      }));
      
      // Adicionar foto - obrigatória
      if (values.photo instanceof File) {
        formData.append("photo", values.photo);
      } else if (service.photo) {
        // Se não foi alterada, mantém a foto atual
        formData.append("keepExistingPhoto", "true");
      } else {
        throw new Error("Foto é obrigatória");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-services/${service.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar serviço");
      }

      toast.success("Serviço atualizado com sucesso");
      onSuccess();
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      toast.error("Erro ao atualizar serviço");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Serviço</DialogTitle>
          <DialogDescription>
            Atualize as informações do serviço
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um item" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LABOR">Mão de Obra</SelectItem>
                        <SelectItem value="PART">Peça</SelectItem>
                        <SelectItem value="SERVICE">Serviço</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PREVENTIVE">Preventivo</SelectItem>
                        <SelectItem value="CORRECTIVE">Corretivo</SelectItem>
                        <SelectItem value="PREDICTIVE">Preditivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="labor"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Mão de Obra</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição da mão de obra" {...field} value={field.value || ""} />
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
                    <FormLabel>Período</FormLabel>
                    <FormControl>
                      <DatePickerWithRange
                        date={{
                          from: field.value.from,
                          to: field.value.to,
                        }}
                        setDate={(range) => {
                          field.onChange({
                            from: range.from || new Date(),
                            to: range.to || new Date(),
                          });
                        }}
                      />
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
                      <Input type="number" placeholder="0,00" {...field} />
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
                      <Input type="number" placeholder="0,00" {...field} />
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
              <Button type="button" variant="outline" onClick={onClose}>
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
  );
}
