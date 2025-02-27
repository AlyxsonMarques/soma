"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl } from "@/components/ui/form";
import { cn } from "@/lib/utils";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerInputProps<T extends FieldValues> {
  className?: string;
  field: ControllerRenderProps<T, Path<T>>;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function DatePickerInput<T extends FieldValues>({
  field,
  variant = "outline",
  className,
}: DatePickerInputProps<T>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant={variant}
            className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground", className)}
          >
            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={field.value}
          onSelect={field.onChange}
          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
