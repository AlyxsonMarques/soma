import { z } from "zod";

export const itemSchema = z.object({
    id: z.number().positive().int("Por favor, insira um ID válido."),
    name: z.string().trim().nonempty("Nome é obrigatório"),
    price: z.number().positive("Por favor, insira um valor válido para preço."),
    
})