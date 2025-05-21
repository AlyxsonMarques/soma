"use client";

import { useEffect, useState } from "react";
import { ChartCard } from "./chart-card";
import { BarChart, Bar, ResponsiveContainer, CartesianGrid, XAxis as RXAxis, YAxis as RYAxis, Tooltip as RTooltip } from "recharts";
import { chartConfig } from "@/components/ui/charts";

interface ServicesByCategoryData {
  name: string;
  total: number;
}

export function ServicesByCategoryChart() {
  const [data, setData] = useState<ServicesByCategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar dados reais da API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-services`);
        const services = await response.json();
        
        // Agrupar serviços por categoria
        const categoryCounts: Record<string, number> = {};
        services.forEach((service: any) => {
          const category = service.category || "UNKNOWN";
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        // Transformar em formato para o gráfico
        const chartData = Object.entries(categoryCounts).map(([name, total]) => ({
          name: name === "LABOR" ? "Mão de Obra" : name === "MATERIAL" ? "Material" : name,
          total,
        }));
        
        setData(chartData);
      } catch (error) {
        console.error("Erro ao buscar dados de serviços:", error);
        // Dados de fallback para demonstração
        setData([
          { name: "Mão de Obra", total: 35 },
          { name: "Material", total: 28 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ChartCard 
      title="Serviços por Categoria" 
      description="Distribuição de serviços por categoria"
    >
      {isLoading ? (
        <div className="flex h-[200px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      ) : (
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <RXAxis 
                dataKey="name" 
                className="stroke-border fill-muted-foreground"
                tick={{ transform: "translate(0, 6)" }}
                tickLine={false}
                axisLine={false}
              />
              <RYAxis
                className="stroke-border fill-muted-foreground"
                tick={{ transform: "translate(-3, 0)" }}
                tickLine={false}
                axisLine={false}
              />
              <RTooltip
                content={(props) => {
                  const { active, payload, label } = props || {};
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-0.5">
                        <p className="text-xs font-medium">Categoria: {label}</p>
                        {payload.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: chartConfig.colors.blue }}
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
              <Bar 
                dataKey="total" 
                fill={chartConfig.colors.blue}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
