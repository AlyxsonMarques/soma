import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

// Schema para validação da requisição PATCH
const patchRepairOrderServiceSchema = z.object({
  quantity: z.coerce.number().min(1).optional(),
  itemId: z.string().optional(),
  category: z.enum(["LABOR", "PART", "SERVICE"]).optional(),
  type: z.enum(["PREVENTIVE", "CORRECTIVE", "PREDICTIVE"]).optional(),
  labor: z.string().optional(),
  duration: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Verificar se o serviço existe
    const existingService = await prisma.repairOrderService.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    // Processar dados do formulário
    const formData = await request.formData();
    
    // Extrair campos do formulário
    const quantity = formData.get("quantity") ? Number(formData.get("quantity")) : undefined;
    const itemId = formData.get("itemId")?.toString();
    const category = formData.get("category")?.toString();
    const type = formData.get("type")?.toString();
    const labor = formData.get("labor")?.toString();
    
    // Processar duração (JSON string)
    let duration;
    const durationStr = formData.get("duration")?.toString();
    if (durationStr) {
      try {
        duration = JSON.parse(durationStr);
      } catch (e) {
        return NextResponse.json(
          { error: "Formato de duração inválido" },
          { status: 400 }
        );
      }
    }

    // Processar foto
    const photo = formData.get("photo") as File | null;
    let photoUrl = undefined;

    if (photo) {
      // Em um ambiente real, você faria upload da foto para um serviço de armazenamento
      // e armazenaria a URL. Aqui, simulamos isso mantendo a URL existente.
      photoUrl = URL.createObjectURL(photo);
    }

    // Validar dados
    const result = patchRepairOrderServiceSchema.safeParse({
      quantity,
      itemId,
      category,
      type,
      labor,
      duration,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.format() },
        { status: 400 }
      );
    }

    // Atualizar o serviço
    const updatedService = await prisma.repairOrderService.update({
      where: { id },
      data: {
        quantity: quantity,
        itemId: itemId,
        category: category as "LABOR" | "PART" | "SERVICE",
        type: type as "PREVENTIVE" | "CORRECTIVE" | "PREDICTIVE",
        labor: labor,
        duration: duration ? {
          from: new Date(duration.from),
          to: new Date(duration.to),
        } : undefined,
        photo: photoUrl,
      },
      include: {
        item: true,
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar serviço" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Verificar se o serviço existe
    const existingService = await prisma.repairOrderService.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    // Excluir o serviço
    await prisma.repairOrderService.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    return NextResponse.json(
      { error: "Erro ao excluir serviço" },
      { status: 500 }
    );
  }
}
