import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { userIdSchema, userStatusSchema } from "@/types/user"; // Ajuste o caminho de importação
import { ERROR_500_NEXT } from "@/errors/500";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestBody = await request.json();

    const { status } = requestBody;
    const { id } =  await params;

    const idResult = userIdSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json(
        { 
          error: true, 
          message: idResult.error.issues[0].message || "ID inválido" 
        },
        { status: 400 }
      );
    }

    const statusResult = userStatusSchema.safeParse(status);
    if (!statusResult.success) {
      return NextResponse.json(
        { 
          error: true, 
          message: statusResult.error.issues[0].message || "Status inválido. Deve ser 'approved', 'reproved' ou 'pending'" 
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: idResult.data }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: true, message: "Usuário não encontrado" },
        { status: 404 }
      );
    }    
 
    const updateUser = await prisma.user.update({
      where: { id: idResult.data },
      data: { status: statusResult.data }
    });

    return NextResponse.json({
      success: true,
      message: "Status do usuário atualizado com sucesso",
      data: updateUser
    });
    
  } catch (error) {
    console.error("Erro ao atualizar status do usuário:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint failed')) {
        return NextResponse.json(
          { error: true, message: "Violação de restrição de unicidade" },
          { status: 409 }
        );
      }
      
      if (error.message.includes('Foreign key constraint failed')) {
        return NextResponse.json(
          { error: true, message: "Violação de chave estrangeira" },
          { status: 400 }
        );
      }
    }
    
    return ERROR_500_NEXT
  }
}

export async function DELETE(_: NextResponse, { params }: {params: { id: string }}) {
  try {

    const { id } =  await params;

        
    if (!id) {
      return NextResponse.json(
        { error: true, message: "Preencha o parâmetro obrigatório: id"},
        { status: 400 }
      );
    }

    const idResult = userIdSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json(
        { 
          error: true, 
          message: idResult.error.issues[0].message || "ID inválido" 
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: idResult.data }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: true, message: "Usuário não encontrado" },
        { status: 404 }
      );
    }    

    const response = await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({message: "Usuário excluido com sucesso", response}, { status: 200 });

  } catch(error) {
    console.error(error);
    return ERROR_500_NEXT
  }
}