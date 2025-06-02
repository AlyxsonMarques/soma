"use client";

import React from 'react';
import type { RepairOrderAPISchema } from '@/types/api-schemas';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  formatCurrency, 
  formatDate, 
  translateStatus, 
  translateServiceType, 
  translateServiceCategory, 
  translateServiceStatus 
} from '@/lib/pdf-generator';













// Função para obter a cor do status
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    PENDING: 'bg-yellow-500',
    REVISION: 'bg-blue-500',
    APPROVED: 'bg-green-500',
    PARTIALLY_APPROVED: 'bg-emerald-300',
    INVOICE_APPROVED: 'bg-green-700',
    CANCELLED: 'bg-red-500'
  };
  return colorMap[status] || 'bg-gray-500';
};

// Função para obter a cor do status do serviço
const getServiceStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    PENDING: 'bg-yellow-500',
    APPROVED: 'bg-green-500',
    CANCELLED: 'bg-red-500'
  };
  return colorMap[status] || 'bg-gray-500';
};

interface RepairOrderTemplateProps {
  repairOrder: RepairOrderAPISchema;
}

export const RepairOrderTemplate: React.FC<RepairOrderTemplateProps> = ({ repairOrder }) => {
  // Calcular subtotal e total dos serviços
  let subtotal = 0;
  let totalDiscount = 0;
  
  repairOrder.services?.forEach(service => {
    const serviceValue = typeof service.value === 'string' ? parseFloat(service.value) : service.value || 0;
    const serviceDiscount = typeof service.discount === 'string' ? parseFloat(service.discount) : service.discount || 0;
    subtotal += serviceValue;
    totalDiscount += serviceDiscount;
  });
  
  const total = subtotal - totalDiscount - (repairOrder.discount || 0);

  return (
    <div className="pdf-container max-w-4xl mx-auto bg-card text-card-foreground p-6 shadow-sm print:shadow-none">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Guia de Remessa (GR)</h1>
        <h2 className="text-2xl font-semibold mt-2">GCAF: {repairOrder.gcaf || 'N/A'}</h2>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Informações da GR</CardTitle>
          <div className="flex items-center mt-2">
            <Badge className={`badge ${getStatusColor(repairOrder.status)} text-white inline-flex items-center justify-center h-6 px-2`}>
              {translateStatus(repairOrder.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Base</p>
              <p className="font-medium">{repairOrder.base?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Placa</p>
              <p className="font-medium">{repairOrder.plate || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kilometragem</p>
              <p className="font-medium">{repairOrder.kilometers || 0} km</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Desconto Total</p>
              <p className="font-medium">{formatCurrency(repairOrder.discount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Criação</p>
              <p className="font-medium">{formatDate(repairOrder.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Atualização</p>
              <p className="font-medium">{formatDate(repairOrder.updatedAt)}</p>
            </div>
          </div>

          {repairOrder.observations && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Observações</p>
              <p className="mt-1 text-sm">{repairOrder.observations}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Mecânicos Responsáveis</CardTitle>
        </CardHeader>
        <CardContent>
          {repairOrder.users && repairOrder.users.length > 0 ? (
            <div className="space-y-4">
              {repairOrder.users.map((user, index) => {
                const cpfFormatted = user.cpf ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 'N/A';
                const initials = user.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '??';
                
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <Avatar className="avatar flex items-center justify-center w-10 h-10 rounded-full">
                      <AvatarFallback className="flex items-center justify-center w-full h-full">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">CPF: {cpfFormatted} | Email: {user.email || 'N/A'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum mecânico responsável associado.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          {repairOrder.services && repairOrder.services.length > 0 ? (
            <div className="space-y-4">
              {repairOrder.services.map((service, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{service.item?.name || 'N/A'}</h3>
                      <div className="flex space-x-2 mt-1">
                        <Badge variant="outline" className="badge inline-flex items-center justify-center h-6 px-2">{translateServiceType(service.type)}</Badge>
                        <Badge variant="outline" className="badge inline-flex items-center justify-center h-6 px-2">{translateServiceCategory(service.category)}</Badge>
                        <Badge className={`badge ${getServiceStatusColor(service.status)} text-white inline-flex items-center justify-center h-6 px-2`}>
                          {translateServiceStatus(service.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(service.value)}</p>
                      <p className="text-sm text-muted-foreground">Qtd: {service.quantity || 0}</p>
                      <p className="text-sm text-muted-foreground">Desconto: {formatCurrency(service.discount)}</p>
                    </div>
                  </div>
                  {service.photo && (
                    <div className="mt-3 mb-3 service-photo-container">
                      <p className="text-sm font-medium mb-2">Foto do Serviço:</p>
                      <img 
                        src={service.photo} 
                        alt={`Foto do serviço: ${service.item?.name || 'Serviço'}`}
                        className="service-photo max-w-full h-auto rounded-md"
                        crossOrigin="anonymous"
                        loading="eager"
                        onError={(e) => {
                          // Tentar recarregar a imagem uma vez
                          const target = e.target as HTMLImageElement;
                          if (!target.dataset.retried) {
                            target.dataset.retried = 'true';
                            // Adicionar timestamp para evitar cache
                            const newSrc = target.src + (target.src.includes('?') ? '&' : '?') + 'retry=' + new Date().getTime();
                            setTimeout(() => { target.src = newSrc; }, 500);
                          } else {
                            // Se falhar novamente, mostrar mensagem de erro
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const errorMsg = document.createElement('p');
                              errorMsg.textContent = 'Não foi possível carregar a imagem';
                              errorMsg.className = 'text-sm text-red-500 italic';
                              parent.appendChild(errorMsg);
                            }
                          }
                        }}
                        style={{
                          maxHeight: '300px',
                          objectFit: 'contain',
                          margin: '0 auto',
                          display: 'block'
                        }}
                      />
                    </div>
                  )}
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum serviço registrado.</p>
          )}
        </CardContent>
        {repairOrder.services && repairOrder.services.length > 0 && (
          <CardFooter className="flex-col items-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Desconto em Serviços:</span>
                <span>{formatCurrency(totalDiscount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Desconto Adicional:</span>
                <span>{formatCurrency(repairOrder.discount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};
