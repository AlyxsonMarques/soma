import prisma from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const baseUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: true, message: "Preencha o parâmetro obrigatório: id" }, { status: 400 });
    }

    const base = await prisma.base.findUnique({
      where: { id },
    });

    if (!base) {
      return NextResponse.json({ error: true, message: "Base não encontrada" }, { status: 404 });
    }

    return NextResponse.json(base, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao buscar base:", error);
    return NextResponse.json(
      { error: true, message: "Oops, ocorreu um erro, tente novamente e aguarde alguns minutos." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: true, message: "Preencha o parâmetro obrigatório: id" }, { status: 400 });
    }

    const body = await request.json();
    const validationResult = baseUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: true, message: "Dados inválidos", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    try {
      const existingBase = await prisma.base.findUnique({
        where: { id },
      });

      if (!existingBase) {
        return NextResponse.json({ error: true, message: "Base não encontrada" }, { status: 404 });
      }

      const updatedBase = await prisma.base.update({
        where: { id },
        data: validationResult.data,
      });

      return NextResponse.json({
        ...updatedBase,
        message: "Base atualizada com sucesso"
      }, { status: 200 });
    } catch (prismaError: any) {
      if (prismaError.code === "P2025") {
        return NextResponse.json({ error: true, message: "Base não encontrada" }, { status: 404 });
      }
      throw prismaError;
    }
  } catch (error: any) {
    console.error("Erro ao atualizar base:", error);
    return NextResponse.json(
      { error: true, message: "Oops, ocorreu um erro, tente novamente e aguarde alguns minutos." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: true, message: "Preencha o parâmetro obrigatório: id" }, { status: 400 });
    }

    try {
      const relatedOrders = await prisma.repairOrder.findMany({
        where: { baseId: id },
        select: { id: true },
      });

      if (relatedOrders.length > 0) {
        return NextResponse.json(
          {
            error: true,
            message: `Não foi possível excluir pois existem ${relatedOrders.length} ordens de reparo relacionadas a base`,
          },
          { status: 409 },
        );
      }

      const response = await prisma.base.delete({
        where: { id },
      });

      return NextResponse.json(response, { status: 200 });
    } catch (prismaError: any) {
      if (prismaError.code === "P2025") {
        return NextResponse.json({ error: true, message: "Não encontrado" }, { status: 404 });
      } else if (prismaError.code === "P2003") {
        return NextResponse.json(
          {
            error: true,
            message: "Essa base possui ordens de reparo relacionadas que precisam ser excluidas primeiro",
          },
          { status: 409 },
        );
      }
      throw prismaError;
    }
  } catch (error: any) {
    console.error("Erro ao deletar recurso:", error);
    return NextResponse.json(
      { error: true, message: "Oops, ocorreu um erro, tente novamente e aguarde alguns minutos." },
      { status: 500 },
    );
  }
}
