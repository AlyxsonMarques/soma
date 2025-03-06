"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { baseIdSchema } from "@/types/base";
import { repairOrderKilometersSchema, repairOrderPlateSchema } from "@/types/repair-order";
import {
  repairOrderServiceCategorySchema,
  repairOrderServiceDurationSchema,
  repairOrderServiceIdSchema,
  repairOrderServiceItemSchema,
  repairOrderServiceLaborSchema,
  repairOrderServiceQuantitySchema,
  repairOrderServiceTypeSchema,
} from "@/types/repair-order-service";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Base, RepairOrderItem } from "@prisma/client";
import { Camera, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

const formServiceSchema = z.object({
  id: repairOrderServiceIdSchema,
  quantity: repairOrderServiceQuantitySchema,
  item: repairOrderServiceItemSchema,
  category: repairOrderServiceCategorySchema,
  type: repairOrderServiceTypeSchema,
  labor: repairOrderServiceLaborSchema,
  duration: repairOrderServiceDurationSchema,
  photo: z.instanceof(File),
});

const formSchema = z.object({
  plate: repairOrderPlateSchema,
  kilometers: repairOrderKilometersSchema,
  base: baseIdSchema,
  services: z.array(formServiceSchema),
});

export default function GuiaDeRemessa() {
  const [bases, setBases] = useState<Base[]>([]);
  const [repairOrderItems, setRepairOrderItems] = useState<RepairOrderItem[]>([]);
  useEffect(() => {
    const fetchBases = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bases`);
      const data: Base[] = await res.json();
      setBases(data);
    };

    fetchBases();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/items`);
      const data: RepairOrderItem[] = await res.json();
      setRepairOrderItems(data);
    };

    fetchItems();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plate: "",
      kilometers: 0,
      base: "",
      services: [
        {
          quantity: 1,
          item: {
            id: 1,
          },
          category: "LABOR",
          type: "PREVENTIVE",
          labor: "",
          duration: 0,
          photo: undefined,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services",
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="dark min-h-screen">
      <div className="bg-background text-foreground min-h-screen">
        <div className="container mx-auto p-4 md:p-6 max-w-4xl">
          <h1 className="text-2xl font-bold mb-6 text-center md:text-left">Guia de Remessa</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa</FormLabel>
                      <FormControl>
                        <Input placeholder="RIO2A18 / ABC-1234" {...field} />
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
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="base"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma base" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bases.map((base) => {
                            return (
                              <SelectItem key={base.id} value={base.id}>
                                {base.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Serviços</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="p-2 md:p-4">Quantidade</TableHead>
                        <TableHead className="p-2 md:p-4">Item</TableHead>
                        <TableHead className="p-2 md:p-4">Categoria</TableHead>
                        <TableHead className="p-2 md:p-4">Tipo</TableHead>
                        <TableHead className="p-2 md:p-4">Mão de Obra</TableHead>
                        <TableHead className="p-2 md:p-4">Tempo que levou</TableHead>
                        <TableHead className="p-2 md:p-4">Foto</TableHead>
                        <TableHead className="p-2 md:p-4" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell className="p-2 md:p-4">
                            <FormField
                              control={form.control}
                              name={`services.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
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
                          </TableCell>
                          <TableCell className="p-2 md:p-4">
                            <FormField
                              control={form.control}
                              name={`services.${index}.item`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Select onValueChange={field.onChange}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione o item" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {repairOrderItems.map((item) => (
                                          <SelectItem key={item.id} value={item.id}>
                                            {item.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2 md:p-4">
                            <FormField
                              control={form.control}
                              name={`services.${index}.category`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Select onValueChange={field.onChange}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione a categoria" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="LABOR">Mão de Obra</SelectItem>
                                        <SelectItem value="MATERIAL">Material</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2 md:p-4">
                            <FormField
                              control={form.control}
                              name={`services.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select onValueChange={field.onChange}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="PREVENTIVE">Preventivo</SelectItem>
                                      <SelectItem value="CORRECTIVE">Corretivo</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2 md:p-4">
                            <FormField
                              control={form.control}
                              name={`services.${index}.labor`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input {...field} placeholder="Ex: Troca de óleo" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2 md:p-4">
                            <FormField
                              control={form.control}
                              name={`services.${index}.duration`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input {...field} placeholder="HH:MM" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2 md:p-4">
                            <FormField
                              control={form.control}
                              name={`services.${index}.photo`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => document.getElementById(`foto-${index}`)?.click()}
                                      >
                                        <Camera className="h-4 w-4" />
                                      </Button>
                                      <Input
                                        id={`foto-${index}`}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            field.onChange(file);
                                            // Create a preview URL for the selected image
                                            const reader = new FileReader();
                                            reader.onload = (e) => {
                                              const previewElement = document.getElementById(
                                                `preview-${index}`,
                                              ) as HTMLImageElement;
                                              if (previewElement && e.target) {
                                                previewElement.src = e.target.result as string;
                                              }
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                        className="hidden"
                                      />
                                      {field.value instanceof File && (
                                        <img
                                          id={`preview-${index}`}
                                          src="/placeholder.svg"
                                          alt="Preview"
                                          className="w-10 h-10 rounded-full object-cover"
                                        />
                                      )}
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2 md:p-4">
                            <Button type="button" variant="ghost" onClick={() => remove(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full sm:w-auto"
                  onClick={() =>
                    append({
                      quantity: 1,
                      item: { id: 1 },
                      category: "LABOR",
                      type: "PREVENTIVE",
                      labor: "",
                      duration: 0,
                      photo: null,
                    })
                  }
                >
                  Adicionar Serviço
                </Button>
              </div>

              <Button type="submit" className="w-full sm:w-auto">
                Enviar
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
