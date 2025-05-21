"use client";

import { useEffect, useState } from "react";
import { ChartCard } from "./chart-card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { chartConfig } from "@/components/ui/charts";

interface StatusData {
  name: string;
  value: number;
  color: string;
}

export function RepairOrdersStatusChart() {
  const [data, setData] = useState<StatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar dados reais da API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-orders`);
        const orders = await response.json();
        
        // Mapear status para nomes amigáveis e cores
        const statusMap: Record<string, { label: string, color: string }> = {
          "PENDING": { label: "Pendente", color: "#f59e0b" },
          "REVISION": { label: "Revisão", color: "#3b82f6" },
          "APPROVED": { label: "Aprovado", color: "#10b981" },
          "PARTIALLY_APPROVED": { label: "Parcialmente Aprovado", color: "#6366f1" },
          "INVOICE_APPROVED": { label: "Aprovado para Nota Fiscal", color: "#8b5cf6" },
          "CANCELLED": { label: "Cancelado", color: "#ef4444" }
        };
        
        // Agrupar ordens por status
        const statusCounts: Record<string, number> = {};
        orders.forEach((order: any) => {
          const status = order.status || "UNKNOWN";
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        // Transformar em formato para o gráfico
        const chartData = Object.entries(statusCounts).map(([status, count]) => ({
          name: statusMap[status]?.label || status,
          value: count,
          color: statusMap[status]?.color || "#94a3b8"
        }));
        
        setData(chartData);
      } catch (error) {
        console.error("Erro ao buscar dados de status de ordens de reparo:", error);
        // Dados de fallback para demonstração
        setData([
          { name: "Pendente", value: 15, color: "#f59e0b" },
          { name: "Aprovado", value: 25, color: "#10b981" },
          { name: "Cancelado", value: 5, color: "#ef4444" },
          { name: "Revisão", value: 10, color: "#3b82f6" }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ChartCard 
      title="Status das Ordens de Reparo" 
      description="Distribuição por status atual"
    >
      {isLoading ? (
        <div className="flex h-[200px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      ) : (
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={(props) => {
                  const { active, payload, label } = props || {};
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-0.5">
                        <p className="text-xs font-medium">{payload[0].name}</p>
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: payload[0].payload.color }}
                            />
                            <span>Total</span>
                          </div>
                          <span className="font-medium tabular-nums">
                            {`${payload[0].value} ordens`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
