"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type * as React from "react";
import { DayPicker, useNavigation } from "react-day-picker";
import { ptBR } from "date-fns/locale";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  // Componente personalizado para o cabeçalho do calendário com navegação por ano
  function CustomCaption({ displayMonth }: { displayMonth: Date }) {
    const { goToMonth, nextMonth, previousMonth } = useNavigation();
    
    // Calcular o próximo e o ano anterior manualmente
    const currentYear = displayMonth.getFullYear();
    const currentMonth = displayMonth.getMonth();
    
    const previousYear = new Date(displayMonth);
    previousYear.setFullYear(currentYear - 1);
    
    const nextYear = new Date(displayMonth);
    nextYear.setFullYear(currentYear + 1);
    
    // Gerar array de anos (de 1890 até o ano atual)
    const startYear = 1890;
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
    
    // Gerar array de meses
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    
    return (
      <div className="flex justify-center pt-1 relative items-center">
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => goToMonth(previousYear)}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              )}
              aria-label="Ano anterior"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => previousMonth && goToMonth(previousMonth)}
              disabled={!previousMonth}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              )}
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex space-x-1">
            <Select
              value={displayMonth.getMonth().toString()}
              onValueChange={(value) => {
                const newDate = new Date(displayMonth);
                newDate.setMonth(parseInt(value));
                goToMonth(newDate);
              }}
            >
              <SelectTrigger className="h-7 w-[110px] text-xs">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()} className="text-xs">
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={displayMonth.getFullYear().toString()}
              onValueChange={(value) => {
                const newDate = new Date(displayMonth);
                newDate.setFullYear(parseInt(value));
                goToMonth(newDate);
              }}
            >
              <SelectTrigger className="h-7 w-[80px] text-xs">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="text-xs">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => nextMonth && goToMonth(nextMonth)}
              disabled={!nextMonth}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              )}
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => goToMonth(nextYear)}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              )}
              aria-label="Próximo ano"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      locale={ptBR}
      weekStartsOn={0} // Domingo como primeiro dia da semana
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "hidden", // Escondemos o label padrão pois usamos nosso componente personalizado
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "hidden", // Escondemos os botões padrão pois usamos nossos próprios botões
        nav_button_next: "hidden", // Escondemos os botões padrão pois usamos nossos próprios botões
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-center",
        head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex justify-center w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(buttonVariants({ variant: "ghost" }), "h-8 w-8 p-0 font-normal aria-selected:opacity-100"),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => <ChevronLeft className={cn("h-4 w-4", className)} {...props} />,
        IconRight: ({ className, ...props }) => <ChevronRight className={cn("h-4 w-4", className)} {...props} />,
        Caption: ({ displayMonth }) => <CustomCaption displayMonth={displayMonth} />
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
