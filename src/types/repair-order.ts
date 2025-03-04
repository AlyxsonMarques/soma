import { z } from "zod";
import { userSchema } from "@/types/user";
import { baseSchema } from "@/types/base";
import { repairOrderServiceSchema } from "@/types/repair-order-service";
const repairOrderIdSchema = z.number().positive().int("Por favor, insira um ID válido.");
const repairOrderGcafIdSchema = z.number().positive().int("Por favor, insira um ID GCAF válido.");
const repairOrderPlateSchema = z.string().trim().nonempty("Placa é obrigatória");
const repairOrderKilometersSchema = z.number().positive().int("Por favor, insira um valor válido para quilometragem.");
const repairOrderStatusSchema = z.enum([
  "pending",
  "revision",
  "approved",
  "partial_approved",
  "nf_approved",
  "cancelled",
]);

const repairOrderObservationsSchema = z.string().trim().optional();

const repairOrderDiscountSchema = z.number().positive().int("Por favor, insira um valor válido para desconto.");

const repairOrderServicesSchema = z.array(repairOrderServiceSchema);

const repairOrderCreatedAtSchema = z.date();

const repairOrderUpdatedAtSchema = z.date();

export const repairOrderSchema = z.object({
  id: repairOrderIdSchema,
  gcaf: repairOrderGcafIdSchema,
  user: z.array(userSchema),
  base: baseSchema, //TODO: Create base schema
  truck: repairOrderPlateSchema, //TODO: Create truck schema (PLATE)
  kilometers: repairOrderKilometersSchema,
  status: repairOrderStatusSchema,
  observations: repairOrderObservationsSchema,
  discount: repairOrderDiscountSchema,
  services: repairOrderServicesSchema,
  createdAt: repairOrderCreatedAtSchema,
  updatedAt: repairOrderUpdatedAtSchema,
});

export type RepairOrderSchema = z.infer<typeof repairOrderSchema>;

export const repairOrderAPISchema = z.object({
  id: repairOrderIdSchema,
  gcaf: repairOrderGcafIdSchema,
  users: z.array(userSchema),
  base: baseSchema, //TODO: Create base schema
  truck: repairOrderPlateSchema, //TODO: Create truck schema (PLATE)
  kilometers: repairOrderKilometersSchema,
  status: repairOrderStatusSchema,
  observations: repairOrderObservationsSchema,
  discount: repairOrderDiscountSchema,
  services: repairOrderServicesSchema,
  createdAt: repairOrderCreatedAtSchema,
  updatedAt: repairOrderUpdatedAtSchema,
});

export type RepairOrderAPISchema = z.infer<typeof repairOrderAPISchema>;