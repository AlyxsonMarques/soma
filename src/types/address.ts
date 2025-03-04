import { z } from "zod";

export const addressSchema = z.object({
  id: z.number().positive().int("Por favor, insira um ID válido."),
  street: z.string().trim().nonempty("Rua é obrigatória"),
  number: z.number().positive().int("Por favor, insira um número válido"),
  complement: z.string().trim().optional(),
  neighborhood: z.string().trim().nonempty("Bairro é obrigatório"),
  city: z.string().trim().nonempty("Cidade é obrigatória"),
  state: z.string().trim().nonempty("Estado é obrigatório"),
  zipCode: z.string().trim().nonempty("CEP é obrigatório"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AddressSchema = z.infer<typeof addressSchema>;
