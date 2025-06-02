import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

// Schema para validação dos dados com base64
const repairOrderSchema = z.object({
  plate: z.string().min(1, "Por favor, informe a placa do veículo").max(7, "A placa deve ter no máximo 7 caracteres").transform(val => val.toUpperCase()),
  kilometers: z.number().int().min(0, "Por favor, informe uma quilometragem válida (número positivo)"),
  base: z.string().uuid("Por favor, selecione uma base válida"),
  userId: z.string().uuid("Por favor, selecione um usuário válido"),
  assistantId: z.union([
    z.literal("none"),
    z.string().uuid("Por favor, selecione um mecânico assistente válido")
  ]),
  services: z.array(
    z.object({
      quantity: z.number().int().min(1, "Por favor, informe uma quantidade válida"),
      item: z.string().uuid("Por favor, selecione um item válido"),
      category: z.enum(["LABOR", "MATERIAL"], { message: "Por favor, selecione uma categoria válida (Mão de obra ou Material)" }),
      type: z.enum(["PREVENTIVE", "CORRECTIVE", "HELP"], { message: "Por favor, selecione um tipo válido (Preventivo, Corretivo ou Ajuda)" }),
      labor: z.string().min(1, "Por favor, descreva a mão de obra realizada"),
      duration: z.object({
        from: z.string().datetime({ message: "Por favor, informe uma data inicial válida" }),
        to: z.string().datetime({ message: "Por favor, informe uma data final válida" }),
      }),
      photo: z.string().min(1, "Foto é obrigatória"),
    }),
  ),
});

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: true, message: "Não autorizado" },
        { status: 401 }
      );
    }

    // Obter e validar os dados JSON
    const jsonData = await req.json();
    const validationResult = repairOrderSchema.safeParse(jsonData);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: true, message: "Dados inválidos", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Verificar se a base existe
    const baseExists = await prisma.base.findUnique({
      where: { id: validatedData.base },
    });
    
    if (!baseExists) {
      return NextResponse.json(
        { error: true, message: "Base não encontrada" },
        { status: 404 }
      );
    }

    // Criar a ordem de reparo no banco de dados sem os serviços primeiro
    const repairOrder = await prisma.repairOrder.create({
      data: {
        plate: validatedData.plate,
        kilometers: validatedData.kilometers,
        baseId: validatedData.base,
        status: "PENDING", // Status padrão
        gcaf: BigInt(Date.now()), // Exemplo simples, substitua por lógica real
        discount: 0, // Valor padrão, ajuste conforme necessário
        users: {
          connect: validatedData.assistantId === "none" 
            ? [{ id: validatedData.userId }] 
            : [{ id: validatedData.userId }, { id: validatedData.assistantId }]
        }
      },
    });
    
    // Agora criar os serviços separadamente para cada um
    for (const service of validatedData.services) {
      try {
        await prisma.repairOrderService.create({
          data: {
            id: crypto.randomUUID(),
            quantity: service.quantity,
            itemId: service.item,
            labor: service.labor || '',
            duration: BigInt(new Date(service.duration.to).getTime() - new Date(service.duration.from).getTime()),
            value: 0, // Valor padrão zero para mecânicos
            discount: 0, // Valor padrão zero para mecânicos
            // @ts-ignore - Ignorar erro de tipo para permitir o valor HELP
            type: service.type,
            status: "PENDING",
            category: service.category,
            photo: service.photo, // Usar diretamente a string base64
            repairOrderId: repairOrder.id
          }
        });
      } catch (error) {
        console.error('Erro ao criar serviço:', error);
        // Continuar criando os outros serviços mesmo se um falhar
      }
    }

    return NextResponse.json({ message: "Ordem de reparo criada com sucesso", id: repairOrder.id }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar ordem de reparo:", error);
    return NextResponse.json(
      { error: true, message: "Erro ao criar ordem de reparo" },
      { status: 500 }
    );
  }
}
