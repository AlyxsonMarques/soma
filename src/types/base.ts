import { z } from "zod";
import { addressSchema } from "@/types/address";
const baseIdSchema = z.number().positive().int("Por favor, insira um ID válido.");

const baseNameSchema = z.string().trim().nonempty("Nome é obrigatório");

const baseAddressSchema = addressSchema;

const baseCreatedAtSchema = z.date();

const baseUpdatedAtSchema = z.date();

export const baseSchema = z.object({
  id: baseIdSchema,
  name: baseNameSchema,
  address: baseAddressSchema,
  createdAt: baseCreatedAtSchema,
  updatedAt: baseUpdatedAtSchema,
});

export type BaseSchema = z.infer<typeof baseSchema>;

export const baseAPISchema = z.object({
  id: baseIdSchema,
  name: baseNameSchema,
  address: baseAddressSchema,
  createdAt: baseCreatedAtSchema,
  updatedAt: baseUpdatedAtSchema,
});

export type BaseAPISchema = z.infer<typeof baseAPISchema>;
