import { ERROR_500_NEXT } from "@/errors/500";
import prisma from "@/lib/prisma";
import { repairOrderIdSchema } from "@/types/repair-order";
import { NextResponse } from "next/server";

export async function DELETE(_: NextResponse, { params }: { params: { id: string } }) {
    try {
      const { id } = await params;
  
      if (!id) {
        return NextResponse.json({ error: true, message: "Preencha o parâmetro obrigatório: id" }, { status: 400 });
      }
  
      const idResult = repairOrderIdSchema.safeParse(id);
      if (!idResult.success) {
        return NextResponse.json(
          {
            error: true,
            message: idResult.error.issues[0].message || "ID inválido",
          },
          { status: 400 },
        );
      }
  
      const existingUser = await prisma.repairOrder.findUnique({
        where: { id: idResult.data },
      });
  
      if (!existingUser) {
        return NextResponse.json({ error: true, message: "Ordem de reparo não encontrada" }, { status: 404 });
      }
  
      // Primeiro, deletar todos os serviços associados à ordem de reparo
      await prisma.repairOrderService.deleteMany({
        where: { repairOrderId: id },
      });

      // Depois, deletar a ordem de reparo
      const response = await prisma.repairOrder.delete({
        where: { id },
      });
  
      // Transformar o objeto response para lidar com BigInt
      const serializedResponse = {
        ...response,
        gcaf: response.gcaf?.toString() ?? null,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
      
      return NextResponse.json({ message: "Ordem de reparo excluida com sucesso", response: serializedResponse }, { status: 200 });
    } catch (error) {
      console.error(error);
      return ERROR_500_NEXT;
    }
  }