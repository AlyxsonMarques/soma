"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import * as React from "react";
import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerRangeProps<T extends FieldValues = any> {
  className?: string;
  field?: ControllerRenderProps<T, Path<T>>;
  date?: {
    from: Date | undefined;
    to?: Date | undefined;
  };
  setDate?: (date: { from: Date | undefined; to?: Date | undefined }) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function DatePickerWithRange<T extends FieldValues = any>({
  field,
  date,
  setDate,
  variant = "outline",
  className,
}: DatePickerRangeProps<T>) {
  // Determine which props to use (field or date/setDate)
  const value = field?.value || date;
  
  // Handle the different onChange patterns
  const handleSelect = (range: DateRange | undefined) => {
    if (field?.onChange) {
      field.onChange(range);
    } else if (setDate && range) {
      setDate(range);
    }
  };
  
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={variant}
              className={cn("w-[300px] justify-start text-left font-normal", !value && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value?.from ? (
                value.to ? (
                  <>
                    {format(value.from, "dd 'de' MMM 'de' yyyy", { locale: ptBR })} -{" "}
                    {format(value.to, "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                  </>
                ) : (
                  format(value.from, "dd 'de' MMM 'de' yyyy", { locale: ptBR })
                )
              ) : (
                <span>Selecione um período</span>
              )}
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
          <div className="relative p-0">
            <div className="absolute right-2 top-2 z-10">
              <PopoverClose asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6 rounded-full p-0 border-0"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Fechar</span>
                </Button>
              </PopoverClose>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={handleSelect}
              numberOfMonths={2}
              locale={ptBR}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
