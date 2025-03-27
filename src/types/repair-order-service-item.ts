import { baseSchema } from "@/types/base";
import { truckModelSchema } from "@/types/truck-model";
import { z } from "zod";

export const repairOrderServiceItemIdSchema = z
  .string({
    required_error: "Por favor insira um valor válido",
  })
  .uuid("Por favor, insira um ID válido.")
  .nonempty("Por favor insira um valor válido");

export const repairOrderServiceItemNameSchema = z.string().trim().nonempty("Nome é obrigatório");

export const repairOrderServiceItemTruckModel = truckModelSchema;

export const repairOrderServiceItemValueSchema = z.number().positive("Por favor, insira um valor válido");

export const repairOrderServiceItemBaseSchema = baseSchema;

export const repairOrderServiceItemCreatedAtSchema = z.date();

export const repairOrderServiceItemUpdatedAtSchema = z.date();
