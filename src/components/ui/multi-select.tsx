"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: {
    label: string;
    value: string;
  }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecione itens...",
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
    setInputValue("");
  };

  const selectedOptions = options.filter((option) => selected.includes(option.value));

  return (
    <Command
      className={cn(
        "overflow-visible bg-transparent",
        className
      )}
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="rounded-sm px-1 py-0 text-xs"
            >
              {option.label}
              <button
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnselect(option.value);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => handleUnselect(option.value)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remover {option.label}</span>
              </button>
            </Badge>
          ))}
          <CommandInput
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={selectedOptions.length === 0 ? placeholder : ""}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative">
        {open && (
          <CommandPrimitive.List
            className="absolute top-2 z-10 w-full rounded-md border border-input bg-popover text-popover-foreground shadow-md outline-none animate-in"
            style={{ maxHeight: "300px", overflow: "auto" }}
          >
            <CommandEmpty className="py-2 px-4 text-sm">
              Nenhum resultado encontrado.
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className={cn(
                      "cursor-pointer",
                      isSelected ? "bg-accent text-accent-foreground" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <svg
                        className={cn("h-4 w-4")}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandPrimitive.List>
        )}
      </div>
    </Command>
  );
}
