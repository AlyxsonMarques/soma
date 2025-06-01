import { addressSchema } from "@/types/address";
import { z } from "zod";
export const baseIdSchema = z.string().uuid("Por favor, selecione uma base válida");

const baseNameSchema = z.string().trim().nonempty("Por favor, informe o nome da base");

const baseAddressSchema = addressSchema;

const basePhoneSchema = z
  .string()
  .min(10, "O telefone deve ter pelo menos 10 dígitos")
  .max(11, "O telefone deve ter no máximo 11 dígitos")
  .trim()
  .nonempty("Por favor, informe o telefone da base");

const baseCreatedAtSchema = z.date();

const baseUpdatedAtSchema = z.date();

export const baseSchema = z.object({
  id: baseIdSchema,
  name: baseNameSchema,
  address: baseAddressSchema,
  phone: basePhoneSchema,
  createdAt: baseCreatedAtSchema,
  updatedAt: baseUpdatedAtSchema,
});

export type BaseSchema = z.infer<typeof baseSchema>;

export const baseAPISchema = z.object({
  id: baseIdSchema,
  name: baseNameSchema,
  address: baseAddressSchema,
  phone: basePhoneSchema,
  createdAt: baseCreatedAtSchema,
  updatedAt: baseUpdatedAtSchema,
});

export type BaseAPISchema = z.infer<typeof baseAPISchema>;
