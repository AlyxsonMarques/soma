"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { baseIdSchema } from "@/types/base";
import { repairOrderKilometersSchema, repairOrderPlateSchema } from "@/types/repair-order";
import {
  repairOrderServiceCategorySchema,
  repairOrderServiceDurationSchema,
  repairOrderServiceLaborSchema,
  repairOrderServicePhotoSchema,
  repairOrderServiceQuantitySchema,
  repairOrderServiceTypeSchema,
} from "@/types/repair-order-service";

import { repairOrderServiceItemIdSchema } from "@/types/repair-order-service-item";

import { DatePickerWithRange } from "@/components/ui/date-picker-range";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Base, RepairOrderServiceItem } from "@prisma/client";
import { Camera, Trash2, Search, FileText, Calendar, Car } from "lucide-react";
import { RepairOrderDetailsDialog } from "./components/repair-order-details-dialog";
import { useEffect } from "react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { ItemAddDialog } from "./components/item-add-dialog";

const formServiceSchema = z.object({
  quantity: repairOrderServiceQuantitySchema,
  item: repairOrderServiceItemIdSchema,
  category: repairOrderServiceCategorySchema,
  type: repairOrderServiceTypeSchema,
  labor: repairOrderServiceLaborSchema,
  duration: repairOrderServiceDurationSchema,
  photo: repairOrderServicePhotoSchema,
});

const formSchema = z.object({
  plate: repairOrderPlateSchema,
  kilometers: repairOrderKilometersSchema,
  base: baseIdSchema,
  services: z.array(formServiceSchema),
});

// Interface para os resultados da pesquisa de GRs por placa
interface RepairOrderSearchResult {
  id: string;
  gcaf: string;
  plate: string;
  kilometers: number;
  status: string;
  base: {
    id: string;
    name: string;
  };
  createdAt: string;
  services: {
    id: string;
    labor: string;
    category: string;
    type: string;
  }[];
}

export default function GuiaDeRemessa() {
  const [bases, setBases] = useState<Base[]>([]);
  const [repairOrderServiceItems, setRepairOrderServiceItems] = useState<RepairOrderServiceItem[]>([]);
  
  // Estados para a funcionalidade de pesquisa
  const [searchPlate, setSearchPlate] = useState("");
  const [searchResults, setSearchResults] = useState<RepairOrderSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Estados para o histórico de GRs
  const [historyOrders, setHistoryOrders] = useState<RepairOrderSearchResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Estado para controlar o diálogo de adicionar item
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [currentServiceIndex, setCurrentServiceIndex] = useState<number | null>(null);
  useEffect(() => {
    const fetchBases = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bases`);
      const data: Base[] = await res.json();
      setBases(data);
    };

    fetchBases();
    fetchRepairOrderHistory();
  }, []);
  
  // Função para buscar o histórico de GRs
  const fetchRepairOrderHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-orders`);
      
      if (!res.ok) {
        throw new Error("Falha ao buscar histórico de ordens de reparo");
      }
      
      const data = await res.json();
      setHistoryOrders(data);
    } catch (error) {
      console.error("Erro ao buscar histórico de ordens de reparo:", error);
      toast.error("Erro ao carregar o histórico. Tente novamente.");
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  // Função para pesquisar GRs por placa
  const searchRepairOrdersByPlate = async () => {
    if (!searchPlate.trim()) {
      toast.error("Por favor, informe uma placa para pesquisar");
      return;
    }
    
    setIsSearching(true);
    setSearchPerformed(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-orders?plate=${searchPlate.trim()}`);
      
      if (!res.ok) {
        throw new Error("Falha ao buscar ordens de reparo");
      }
      
      const data = await res.json();
      setSearchResults(data);
      
      if (data.length === 0) {
        toast.info("Nenhuma ordem de reparo encontrada para esta placa");
      }
    } catch (error) {
      console.error("Erro ao buscar ordens de reparo:", error);
      toast.error("Erro ao buscar ordens de reparo. Tente novamente.");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-service-items`);
      const data: RepairOrderServiceItem[] = await res.json();
      setRepairOrderServiceItems(data);
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
          quantity: 0,
          item: "",
          category: "LABOR",
          type: "PREVENTIVE",
          labor: "",
          duration: {
            from: new Date(),
            to: new Date(),
          },
          photo: undefined,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();

    formData.append("plate", values.plate);
    formData.append("kilometers", values.kilometers.toString());
    formData.append("base", values.base);

    const servicesWithoutPhotos = values.services.map((service) => ({
      quantity: service.quantity,
      item: service.item,
      category: service.category,
      type: service.type,
      labor: service.labor,
      duration: {
        from: service.duration.from.toISOString(),
        to: service.duration.to.toISOString(),
      },
    }));
    formData.append("services", JSON.stringify(servicesWithoutPhotos));

    // Append each photo with its index to match the backend processing
    values.services.forEach((service, index) => {
      if (service.photo instanceof File) {
        formData.append(`photos[${index}]`, service.photo);
        console.log(`Appending photo for service ${index}: ${service.photo.name}`);
      }
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-orders`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.error) {
      toast.error(data.message);
    } else {
      toast.success(data.message);
      // Atualiza o histórico após criar uma nova GR
      fetchRepairOrderHistory();
    }

    form.reset();
    remove();
    append({
      quantity: 0,
      item: "",
      category: "LABOR",
      type: "PREVENTIVE",
      labor: "",
      duration: {
        from: new Date(),
        to: new Date(),
      },
      photo: undefined,
    });
  }

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  // Função para formatar o status da GR
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      "PENDING": "Pendente",
      "REVISION": "Revisão",
      "APPROVED": "Aprovado Integralmente",
      "PARTIALLY_APPROVED": "Parcialmente Aprovado",
      "INVOICE_APPROVED": "Aprovado para Nota Fiscal",
      "CANCELLED": "Cancelado"
    };
    
    return statusMap[status] || status;
  };

  return (
    <div className="dark min-h-screen">
      <div className="bg-background text-foreground min-h-screen">
        <div className="container mx-auto p-4 md:p-6 max-w-4xl">
          <h1 className="text-2xl font-bold mb-6 text-center md:text-left">Guia de Remessa</h1>
          
          <Tabs defaultValue="new" className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new">Nova Guia</TabsTrigger>
              <TabsTrigger value="search">Pesquisar Guias</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pesquisar Guias de Remessa por Placa</CardTitle>
                  <CardDescription>Informe a placa do veículo para visualizar todas as guias associadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                      <Input 
                        placeholder="Digite a placa (ex: ABC1234)" 
                        value={searchPlate.toUpperCase()} 
                        onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                        className="w-full"
                      />
                    </div>
                    <Button 
                      onClick={searchRepairOrdersByPlate} 
                      disabled={isSearching}
                      className="whitespace-nowrap"
                    >
                      {isSearching ? "Pesquisando..." : "Pesquisar"}
                      {!isSearching && <Search className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {searchPerformed && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">
                        {searchResults.length > 0 
                          ? `Resultados para a placa ${searchPlate} (${searchResults.length})` 
                          : `Nenhum resultado encontrado para a placa ${searchPlate}`}
                      </h3>
                      
                      {searchResults.length > 0 && (
                        <div className="space-y-4">
                          {searchResults.map((result) => (
                            <Card key={result.id} className="overflow-hidden">
                              <CardHeader className="bg-muted/50 py-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      <CardTitle className="text-base">GCAF: {result.gcaf}</CardTitle>
                                    </div>
                                    <CardDescription className="flex items-center gap-1 mt-1">
                                      <Car className="h-3 w-3" />
                                      <span>Placa: {result.plate.toUpperCase()} | {result.kilometers} km</span>
                                    </CardDescription>
                                  </div>
                                  <div className="flex flex-col sm:items-end gap-1">
                                    <div className="text-sm font-medium">{getStatusLabel(result.status)}</div>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {formatDate(result.createdAt)}
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="py-3">
                                <div>
                                  <div className="text-sm font-medium mb-2">Base: {result.base.name}</div>
                                  <div className="text-sm font-medium">Serviços:</div>
                                  <ul className="mt-1 space-y-1">
                                    {result.services.map((service) => (
                                      <li key={service.id} className="text-sm">
                                        • {service.labor || "Serviço sem descrição"} ({service.category === "LABOR" ? "Mão de obra" : "Material"})
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="mt-3">
                                  <RepairOrderDetailsDialog repairOrder={result} />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Guias de Remessa</CardTitle>
                  <CardDescription>Visualize todas as guias de remessa criadas</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingHistory ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : historyOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhuma ordem de reparo encontrada no histórico</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {historyOrders.map((order) => (
                        <Card key={order.id} className="overflow-hidden">
                          <CardHeader className="bg-muted/50 py-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <CardTitle className="text-base">GCAF: {order.gcaf}</CardTitle>
                                </div>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                  <Car className="h-3 w-3" />
                                  <span>Placa: {order.plate.toUpperCase()} | {order.kilometers} km</span>
                                </CardDescription>
                              </div>
                              <div className="flex flex-col sm:items-end gap-1">
                                <div className="text-sm font-medium">{getStatusLabel(order.status)}</div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(order.createdAt)}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="py-3">
                            <div>
                              <div className="text-sm font-medium mb-2">Base: {order.base.name}</div>
                              <div className="text-sm font-medium">Serviços:</div>
                              <ul className="mt-1 space-y-1">
                                {order.services.map((service) => (
                                  <li key={service.id} className="text-sm">
                                    • {service.labor || "Serviço sem descrição"} ({service.category === "LABOR" ? "Mão de obra" : "Material"})
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="mt-3">
                              <RepairOrderDetailsDialog repairOrder={order} />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="new">
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
                        <Input 
                          placeholder="RIO2A18 / ABC-1234" 
                          {...field} 
                          value={field.value.toUpperCase()}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
                                    <Select onValueChange={field.onChange} {...field}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione o item" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {repairOrderServiceItems.map((item) => (
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
                                              setCurrentServiceIndex(index);
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
                          </TableCell>
                          <TableCell className="p-2 md:p-4">
                            <FormField
                              control={form.control}
                              name={`services.${index}.category`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} {...field}>
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
                                  <FormMessage />
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
                                  <Select onValueChange={field.onChange} {...field}>
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
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2 md:p-4 min-w-[200px]">
                            <FormField
                              control={form.control}
                              name={`services.${index}.labor`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input {...field} placeholder="Ex: Troca de óleo" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2 md:p-4 min-w-[200px]">
                            <FormField
                              control={form.control}
                              name={`services.${index}.duration`}
                              render={({ field }) => {
                                return (
                                  <FormItem>
                                    <FormControl>
                                      <DatePickerWithRange field={field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
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
                                        className="min-w-8 min-h-8"
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
                                  <FormMessage />
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
                      quantity: 0,
                      item: "",
                      category: "LABOR",
                      type: "PREVENTIVE",
                      labor: "",
                      duration: {
                        from: new Date(),
                        to: new Date(),
                      },
                      photo: null as unknown as File,
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
          
          {/* Diálogo para adicionar novo item */}
          {isAddItemDialogOpen && (
            <ItemAddDialog
              isOpen={isAddItemDialogOpen}
              onClose={() => setIsAddItemDialogOpen(false)}
              onSuccess={(newItem) => {
                // Adicionar o novo item à lista de itens
                setRepairOrderServiceItems(prev => [...prev, newItem as any]);
                
                // Se temos um índice de serviço selecionado, atualizar o valor do item para esse serviço
                if (currentServiceIndex !== null) {
                  form.setValue(`services.${currentServiceIndex}.item`, newItem.id);
                  setCurrentServiceIndex(null);
                }
                
                toast.success(`Item "${newItem.name}" adicionado com sucesso!`);
              }}
            />
          )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
