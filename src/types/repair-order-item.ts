import { baseSchema } from "@/types/base";
import { truckModelSchema } from "@/types/truck-model";
import { z } from "zod";

const repairOrderItemIdSchema = z.number().positive().int("Por favor, insira um ID válido.");

const repairOrderItemNameSchema = z.string().trim().nonempty("Nome é obrigatório");

const repairOrderItemTruckModel = truckModelSchema;

const repairOrderItemValueSchema = z.number().positive("Por favor, insira um valor válido");

const repairOrderItemBaseSchema = baseSchema;

const repairOrderItemCreatedAtSchema = z.date();

const repairOrderItemUpdatedAtSchema = z.date();

export const repairOrderItemSchema = z.object({
  id: repairOrderItemIdSchema,
  name: repairOrderItemNameSchema,
  truckModel: repairOrderItemTruckModel,
  value: repairOrderItemValueSchema,
  base: repairOrderItemBaseSchema,
  createdAt: repairOrderItemCreatedAtSchema,
  updatedAt: repairOrderItemUpdatedAtSchema,
});

export type RepairOrderItemSchema = z.infer<typeof repairOrderItemSchema>;

export const repairOrderItemAPISchema = repairOrderItemSchema.extend({
  id: repairOrderItemIdSchema,
  name: repairOrderItemNameSchema,
  truckModel: repairOrderItemTruckModel,
  value: repairOrderItemValueSchema,
  base: repairOrderItemBaseSchema,
  createdAt: repairOrderItemCreatedAtSchema,
  updatedAt: repairOrderItemUpdatedAtSchema,
});

export type RepairOrderItemAPISchema = z.infer<typeof repairOrderItemAPISchema>;
