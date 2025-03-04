import { z } from "zod";
import { truckModelSchema } from "@/types/truck-model";
import { baseSchema } from "@/types/base";

const itemIdSchema = z.number().positive().int("Por favor, insira um ID válido.");

const itemNameSchema = z.string().trim().nonempty("Nome é obrigatório");

const itemTruckModel = truckModelSchema;

const itemValueSchema = z.number().positive().int("Por favor, insira um valor válido");

const itemBaseSchema = baseSchema;

const itemCreatedAtSchema = z.date();

export const itemUpdatedAtSchema = z.date();

export const itemSchema = z.object({
  id: itemIdSchema,
  name: itemNameSchema,
  truckModel: itemTruckModel,
  value: itemValueSchema,
  base: itemBaseSchema,
  createdAt: itemCreatedAtSchema,
  updatedAt: itemUpdatedAtSchema,
});

export type ItemSchema = z.infer<typeof itemSchema>;