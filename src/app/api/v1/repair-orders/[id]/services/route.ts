import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema para validação dos dados
const serviceSchema = z.object({
  quantity: z.coerce.number().min(1, "Quantidade deve ser maior que 0"),
  itemId: z.string().min(1, "Item é obrigatório"),
  category: z.enum(["LABOR", "MATERIAL"]),
  type: z.enum(["PREVENTIVE", "CORRECTIVE", "HELP"]),
  status: z.enum(["PENDING", "APPROVED", "CANCELLED"]),
  labor: z.string().optional(),
  value: z.coerce.number().min(0, "Valor deve ser maior ou igual a 0"),
  discount: z.coerce.number().min(0, "Desconto deve ser maior ou igual a 0"),
  duration: z.object({
    from: z.string(),
    to: z.string(),
  }),
});

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Extrair e aguardar o ID da URL
  const { id } = await context.params;
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: true, message: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se a ordem de reparo existe
    const repairOrder = await prisma.repairOrder.findUnique({
      where: { id },
    });

    if (!repairOrder) {
      return NextResponse.json(
        { error: true, message: "Ordem de reparo não encontrada" },
        { status: 404 }
      );
    }

    // Processar o FormData
    const formData = await request.formData();
    
    // Extrair dados do formulário
    const quantity = formData.get("quantity");
    const itemId = formData.get("itemId") as string;
    const category = formData.get("category") as string;
    const type = formData.get("type") as string;
    const status = formData.get("status") as string;
    const labor = formData.get("labor") as string;
    const value = formData.get("value");
    const discount = formData.get("discount");
    const durationString = formData.get("duration") as string;
    const photo = formData.get("photo") as any;
    
    // Verificar se a foto foi enviada
    if (!photo || photo.size === 0) {
      return NextResponse.json(
        { error: true, message: "Foto é obrigatória" },
        { status: 400 }
      );
    }

    // Converter a foto para base64
    const photoBuffer = await photo.arrayBuffer();
    const photoBase64 = `data:${photo.type};base64,${Buffer.from(photoBuffer).toString('base64')}`;

    // Validar os dados
    let duration;
    try {
      duration = JSON.parse(durationString);
    } catch (error) {
      return NextResponse.json(
        { error: true, message: "Formato de duração inválido" },
        { status: 400 }
      );
    }

    const validationResult = serviceSchema.safeParse({
      quantity,
      itemId,
      category,
      type,
      status,
      labor,
      value,
      discount,
      duration,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: true, 
          message: "Dados inválidos", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // Calcular a duração em milissegundos
    const durationFrom = new Date(duration.from);
    const durationTo = new Date(duration.to);
    const durationMs = durationTo.getTime() - durationFrom.getTime();

    // Criar o serviço
    const service = await prisma.repairOrderService.create({
      data: {
        quantity: Number(quantity),
        itemId,
        repairOrderId: id,
        category: category as any,
        type: type as any,
        status: status as any,
        labor,
        value: Number(value),
        discount: Number(discount),
        duration: BigInt(durationMs),
        photo: photoBase64,
      },
    });

    // Converter o serviço para um objeto serializável (sem BigInt)
    const serializedService = {
      ...service,
      duration: Number(service.duration),
      value: Number(service.value),
      discount: Number(service.discount),
    };
    
    return NextResponse.json({
      error: false,
      message: "Serviço adicionado com sucesso",
      data: serializedService,
    });
  } catch (error) {
    console.error("Erro ao adicionar serviço:", error);
    return NextResponse.json(
      { error: true, message: "Erro ao adicionar serviço" },
      { status: 500 }
    );
  }
}
