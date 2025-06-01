import { z } from "zod";

export const repairOrderServiceIdSchema = z.string().uuid("Por favor, insira um ID válido.");

export const repairOrderServiceQuantitySchema = z
  .number({
    required_error: "Por favor, insira uma quantidade válida",
  })
  .positive("Por favor, insira uma quantidade válida")
  .int("Por favor, insira uma quantidade válida");

export const repairOrderServiceLaborSchema = z
  .string({
    required_error: "Por favor, insira uma descrição de mão de obra",
  })
  .trim()
  .nonempty("Por favor, insira uma descrição de mão de obra");

export const repairOrderServiceDurationSchema = z.object(
  {
    from: z.date({ message: "Por favor, insira uma data de início válida" }),
    to: z.date({ message: "Por favor, insira uma data de término válida" }),
  },
  {
    message: "Por favor, insira uma duração válida",
  },
);

export const repairOrderServicePhotoSchema = z.instanceof(File, { message: "A foto é obrigatória" });

export const repairOrderServiceValueSchema = z.number().positive().int("Por favor, insira um valor válido");

export const repairOrderServiceDiscountSchema = z.number().positive().int("Por favor, insira um desconto válido");

export const repairOrderServiceCategorySchema = z.enum(["LABOR", "MATERIAL"], {
  required_error: "Por favor, insira uma categoria válida",
});

export const repairOrderServiceTypeSchema = z.enum(["PREVENTIVE", "CORRECTIVE", "HELP"], {
  required_error: "Por favor, insira um tipo válido",
});

export const repairOrderServiceStatusSchema = z.enum(["PENDING", "APPROVED", "CANCELLED"], {
  required_error: "Por favor, insira um status válido",
});

export const repairOrderServiceCreatedAtSchema = z.date();

export const repairOrderServiceUpdatedAtSchema = z.date();
