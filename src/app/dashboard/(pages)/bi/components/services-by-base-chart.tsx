"use client";

import { useEffect, useState } from "react";
import { ChartCard } from "./chart-card";
import { Area, AreaChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { chartConfig } from "@/components/ui/charts";

interface BaseServiceData {
  name: string;
  count: number;
}

export function ServicesByBaseChart() {
  const [data, setData] = useState<BaseServiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar dados reais da API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-orders`);
        const orders = await response.json();
        
        // Mapear bases e contar serviços
        const baseCounts: Record<string, { name: string; count: number }> = {};
        
        orders.forEach((order: any) => {
          const baseName = order.base?.name || "Sem base";
          const baseId = order.base?.id || "unknown";
          
          if (!baseCounts[baseId]) {
            baseCounts[baseId] = { name: baseName, count: 0 };
          }
          
          // Adicionar o número de serviços desta ordem
          if (Array.isArray(order.services)) {
            baseCounts[baseId].count += order.services.length;
          }
        });
        
        // Transformar em formato para o gráfico e ordenar por contagem
        const chartData = Object.values(baseCounts)
          .sort((a, b) => b.count - a.count);
        
        setData(chartData);
      } catch (error) {
        console.error("Erro ao buscar dados de serviços por base:", error);
        // Dados de fallback para demonstração
        setData([
          { name: "Base Rio", count: 42 },
          { name: "Base SP", count: 28 },
          { name: "Base MG", count: 18 },
          { name: "Base RS", count: 12 }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ChartCard 
      title="Serviços por Base" 
      description="Distribuição de serviços por base operacional"
    >
      {isLoading ? (
        <div className="flex h-[200px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      ) : (
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="name" 
                className="stroke-border fill-muted-foreground"
                tick={{ transform: "translate(0, 6)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="stroke-border fill-muted-foreground"
                tick={{ transform: "translate(-3, 0)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={(props) => {
                  const { active, payload, label } = props || {};
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-0.5">
                        <p className="text-xs font-medium">Base: {label}</p>
                        {payload.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: chartConfig.colors.violet }}
                              />
                              <span>Total</span>
                            </div>
                            <span className="font-medium tabular-nums">
                              {`${item.value} serviços`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke={chartConfig.colors.violet}
                fill={chartConfig.colors.violet}
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
