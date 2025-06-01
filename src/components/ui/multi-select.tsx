"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected = [],
  onChange,
  placeholder = "Selecione itens...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Garantir que selected seja sempre um array
  const safeSelected = Array.isArray(selected) ? selected : [];

  // Função para remover um item selecionado
  const handleRemove = (value: string) => {
    const newSelected = safeSelected.filter((item) => item !== value);
    onChange(newSelected);
  };

  // Função para adicionar ou remover um item
  const handleToggle = (value: string) => {
    const isSelected = safeSelected.includes(value);
    let newSelected;
    
    if (isSelected) {
      newSelected = safeSelected.filter((item) => item !== value);
    } else {
      newSelected = [...safeSelected, value];
    }
    
    onChange(newSelected);
  };

  // Filtrar opções com base no input de busca
  const filteredOptions = options.filter((option) => 
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Obter opções selecionadas com labels
  const selectedItems = options.filter((option) => 
    safeSelected.includes(option.value)
  );

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
          >
            <div className="flex flex-wrap gap-1 overflow-hidden">
              {selectedItems.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {selectedItems.map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="mr-1 mb-1"
                    >
                      {option.label}
                      <span
                        role="button"
                        tabIndex={0}
                        className="ml-1 rounded-full outline-none cursor-pointer inline-flex"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(option.value);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Buscar..." 
              value={inputValue}
              onValueChange={setInputValue}
              className="h-9"
            />
            <CommandEmpty className="py-2 px-4 text-sm">
              Nenhum resultado encontrado.
            </CommandEmpty>
            <CommandGroup className="max-h-60 overflow-auto">
              {filteredOptions.map((option) => {
                const isSelected = safeSelected.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
                    onClick={() => handleToggle(option.value)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected ? "bg-primary border-primary" : "border-input"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span>{option.label}</span>
                  </div>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
