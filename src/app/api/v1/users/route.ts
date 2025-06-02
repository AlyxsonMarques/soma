import prisma from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      cpf: true,
      email: true,
      type: true,
      status: true,
      birthDate: true,
      assistant: true,
      observations: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  });

  return NextResponse.json(users);
}

// Schema de validação para criação de usuários
const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  cpf: z.string().min(11, "CPF deve ter pelo menos 11 caracteres"),
  type: z.enum(["MECHANIC", "BUDGETIST"], {
    errorMap: () => ({ message: "Tipo deve ser MECHANIC ou BUDGETIST" }),
  }),
  birthDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "Data de nascimento inválida",
  }),
  assistant: z.boolean(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados de entrada
    const validationResult = createUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { password, ...userData } = validationResult.data;
    
    // Verificar se já existe um usuário com o mesmo email ou CPF
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { cpf: userData.cpf }
        ]
      }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe um usuário com este email ou CPF" },
        { status: 409 }
      );
    }
    
    // Criar o usuário
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        birthDate: new Date(userData.birthDate),
        password, // Em produção, deveria ser hasheada
        status: "PENDING" // Valores válidos: APPROVED, REPROVED, PENDING
      },
      select: {
        id: true,
        name: true,
        cpf: true,
        email: true,
        type: true,
        status: true,
        birthDate: true,
        assistant: true,
        observations: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
