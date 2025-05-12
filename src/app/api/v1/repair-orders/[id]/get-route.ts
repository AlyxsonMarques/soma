import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Buscar a ordem de reparo com todos os dados relacionados
    const repairOrder = await prisma.repairOrder.findUnique({
      where: {
        id,
      },
      include: {
        base: true,
        users: true,
        services: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!repairOrder) {
      return NextResponse.json(
        { error: "Ordem de reparo não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(repairOrder);
  } catch (error) {
    console.error("Erro ao buscar ordem de reparo:", error);
    return NextResponse.json(
      { error: "Erro ao buscar ordem de reparo" },
      { status: 500 }
    );
  }
}
