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
import type { RepairOrderServiceItemAPISchema } from "@/types/api-schemas";

// Schema para validação do formulário
const formSchema = z.object({
  quantity: z.coerce.number().min(1, "Quantidade deve ser maior que 0"),
  itemId: z.string().min(1, "Item é obrigatório"),
  category: z.enum(["LABOR", "MATERIAL"]),
  type: z.enum(["PREVENTIVE", "CORRECTIVE"]),
  labor: z.string().optional(),
  duration: z.object({
    from: z.date(),
    to: z.date(),
  }),
  photo: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  repairOrderId: string;
  onSuccess: () => void;
}

export function ServiceAddDialog({ isOpen, onClose, repairOrderId, onSuccess }: ServiceAddDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<RepairOrderServiceItemAPISchema[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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

    if (isOpen) {
      fetchItems();
    }
  }, [isOpen]);

  // Configurar o formulário com os valores iniciais
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      itemId: "",
      category: "LABOR",
      type: "PREVENTIVE",
      labor: "",
      duration: {
        from: new Date(),
        to: new Date(),
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
      formData.append("repairOrderId", repairOrderId);
      formData.append("category", values.category);
      formData.append("type", values.type);
      formData.append("labor", values.labor || "");
      formData.append("duration", JSON.stringify({
        from: values.duration.from.toISOString(),
        to: values.duration.to.toISOString(),
      }));
      
      // Adicionar foto se existir
      if (values.photo instanceof File) {
        formData.append("photo", values.photo);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-services`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Falha ao adicionar serviço");
      }

      toast.success("Serviço adicionado com sucesso");
      form.reset();
      setPhotoPreview(null);
      onSuccess();
    } catch (error) {
      console.error("Erro ao adicionar serviço:", error);
      toast.error("Erro ao adicionar serviço");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Serviço</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do serviço a ser adicionado à ordem de reparo.
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um item" />
                        </SelectTrigger>
                        <SelectContent>
                          {items.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.value))}
                            </SelectItem>
                          ))}
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
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PREVENTIVE">Preventivo</SelectItem>
                          <SelectItem value="CORRECTIVE">Corretivo</SelectItem>
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
                name="photo"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Foto</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("service-photo-add")?.click()}
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Selecionar Foto
                          </Button>
                          <Input
                            id="service-photo-add"
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
                Adicionar Serviço
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
