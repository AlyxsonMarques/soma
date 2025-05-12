import { ERROR_500_NEXT } from "@/errors/500";
import prisma from "@/lib/prisma";
import { userIdSchema, userStatusSchema } from "@/types/user"; // Ajuste o caminho de importação
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  cpf: z.string().optional(),
  type: z.enum(["MECHANIC", "BUDGET_ANALYST"]).optional(),
  birthDate: z.string().optional(),
  assistant: z.boolean().optional(),
  password: z.string().optional(),
  status: userStatusSchema.optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requestBody = await request.json();
    const { id } = await params;

    const idResult = userIdSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json(
        {
          error: true,
          message: idResult.error.issues[0].message || "ID inválido",
        },
        { status: 400 },
      );
    }

    // Validar todos os campos de atualização
    const updateResult = userUpdateSchema.safeParse(requestBody);
    if (!updateResult.success) {
      return NextResponse.json(
        {
          error: true,
          message: "Dados inválidos para atualização",
          details: updateResult.error.format(),
        },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: idResult.data },
    });

    if (!existingUser) {
      return NextResponse.json({ error: true, message: "Usuário não encontrado" }, { status: 404 });
    }

    // Preparar os dados para atualização
    const updateData = { ...updateResult.data };
    
    // Se tiver uma nova senha, fazer hash dela
    if (updateData.password && updateData.password.trim() !== "") {
      // Em um sistema real, você faria o hash da senha aqui
      // updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      // Se não tiver senha, remover do objeto para não atualizar
      delete updateData.password;
    }

    // Converter a data de nascimento para o formato correto se fornecida
    if (updateData.birthDate) {
      updateData.birthDate = new Date(updateData.birthDate);
    }
    
    // Converter o tipo para o formato esperado pelo Prisma
    if (updateData.type) {
      // Garantir que o tipo seja um dos valores válidos
      if (updateData.type !== "MECHANIC" && updateData.type !== "BUDGET_ANALYST") {
        return NextResponse.json({ error: true, message: "Tipo de usuário inválido" }, { status: 400 });
      }
    }
    
    // Remover propriedades que podem causar problemas de tipagem
    // e deixar o Prisma lidar com a conversão
    const updateUser = await prisma.user.update({
      where: { id: idResult.data },
      data: updateData as any, // Usar 'any' para evitar problemas de tipagem
    });

    return NextResponse.json({
      ...updateUser,
      message: "Usuário atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar status do usuário:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unique constraint failed")) {
        return NextResponse.json({ error: true, message: "Violação de restrição de unicidade" }, { status: 409 });
      }

      if (error.message.includes("Foreign key constraint failed")) {
        return NextResponse.json({ error: true, message: "Violação de chave estrangeira" }, { status: 400 });
      }
    }

    return ERROR_500_NEXT;
  }
}

export async function DELETE(_: NextResponse, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: true, message: "Preencha o parâmetro obrigatório: id" }, { status: 400 });
    }

    const idResult = userIdSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json(
        {
          error: true,
          message: idResult.error.issues[0].message || "ID inválido",
        },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: idResult.data },
    });

    if (!existingUser) {
      return NextResponse.json({ error: true, message: "Usuário não encontrado" }, { status: 404 });
    }

    const response = await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Usuário excluido com sucesso", response }, { status: 200 });
  } catch (error) {
    console.error(error);
    return ERROR_500_NEXT;
  }
}
