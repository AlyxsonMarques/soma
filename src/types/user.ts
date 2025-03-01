import { z } from "zod";

const userTypeSchema = z.enum(["mechanic", "budgetist"], {
  required_error: "Por favor, selecione seu tipo de usuário.",
});

export type UserEnumType = z.infer<typeof userTypeSchema>;

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

export const userSchema = z.object({
  id: z.string(),
  userType: userTypeSchema,
  name: userNameSchema,
  email: userEmailSchema,
  password: userPasswordSchema,
  birthDate: userBirthDateSchema,
  cpf: userCPFSchema,
  base: z.string(),
  assistant: z.boolean().default(false),
  observations: z.string().trim().optional(),
  firm: z.string(),
});

export type UserType = z.infer<typeof userSchema>;

export const userLoginSchema = z.object({
  email: userEmailSchema,
  password: z.string().nonempty("Por favor, insira sua senha."),
});

export type UserLogin = z.infer<typeof userLoginSchema>;

export const userRegisterSchema = z
  .object({
    userType: userTypeSchema,
    name: userNameSchema,
    email: userEmailSchema,
    password: userPasswordSchema,
    confirmPassword: userPasswordSchema,
    birthDate: userBirthDateSchema,
    cpf: userCPFSchema,
    base: z.string(),
    firm: z.string(),
    assistant: z.boolean().default(false),
    observations: z.string().trim().optional(),
  })
  .superRefine(({ password, confirmPassword, base, firm, userType }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As senhas não coincidem.",
        path: ["confirmPassword"],
      });
    }

    if (userType === "mechanic" && !base) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor, selecione sua base.",
        path: ["base"],
      });
    } else if (userType === "budgetist" && !firm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor, selecione sua firma.",
        path: ["firm"],
      });
    }
  });

export type UserRegister = z.infer<typeof userRegisterSchema>;
