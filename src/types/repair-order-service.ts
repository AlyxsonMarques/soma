import { z } from "zod";
import { itemSchema } from "@/types/item";

export const repairOrderServiceIdSchema = z.number().positive().int("Por favor, insira um ID válido.");

export const repairOrderServiceItemSchema = itemSchema;

export const repairOrderServiceQuantitySchema = z.number().positive().int("Por favor, insira uma quantidade válida");

export const repairOrderServiceLaborSchema = z.string().trim().nonempty("Por favor, insira uma descrição de serviço");

export const repairOrderServiceDurationSchema = z.number().positive().int("Por favor, insira uma duração válida");

export const repairOrderServiceValueSchema = z.number().positive().int("Por favor, insira um valor válido");

export const repairOrderServiceDiscountSchema = z.number().positive().int("Por favor, insira um desconto válido");

export const repairOrderServiceTypeSchema = z.enum(["preventive", "corrective"]);

export const repairOrderServiceStatusSchema = z.enum(["pending", "approved", "cancelled"]);

export const repairOrderServiceCreatedAtSchema = z.date();

export const repairOrderServiceUpdatedAtSchema = z.date();

export const repairOrderServiceSchema = z.object({
  id: repairOrderServiceIdSchema,
  item: repairOrderServiceItemSchema,
  quantity: repairOrderServiceQuantitySchema,
  labor: repairOrderServiceLaborSchema,
  duration: repairOrderServiceDurationSchema,
  value: repairOrderServiceValueSchema,
  discount: repairOrderServiceDiscountSchema,
  type: repairOrderServiceTypeSchema,
  status: repairOrderServiceStatusSchema,
  createdAt: repairOrderServiceCreatedAtSchema,
  updatedAt: repairOrderServiceUpdatedAtSchema,
});

export type RepairOrderServiceSchema = z.infer<typeof repairOrderServiceSchema>;