import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";

// Schema para validação da requisição POST
const createRepairOrderServiceSchema = z.object({
  quantity: z.coerce.number().min(1),
  itemId: z.string().min(1, "Item é obrigatório"),
  repairOrderId: z.string().min(1, "Ordem de reparo é obrigatória"),
  category: z.enum(["LABOR", "MATERIAL"]),
  type: z.enum(["PREVENTIVE", "CORRECTIVE", "HELP"]),
  status: z.enum(["PENDING", "APPROVED", "CANCELLED"]).default("PENDING"),
  labor: z.string().optional(),
  value: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
  duration: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }),
});

export async function POST(request: Request) {
  try {
    // Processar dados do formulário
    const formData = await request.formData();
    
    // Extrair campos do formulário
    const quantity = formData.get("quantity") ? Number(formData.get("quantity")) : undefined;
    const itemId = formData.get("itemId")?.toString();
    const repairOrderId = formData.get("repairOrderId")?.toString();
    const category = formData.get("category")?.toString();
    const type = formData.get("type")?.toString();
    const status = formData.get("status")?.toString() || "PENDING";
    const labor = formData.get("labor")?.toString();
    const value = formData.get("value") ? Number(formData.get("value")) : 0;
    const discount = formData.get("discount") ? Number(formData.get("discount")) : 0;
    
    // Processar duração (JSON string)
    let durationValue;
    const durationStr = formData.get("duration")?.toString();
    if (durationStr) {
      try {
        const durationObj = JSON.parse(durationStr);
        // Calculate duration in milliseconds (difference between from and to)
        if (durationObj.from && durationObj.to) {
          const fromDate = new Date(durationObj.from);
          const toDate = new Date(durationObj.to);
          durationValue = BigInt(toDate.getTime() - fromDate.getTime());
        }
      } catch (e) {
        return NextResponse.json(
          { error: "Formato de duração inválido" },
          { status: 400 }
        );
      }
    }

    // Processar foto - obrigatória
    const photo = formData.get("photo") as any | null;
    let photoUrl;

    if (photo && photo.size > 0) {
      // Em um ambiente real, você faria upload da foto para um serviço de armazenamento
      // e armazenaria a URL. Aqui, simulamos isso convertendo para base64
      const photoBytes = await photo.arrayBuffer();
      const base64 = Buffer.from(photoBytes).toString('base64');
      const mimeType = photo.type || 'image/jpeg';
      photoUrl = `data:${mimeType};base64,${base64}`;
    } else {
      // Se não há foto, retorna erro
      return NextResponse.json(
        { error: "Foto é obrigatória" },
        { status: 400 }
      );
    }

    // Validar dados
    const result = createRepairOrderServiceSchema.safeParse({
      quantity,
      itemId,
      repairOrderId,
      category,
      type,
      status,
      labor,
      value,
      discount,
      duration: durationStr ? JSON.parse(durationStr) : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.format() },
        { status: 400 }
      );
    }

    // Buscar o item para obter o valor
    const item = await prisma.repairOrderServiceItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 }
      );
    }

    // Criar o serviço
    const newService = await prisma.repairOrderService.create({
      data: {
        quantity: quantity!,
        itemId: itemId!,
        repairOrderId: repairOrderId!,
        category: category as "LABOR" | "MATERIAL",
        type: type as "PREVENTIVE" | "CORRECTIVE" | "HELP",
        labor: labor || "",
        duration: durationValue!,
        value: value, // Usar o valor personalizado do serviço
        discount: discount, // Usar o desconto personalizado do serviço
        status: status as "PENDING" | "APPROVED" | "CANCELLED",
        photo: photoUrl,
      },
      include: {
        item: true,
      },
    });

    // Convert BigInt to string to make it serializable
    const serializedService = JSON.parse(JSON.stringify(
      newService,
      (key, value) => typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json(serializedService, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao criar serviço" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repairOrderId = searchParams.get("repairOrderId");
    
    const where = repairOrderId 
      ? { repairOrderId, deletedAt: null } 
      : { deletedAt: null };
    
    const services = await prisma.repairOrderService.findMany({
      where,
      include: {
        item: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert BigInt to string to make it serializable
    const serializedServices = JSON.parse(JSON.stringify(
      services,
      (key, value) => typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json(serializedServices);
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return NextResponse.json(
      { error: "Erro ao buscar serviços" },
      { status: 500 }
    );
  }
}
