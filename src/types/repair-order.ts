import { z } from "zod";

export const repairOrderIdSchema = z.number().positive().int("Por favor, insira um ID válido.");
export const repairOrderGcafIdSchema = z.number().positive().int("Por favor, insira um ID GCAF válido.");
export const repairOrderPlateSchema = z
  .string()
  .trim()
  .nonempty("Placa é obrigatória")
  .min(7, "Placa inválida")
  .max(8, "Placa inválida");
export const repairOrderKilometersSchema = z
  .number()
  .positive("Por favor, insira um valor válido para quilometragem")
  .int("Por favor, insira um valor válido para quilometragem");
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
