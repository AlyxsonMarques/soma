"use client";

import { useEffect, useState } from "react";
import { ChartCard } from "./chart-card";
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { chartConfig } from "@/components/ui/charts";

interface RepairOrdersTimeData {
  date: string;
  count: number;
}

export function RepairOrdersOverTimeChart() {
  const [data, setData] = useState<RepairOrdersTimeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar dados reais da API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-orders`);
        const orders = await response.json();
        
        // Agrupar ordens por mês
        const monthCounts: Record<string, number> = {};
        orders.forEach((order: any) => {
          const date = new Date(order.createdAt);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
          monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
        });
        
        // Ordenar por data
        const sortedMonths = Object.keys(monthCounts).sort((a, b) => {
          const [monthA, yearA] = a.split('/').map(Number);
          const [monthB, yearB] = b.split('/').map(Number);
          return yearA !== yearB ? yearA - yearB : monthA - monthB;
        });
        
        // Transformar em formato para o gráfico
        const chartData = sortedMonths.map(month => ({
          date: month,
          count: monthCounts[month],
        }));
        
        setData(chartData);
      } catch (error) {
        console.error("Erro ao buscar dados de ordens de reparo:", error);
        // Dados de fallback para demonstração
        const currentDate = new Date();
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date(currentDate);
          date.setMonth(currentDate.getMonth() - i);
          months.push(`${date.getMonth() + 1}/${date.getFullYear()}`);
        }
        
        setData(months.map((month, index) => ({
          date: month,
          count: Math.floor(Math.random() * 30) + 10,
        })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Formatar o rótulo do mês para exibição
  const formatMonthLabel = (month: string) => {
    const [m, y] = month.split('/');
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${monthNames[parseInt(m) - 1]}/${y.slice(2)}`;
  };

  return (
    <ChartCard 
      title="Ordens de Reparo por Mês" 
      description="Tendência de ordens de reparo ao longo do tempo"
    >
      {isLoading ? (
        <div className="flex h-[200px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      ) : (
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="date" 
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
                        <p className="text-xs font-medium">Mês: {formatMonthLabel(label)}</p>
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
                              {`${item.value} ordens`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={chartConfig.colors.blue}
                strokeWidth={2}
                dot={{ r: 4, fill: chartConfig.colors.blue }}
                activeDot={{ r: 6, fill: chartConfig.colors.blue }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
