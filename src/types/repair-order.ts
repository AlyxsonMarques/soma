import { z } from "zod";
import { userIdSchema } from "./user";

const repairOrderIdSchema = z.number().positive().int("Por favor, insira um ID válido.");
const repairOrderGcafIdSchema = z.number().positive().int("Por favor, insira um ID GCAF válido.");
const repairOrderKilometersSchema = z.number().positive().int("Por favor, insira um valor válido para quilometragem.");
const repairOrderStatusSchema = z.enum(["pending", "revision", "approved", "partial_approved", "nf_approved", "cancelled"]);
const repairOrderDiscountSchema = z.number().positive().int("Por favor, insira um valor válido para desconto.");

const repairOrderServiceIdSchema = z.number().positive().int("Por favor, insira um ID válido.");

const repairOrderServiceQuantitySchema = z.number().positive().int("Por favor, insira um valor válido para quantidade.");
const repairOrderServiceUnitySchema = z.enum(["part", "labor"]);
const repairOrderServiceTitleSchema = z.string().trim().nonempty("Título é obrigatório");
const repairOrderServiceDurationSchema = z.number().int().positive("Por favor, insira um valor válido para duração."); //TODO: Get informations about valid duration
const repairOrderServicePriceSchema = z.number().positive("Por favor, insira um valor válido para preço.");
const repairOrderServiceTypeSchema = z.enum(["preventive", "corrective"]);
const repairOrderServiceDiscountSchema = z.number().positive("Por favor, insira um valor válido para desconto.");
const repairOrderServiceStatusSchema = z.enum(["pending", "approved", "cancelled"]);
const repairOrderServicePhotoSchema = z.string().trim().optional();

const repairOrderServiceSchema = z.object({
  id: repairOrderServiceIdSchema,
  item: itemIdSchema, // TODO: Create item schema
  quantity: repairOrderServiceQuantitySchema,
  unity: repairOrderServiceUnitySchema,
  title: repairOrderServiceTitleSchema,
  duration: repairOrderServiceDurationSchema,
  price: repairOrderServicePriceSchema,
  type: repairOrderServiceTypeSchema,
  discount: repairOrderServiceDiscountSchema,
  status: repairOrderServiceStatusSchema,
  photo: repairOrderServicePhotoSchema,
})

const repairOrderServicesSchema = z.array(repairOrderServiceSchema);

export const repairOrderSchema = z.object({
  id: repairOrderIdSchema,
  gcaf_id: repairOrderGcafIdSchema,
  user_id: userIdSchema,
  base_id: baseIdSchema, //TODO: Create base schema
  vehicle_id: vehicleIdSchema, //TODO: Create vehicle schema (PLATE)
  kilometers: repairOrderKilometersSchema,
  status: repairOrderStatusSchema,
  observations: z.string().trim().optional(),
  discount: repairOrderDiscountSchema,
  services: repairOrderServicesSchema,
  created_at: z.date(),
  updated_at: z.date(),
});
