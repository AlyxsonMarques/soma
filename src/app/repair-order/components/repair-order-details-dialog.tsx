import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Removed formatImageUrl import as we'll use base64 directly
import { Calendar, Car, FileText, MapPin, Wrench } from "lucide-react";
import { useState } from "react";

// Interface para os dados da ordem de reparo
interface RepairOrderDetailsProps {
  repairOrder: {
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
    observation?: string;
    users: {
      id: string;
      name: string;
    }[];
    services: {
      id: string;
      labor: string;
      category: string;
      type: string;
      quantity: number;

      photo?: string;
      item: {
        id: string;
        name: string;
      };
    }[];
  };
}

export function RepairOrderDetailsDialog({ repairOrder }: RepairOrderDetailsProps) {
  const [open, setOpen] = useState(false);

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

  // Função para formatar a categoria do serviço
  const getCategoryLabel = (category: string) => {
    return category === "LABOR" ? "Mão de obra" : "Material";
  };

  // Função para formatar o tipo do serviço
  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      "PREVENTIVE": "Preventivo",
      "CORRECTIVE": "Corretivo",
      "HELP": "Socorro"
    };
    return typeMap[type] || type;
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Ver detalhes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            GCAF: {repairOrder.gcaf}
          </DialogTitle>
          <DialogDescription>
            Detalhes da Guia de Remessa
          </DialogDescription>
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex items-center gap-1">
              <Car className="h-4 w-4" />
              <span>Placa: {repairOrder.plate} | {repairOrder.kilometers} km</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Base: {repairOrder.base.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Wrench className="h-4 w-4" />
              <span>
                Mecânicos: {repairOrder.users && repairOrder.users.length > 0 
                  ? repairOrder.users.map(user => user.name).join(", ") 
                  : "Não informado"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Data: {formatDate(repairOrder.createdAt)}</span>
            </div>
            <div className="mt-1 font-medium">
              Status: {getStatusLabel(repairOrder.status)}
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {repairOrder.observation && (
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-1">Observações:</h4>
                <p className="text-sm text-muted-foreground">{repairOrder.observation}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2 mb-3">
                <Wrench className="h-5 w-5" />
                Serviços
              </h3>
              
              <div className="space-y-3">
                {repairOrder.services.map((service) => (
                  <div key={service.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{service.item.name}</h4>
                        <p className="text-sm text-muted-foreground">{service.labor || "Sem descrição"}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <span className="text-xs">{getCategoryLabel(service.category)}</span>
                          <span className="text-xs">{getTypeLabel(service.type)}</span>
                          <span className="text-xs">Quantidade: {service.quantity}</span>
                        </div>
                      </div>

                    </div>
                    
                    {service.photo && (
                      <div className="mt-2">
                        <img 
                          src={service.photo} 
                          alt={`Foto do serviço ${service.labor}`} 
                          className="rounded-md max-h-32 object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
