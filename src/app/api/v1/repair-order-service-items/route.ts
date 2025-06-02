import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const itemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  value: z.coerce.number().min(0, "Valor deve ser maior ou igual a 0").optional().default(0),
  baseId: z.string().min(1, "Base é obrigatória"),
});

export async function GET() {
  const repairOrderServiceItems = await prisma.repairOrderServiceItem.findMany({
    include: {
      base: true,
    },
  });
  return NextResponse.json(repairOrderServiceItems);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validar os dados recebidos
    const validationResult = itemSchema.safeParse(body);
    
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
    
    // Verificar se a base existe
    const baseExists = await prisma.base.findUnique({
      where: { id: validationResult.data.baseId },
    });
    
    if (!baseExists) {
      return NextResponse.json(
        { error: true, message: "Base não encontrada" },
        { status: 404 }
      );
    }
    
    // Criar o novo item
    const newItem = await prisma.repairOrderServiceItem.create({
      data: {
        name: validationResult.data.name,
        value: validationResult.data.value ?? 0, // Garante que o valor seja 0 se não for fornecido
        baseId: validationResult.data.baseId,
      },
      include: {
        base: true,
      },
    });
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar item:", error);
    return NextResponse.json(
      { error: true, message: "Erro ao criar o item" },
      { status: 500 }
    );
  }
}
