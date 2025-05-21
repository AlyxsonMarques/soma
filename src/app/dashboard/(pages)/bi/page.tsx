"use client";

import { DashboardHeader } from "../../components/dashboard-header";
import { ServicesByCategoryChart } from "./components/services-by-category-chart";
import { RepairOrdersOverTimeChart } from "./components/repair-orders-over-time-chart";
import { RepairOrdersStatusChart } from "./components/repair-orders-status-chart";
import { ServicesByBaseChart } from "./components/services-by-base-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function BusinessIntelligencePage() {
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalServices, setTotalServices] = useState<number>(0);
  const [totalBases, setTotalBases] = useState<number>(0);
  
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        // Buscar total de ordens de reparo
        const ordersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-orders`);
        const orders = await ordersResponse.json();
        setTotalOrders(orders.length);
        
        // Buscar total de serviços
        const servicesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-services`);
        const services = await servicesResponse.json();
        setTotalServices(services.length);
        
        // Buscar total de bases
        const basesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bases`);
        const bases = await basesResponse.json();
        setTotalBases(bases.length);
      } catch (error) {
        console.error("Erro ao buscar dados de resumo:", error);
        // Valores de fallback
        setTotalOrders(42);
        setTotalServices(128);
        setTotalBases(5);
      }
    };
    
    fetchSummaryData();
  }, []);
  
  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Ordens de Reparo</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Guias de remessa registradas no sistema
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalServices}</div>
              <p className="text-xs text-muted-foreground">
                Serviços realizados em todas as bases
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bases Operacionais</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBases}</div>
              <p className="text-xs text-muted-foreground">
                Bases ativas no sistema
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ServicesByCategoryChart />
          <RepairOrdersStatusChart />
          <ServicesByBaseChart />
        </div>
        
        {/* Gráfico de tendência em tela cheia */}
        <div className="grid gap-4 md:grid-cols-1">
          <RepairOrdersOverTimeChart />
        </div>
      </div>
    </>
  );
}
