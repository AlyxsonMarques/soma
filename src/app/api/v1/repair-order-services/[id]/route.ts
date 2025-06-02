import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";

// Schema para validação da requisição PATCH
const patchRepairOrderServiceSchema = z.object({
  quantity: z.coerce.number().min(1).optional(),
  itemId: z.string().optional(),
  category: z.enum(["LABOR", "MATERIAL"]).optional(),
  type: z.enum(["PREVENTIVE", "CORRECTIVE", "HELP"]).optional(),
  status: z.enum(["PENDING", "APPROVED", "CANCELLED"]).optional(),
  labor: z.string().optional(),
  value: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).optional(),
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
    // Use params.id only after ensuring params is available
    const { id } = await params;
    
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
    const status = formData.get("status")?.toString();
    const labor = formData.get("labor")?.toString();
    const value = formData.get("value") ? Number(formData.get("value")) : undefined;
    const discount = formData.get("discount") ? Number(formData.get("discount")) : undefined;
    
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
    const photoUrl = formData.get("photoUrl")?.toString();
    let finalPhotoUrl;

    if (photo && photo.size > 0) {
      // Em um ambiente real, você faria upload da foto para um serviço de armazenamento
      // e armazenaria a URL. Aqui, simulamos isso convertendo para base64
      const photoBytes = await photo.arrayBuffer();
      const base64 = Buffer.from(photoBytes).toString('base64');
      const mimeType = photo.type || 'image/jpeg';
      finalPhotoUrl = `data:${mimeType};base64,${base64}`;
    } else if (photoUrl) {
      // Se foi enviada uma URL de foto existente
      finalPhotoUrl = photoUrl;
    } else if (existingService.photo) {
      // Se não foi enviada uma nova foto nem URL, mantém a foto atual
      finalPhotoUrl = existingService.photo;
    } else {
      // Se não há foto, retorna erro
      return NextResponse.json(
        { error: "Foto é obrigatória" },
        { status: 400 }
      );
    }

    // Validar dados
    const result = patchRepairOrderServiceSchema.safeParse({
      quantity,
      itemId,
      category,
      type,
      status,
      labor,
      value,
      discount,
      // We're not validating the converted BigInt duration here
      // as it's already been processed
      duration: durationStr ? JSON.parse(durationStr) : undefined,
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
        category: category as "LABOR" | "MATERIAL",
        type: type as "PREVENTIVE" | "CORRECTIVE" | "HELP",
        status: status as "PENDING" | "APPROVED" | "CANCELLED",
        labor: labor,
        value: value !== undefined ? value : undefined,
        discount: discount !== undefined ? discount : undefined,
        duration: durationValue,
        photo: finalPhotoUrl,
      },
      include: {
        item: true,
      },
    });

    // Convert BigInt to string to make it serializable
    const serializedService = JSON.parse(JSON.stringify(
      updatedService,
      (key, value) => typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json(serializedService);
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
    // Use params.id only after ensuring params is available
    const { id } = await params;
    
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
