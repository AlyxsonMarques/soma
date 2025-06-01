import { z } from "zod";

export const repairOrderIdSchema = z.string().uuid("Por favor, selecione uma ordem de reparo válida.");
export const repairOrderGcafIdSchema = z.number().positive().int("Por favor, informe um número GCAF válido.");
export const repairOrderPlateSchema = z
  .string()
  .trim()
  .nonempty("Por favor, informe a placa do veículo")
  .min(7, "A placa informada é muito curta, verifique se está completa")
  .max(8, "A placa informada é muito longa, verifique se está correta")
  .transform(val => val.toUpperCase());
export const repairOrderKilometersSchema = z
  .number()
  .int("Por favor, informe a quilometragem sem casas decimais")
  .nonnegative("A quilometragem não pode ser negativa");
export const repairOrderStatusSchema = z.enum([
  "pending",
  "revision",
  "approved",
  "partially_approved",
  "invoice_approved",
  "cancelled",
]);

export const repairOrderObservationsSchema = z.string().trim().optional();

export const repairOrderDiscountSchema = z.number().positive().int("Por favor, insira um valor válido para desconto.");

export const repairOrderCreatedAtSchema = z.date();

export const repairOrderUpdatedAtSchema = z.date();
