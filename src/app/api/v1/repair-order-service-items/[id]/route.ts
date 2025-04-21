import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ERROR_500_NEXT } from "@/errors/500";
import { repairOrderServiceIdSchema } from "@/types/repair-order-service";

export async function DELETE(_: NextRequest, { params }: { params: { id: string }}) {
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
        { status: 400 }
      );
    }

    // Verifica se o item existe
    const existingItem = await prisma.repairOrderServiceItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 }
      );
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
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar item:", error);
    return NextResponse.json(ERROR_500_NEXT, { status: 500 });
  }
}