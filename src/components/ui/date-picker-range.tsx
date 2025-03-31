"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerRangeProps<T extends FieldValues> {
  className?: string;
  field: ControllerRenderProps<T, Path<T>>;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function DatePickerWithRange<T extends FieldValues>({
  field,
  variant = "outline",
  className,
}: DatePickerRangeProps<T>) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={variant}
              className={cn("w-[300px] justify-start text-left font-normal", !field.value && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value?.from ? (
                field.value.to ? (
                  <>
                    {format(field.value.from, "dd 'de' MMM 'de' yyyy", { locale: ptBR })} -{" "}
                    {format(field.value.to, "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                  </>
                ) : (
                  format(field.value.from, "dd 'de' MMM 'de' yyyy", { locale: ptBR })
                )
              ) : (
                <span>Selecione um período</span>
              )}
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={field.value?.from}
            selected={field.value}
            onSelect={field.onChange}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
