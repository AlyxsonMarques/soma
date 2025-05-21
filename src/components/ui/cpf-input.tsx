"use client";

import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { unformatCPF } from "@/lib/validators/cpf-validator";

export interface CPFInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (value: string) => void;
  value?: string;
}

const CPFInput = React.forwardRef<HTMLInputElement, CPFInputProps>(
  ({ className, onChange, value, ...props }, ref) => {
    // Função para formatar o CPF enquanto o usuário digita
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      
      // Remove todos os caracteres não numéricos
      let numericValue = input.replace(/\D/g, "");
      
      // Limita a 11 dígitos
      numericValue = numericValue.slice(0, 11);
      
      // Formata o CPF (XXX.XXX.XXX-XX)
      let formattedValue = numericValue;
      if (numericValue.length > 3) {
        formattedValue = numericValue.replace(/^(\d{3})/, "$1.");
      }
      if (numericValue.length > 6) {
        formattedValue = formattedValue.replace(/^(\d{3})\.(\d{3})/, "$1.$2.");
      }
      if (numericValue.length > 9) {
        formattedValue = formattedValue.replace(/^(\d{3})\.(\d{3})\.(\d{3})/, "$1.$2.$3-");
      }
      
      // Atualiza o valor do input
      e.target.value = formattedValue;
      
      // Chama o callback onChange com o valor sem formatação (apenas números)
      if (onChange) {
        onChange(numericValue);
      }
    };
    
    // Formata o valor inicial se necessário
    const displayValue = React.useMemo(() => {
      if (!value) return "";
      
      const numericValue = value.replace(/\D/g, "");
      
      let formattedValue = numericValue;
      if (numericValue.length > 3) {
        formattedValue = numericValue.replace(/^(\d{3})/, "$1.");
      }
      if (numericValue.length > 6) {
        formattedValue = formattedValue.replace(/^(\d{3})\.(\d{3})/, "$1.$2.");
      }
      if (numericValue.length > 9) {
        formattedValue = formattedValue.replace(/^(\d{3})\.(\d{3})\.(\d{3})/, "$1.$2.$3-");
      }
      
      return formattedValue;
    }, [value]);

    return (
      <Input
        ref={ref}
        className={cn(className)}
        onChange={handleChange}
        value={displayValue}
        placeholder="000.000.000-00"
        maxLength={14}
        {...props}
      />
    );
  }
);

CPFInput.displayName = "CPFInput";

export { CPFInput };
