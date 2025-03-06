import { repairOrderItemSchema } from "@/types/repair-order-item";
import { z } from "zod";

export const repairOrderServiceIdSchema = z.number().positive().int("Por favor, insira um ID válido.");

export const repairOrderServiceItemSchema = repairOrderItemSchema;

export const repairOrderServiceQuantitySchema = z
  .number()
  .positive("Por favor, insira uma quantidade válida")
  .int("Por favor, insira uma quantidade válida");

export const repairOrderServiceLaborSchema = z
  .string()
  .trim()
  .nonempty("Por favor, insira uma descrição de mão de obra");

export const repairOrderServiceDurationSchema = z.number().positive().int("Por favor, insira uma duração válida");

export const repairOrderServiceValueSchema = z.number().positive().int("Por favor, insira um valor válido");

export const repairOrderServiceDiscountSchema = z.number().positive().int("Por favor, insira um desconto válido");

export const repairOrderServiceCategorySchema = z.enum(["LABOR", "MATERIAL"]);

export const repairOrderServiceTypeSchema = z.enum(["PREVENTIVE", "CORRECTIVE"]);

export const repairOrderServiceStatusSchema = z.enum(["PENDING", "APPROVED", "CANCELLED"]);

export const repairOrderServiceCreatedAtSchema = z.date();

export const repairOrderServiceUpdatedAtSchema = z.date();
