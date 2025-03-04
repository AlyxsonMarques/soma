import { z } from "zod";

const truckModelIdSchema = z.number().positive().int("Por favor, insira um ID válido.");

const truckModelNameSchema = z.string().trim().nonempty("Nome é obrigatório");

const truckModelBrandSchema = z.string().trim().nonempty("Marca é obrigatória");

const truckModelYearSchema = z.number().positive().int("Por favor, insira um ano válido");

const truckModelCreatedAtSchema = z.date();

export const truckModelUpdatedAtSchema = z.date();

export const truckModelSchema = z.object({
  id: truckModelIdSchema,
  name: truckModelNameSchema,
  brand: truckModelBrandSchema,
  year: truckModelYearSchema,
  createdAt: truckModelCreatedAtSchema,
  updatedAt: truckModelUpdatedAtSchema,
});

export type TruckModelSchema = z.infer<typeof truckModelSchema>;
