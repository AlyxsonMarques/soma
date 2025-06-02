import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const baseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().min(1, "Rua é obrigatória"),
    number: z.coerce.number().int().min(0, "Número deve ser maior ou igual a 0"),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().min(1, "Estado é obrigatório").max(2, "Estado deve ter no máximo 2 caracteres"),
    zipCode: z.string().min(1, "CEP é obrigatório").max(8, "CEP deve ter no máximo 8 caracteres")
  })
});

export async function GET() {
  const bases = await prisma.base.findMany({
    include: {
      address: true,
    },
  });
  return NextResponse.json(bases);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validar os dados recebidos
    const validationResult = baseSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: true, 
          message: "Dados inválidos", 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }
    
    // Verificar se já existe uma base com o mesmo nome
    const existingBase = await prisma.base.findFirst({
      where: { name: validationResult.data.name },
    });
    
    if (existingBase) {
      return NextResponse.json(
        { error: true, message: "Já existe uma base com este nome" },
        { status: 409 }
      );
    }
    
    // Criar a nova base com seu endereço
    const newBase = await prisma.base.create({
      data: {
        name: validationResult.data.name,
        phone: validationResult.data.phone || "",
        address: {
          create: {
            street: validationResult.data.address.street,
            number: validationResult.data.address.number,
            complement: validationResult.data.address.complement || "",
            neighborhood: validationResult.data.address.neighborhood,
            city: validationResult.data.address.city,
            state: validationResult.data.address.state,
            zipCode: validationResult.data.address.zipCode
          }
        }
      },
      include: {
        address: true
      }
    });
    
    return NextResponse.json(newBase, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar base:", error);
    return NextResponse.json(
      { error: true, message: "Erro ao criar a base" },
      { status: 500 }
    );
  }
}
