import { z } from "zod";

export const userIdSchema = z.number().positive().int("Por favor, insira um ID válido.");

const userTypeSchema = z.enum(["mechanic", "budgetist"], {
  required_error: "Por favor, selecione seu tipo de usuário.",
});

const userStatusSchema = z.enum(["approved", "reproved", "pending"], {
  required_error: "Por favor, selecione o status do usuário.",
});

export type UserEnumType = z.infer<typeof userTypeSchema>;
export type UserStatusEnumType = z.infer<typeof userStatusSchema>;
const userNameSchema = z
  .string()
  .nonempty("Por favor, insira seu nome.")
  .transform((name) => {
    return name
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  });

const userEmailSchema = z
  .string()
  .email({
    message: "Por favor, insira um email válido.",
  })
  .nonempty("Por favor, insira seu email.")
  .toLowerCase();

const userPasswordSchema = z
  .string()
  .min(8, {
    message: "A senha deve ter no mínimo 8 caracteres.",
  })
  .regex(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: "A senha deve conter pelo menos uma letra e um número.",
  });

const userBirthDateSchema = z.date({
  required_error: "Por favor, insira sua data de nascimento.",
});

const userCPFSchema = z
  .string()
  .length(11, {
    message: "Por favor, insira seu CPF.",
  })
  .refine(
    (cpf) => {
      // Remove non-numeric characters
      const cpfWithoutLetters = cpf.replace(/\D/g, "");

      // Check if all digits are the same
      if (/^(\d)\1{10}$/.test(cpfWithoutLetters)) return false;

      // Validate first digit
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += Number.parseInt(cpfWithoutLetters.charAt(i)) * (10 - i);
      }
      let digit = 11 - (sum % 11);
      if (digit >= 10) digit = 0;
      if (digit !== Number.parseInt(cpfWithoutLetters.charAt(9))) return false;

      // Validate second digit
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += Number.parseInt(cpfWithoutLetters.charAt(i)) * (11 - i);
      }
      digit = 11 - (sum % 11);
      if (digit >= 10) digit = 0;
      if (digit !== Number.parseInt(cpfWithoutLetters.charAt(10))) return false;

      return true;
    },
    {
      message: "CPF inválido.",
    },
  );

const userBaseSchema = z.number().positive().int("Por favor, insira um ID de base válido.");

const userAssistantSchema = z.boolean().default(false);

const userObservationsSchema = z.string().trim().optional();

const userCreatedAtSchema = z.date();

const userUpdatedAtSchema = z.date();

export const userSchema = z.object({
  id: userIdSchema,
  name: userNameSchema,
  cpf: userCPFSchema,
  email: userEmailSchema,
  password: userPasswordSchema,
  type: userTypeSchema,
  status: userStatusSchema,
  birthDate: userBirthDateSchema,
  bases: z.array(userBaseSchema),
  assistant: userAssistantSchema,
  observations: userObservationsSchema,
  createdAt: userCreatedAtSchema,
  updatedAt: userUpdatedAtSchema,
});

export type UserType = z.infer<typeof userSchema>;

export const userLoginSchema = z.object({
  email: userEmailSchema,
  password: userPasswordSchema,
});

export type UserLogin = z.infer<typeof userLoginSchema>;

export const userRegisterSchema = z
  .object({
    type: userTypeSchema,
    name: userNameSchema,
    email: userEmailSchema,
    password: userPasswordSchema,
    confirmPassword: userPasswordSchema,
    birthDate: userBirthDateSchema,
    cpf: userCPFSchema,
    bases: z.array(userBaseSchema),
    assistant: userAssistantSchema,
    observations: z.string().trim().optional(),
  })
  .superRefine(({ password, confirmPassword, bases, type }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As senhas não coincidem.",
        path: ["confirmPassword"],
      });
    }

    if (type === "mechanic" && !bases.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor, selecione sua base.",
        path: ["bases"],
      });
    }
  });

export type UserRegister = z.infer<typeof userRegisterSchema>;

export const userAPISchema = z.object({
  id: userIdSchema,
  status: userStatusSchema,
  type: userTypeSchema,
  name: userNameSchema,
  email: userEmailSchema,
  birthDate: userBirthDateSchema,
  cpf: userCPFSchema,
  bases: z.array(userBaseSchema),
  assistant: userAssistantSchema,
  observations: userObservationsSchema,
  createdAt: userCreatedAtSchema,
  updatedAt: userUpdatedAtSchema,
});

export type UserAPISchema = z.infer<typeof userAPISchema>;
