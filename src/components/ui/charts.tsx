"use client"

import * as React from "react"
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis as RXAxis,
  YAxis as RYAxis,
} from "recharts"

import { cn } from "@/lib/utils"

// Configuração do gráfico
export const chartConfig = {
  colors: {
    blue: "hsl(var(--chart-blue))",
    green: "hsl(var(--chart-green))",
    yellow: "hsl(var(--chart-yellow))",
    violet: "hsl(var(--chart-violet))",
    red: "hsl(var(--chart-red))",
    orange: "hsl(var(--chart-orange))",
  },
}

// Contêiner do gráfico
interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ChartContainer({
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div
      className={cn("h-[350px] w-full", className)}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}

// Grade do gráfico
export function Grid(props: React.ComponentProps<typeof CartesianGrid>) {
  return (
    <CartesianGrid
      strokeDasharray="3 3"
      className="stroke-border"
      {...props}
    />
  )
}

// Eixo X
export function XAxis(props: React.ComponentProps<typeof RXAxis>) {
  return (
    <RXAxis
      className="stroke-border fill-muted-foreground"
      tick={{ transform: "translate(0, 6)" }}
      tickLine={false}
      axisLine={false}
      {...props}
    />
  )
}

// Eixo Y
export function YAxis(props: React.ComponentProps<typeof RYAxis>) {
  return (
    <RYAxis
      className="stroke-border fill-muted-foreground"
      tick={{ transform: "translate(-3, 0)" }}
      tickLine={false}
      axisLine={false}
      {...props}
    />
  )
}

// Tooltip
export function Tooltip(props: React.ComponentProps<typeof RTooltip>) {
  return <RTooltip {...props} />
}

interface TooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: string | number
    payload: Record<string, any>
  }>
  label?: string
  formatter?: (value: number, name: string, props: any) => [string, string]
  labelFormatter?: (label: string) => string
  className?: string
}

export function TooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  className,
}: TooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-background p-2 shadow-sm",
        className
      )}
    >
      <div className="grid gap-0.5">
        {label && (
          <p className="text-xs font-medium">
            {labelFormatter ? labelFormatter(label) : label}
          </p>
        )}
        {payload.map((item, index) => {
          return (
            <div
              key={index}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: item.payload.fill || item.payload.color,
                  }}
                />
                <span>{item.name}</span>
              </div>
              <span className="font-medium tabular-nums">
                {formatter
                  ? formatter(
                      Number(item.value),
                      item.name,
                      item.payload
                    )[0]
                  : item.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
