import { baseSchema } from "@/types/base";
import { truckModelSchema } from "@/types/truck-model";
import { z } from "zod";

export const repairOrderServiceItemIdSchema = z
  .string({
    required_error: "Por favor selecione um item válido",
  })
  .uuid("Por favor, selecione um item válido")
  .nonempty("Por favor, selecione um item da lista");

export const repairOrderServiceItemNameSchema = z.string().trim().nonempty("Por favor, informe o nome do item");

export const repairOrderServiceItemTruckModel = truckModelSchema;

export const repairOrderServiceItemValueSchema = z.number().positive("O valor do item deve ser maior que zero");

export const repairOrderServiceItemBaseSchema = baseSchema;

export const repairOrderServiceItemCreatedAtSchema = z.date();

export const repairOrderServiceItemUpdatedAtSchema = z.date();
