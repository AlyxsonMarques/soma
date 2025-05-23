import { ERROR_500_NEXT } from "@/errors/500";
import prisma from "@/lib/prisma";
import { repairOrderServiceIdSchema } from "@/types/repair-order-service";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const itemUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  value: z.number().positive().optional(),
  baseId: z.string().uuid().optional(),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const validatedId = repairOrderServiceIdSchema.safeParse(id);

    if (!validatedId.success) {
      return NextResponse.json(
        {
          message: "Não foi possível validar o ID",
          error: true,
          details: validatedId.error.errors,
        },
        { status: 400 },
      );
    }

    // Buscar o item com a base relacionada
    const item = await prisma.repairOrderServiceItem.findUnique({
      where: { id },
      include: {
        base: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: true, message: "Item não encontrado" }, { status: 404 });
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar item:", error);
    return NextResponse.json(ERROR_500_NEXT, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const validatedId = repairOrderServiceIdSchema.safeParse(id);

    if (!validatedId.success) {
      return NextResponse.json(
        {
          message: "Não foi possível validar o ID",
          error: true,
          details: validatedId.error.errors,
        },
        { status: 400 },
      );
    }

    // Validar o corpo da requisição
    const body = await request.json();
    const validatedData = itemUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          message: "Dados inválidos",
          error: true,
          details: validatedData.error.format(),
        },
        { status: 400 },
      );
    }

    // Verificar se o item existe
    const existingItem = await prisma.repairOrderServiceItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: true, message: "Item não encontrado" }, { status: 404 });
    }

    // Verificar se a base existe, se o baseId foi fornecido
    if (validatedData.data.baseId) {
      const baseExists = await prisma.base.findUnique({
        where: { id: validatedData.data.baseId },
      });

      if (!baseExists) {
        return NextResponse.json({ error: true, message: "Base não encontrada" }, { status: 404 });
      }
    }

    // Atualizar o item
    const updatedItem = await prisma.repairOrderServiceItem.update({
      where: { id },
      data: validatedData.data,
      include: {
        base: true,
      },
    });

    return NextResponse.json({
      ...updatedItem,
      message: "Item atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    return NextResponse.json(ERROR_500_NEXT, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const validatedData = repairOrderServiceIdSchema.safeParse(id);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          message: "Não foi possível validar o ID",
          error: true,
          details: validatedData.error.errors,
        },
        { status: 400 },
      );
    }

    // Verifica se o item existe
    const existingItem = await prisma.repairOrderServiceItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
    }

    // Realiza o soft delete (atualiza deletedAt)
    const deletedItem = await prisma.repairOrderServiceItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      {
        message: "Item deletado com sucesso",
        data: deletedItem,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao deletar item:", error);
    return NextResponse.json(ERROR_500_NEXT, { status: 500 });
  }
}
