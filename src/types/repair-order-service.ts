import { z } from "zod";

export const repairOrderServiceIdSchema = z.string().uuid("Por favor, selecione um serviço válido.");

export const repairOrderServiceQuantitySchema = z
  .number({
    required_error: "Por favor, informe a quantidade do serviço",
  })
  .positive("A quantidade deve ser maior que zero")
  .int("A quantidade deve ser um número inteiro");

export const repairOrderServiceLaborSchema = z
  .string({
    required_error: "Por favor, descreva o serviço realizado",
  })
  .trim()
  .nonempty("Por favor, descreva detalhadamente o serviço realizado");

export const repairOrderServiceDurationSchema = z.object(
  {
    from: z.date({ message: "Por favor, selecione a data e hora de início do serviço" }),
    to: z.date({ message: "Por favor, selecione a data e hora de conclusão do serviço" }),
  },
  {
    message: "Por favor, informe o período de execução do serviço",
  },
);

export const repairOrderServicePhotoSchema = z.instanceof(File, { message: "Por favor, adicione uma foto do serviço realizado" }).optional();

export const repairOrderServiceValueSchema = z.number().positive("O valor deve ser maior que zero").int("O valor deve ser um número inteiro");

export const repairOrderServiceDiscountSchema = z.number().nonnegative("O desconto não pode ser negativo").int("O desconto deve ser um número inteiro");

export const repairOrderServiceCategorySchema = z.enum(["LABOR", "MATERIAL"], {
  required_error: "Por favor, selecione se o serviço é de Mão de Obra ou Material",
});

export const repairOrderServiceTypeSchema = z.enum(["PREVENTIVE", "CORRECTIVE", "HELP"], {
  required_error: "Por favor, selecione o tipo de serviço (Preventivo, Corretivo ou Ajuda)",
});

export const repairOrderServiceStatusSchema = z.enum(["PENDING", "APPROVED", "CANCELLED"], {
  required_error: "Por favor, selecione o status do serviço (Pendente, Aprovado ou Cancelado)",
});

export const repairOrderServiceCreatedAtSchema = z.date();

export const repairOrderServiceUpdatedAtSchema = z.date();
