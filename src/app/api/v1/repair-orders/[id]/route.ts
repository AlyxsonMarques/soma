import { ERROR_500_NEXT } from "@/errors/500";
import prisma from "@/lib/prisma";
import { repairOrderIdSchema } from "@/types/repair-order";
import { RepairOrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const repairOrderUpdateSchema = z.object({
  gcaf: z.number().int().positive().optional(),
  baseId: z.string().uuid().optional(),
  userIds: z.array(z.string().uuid()).optional(),
  plate: z.string().min(1).max(7).transform(val => val.toUpperCase()).optional(),
  kilometers: z.number().int().nonnegative().optional(),
  status: z.enum([
    "PENDING",
    "REVISION",
    "APPROVED",
    "PARTIALLY_APPROVED",
    "INVOICE_APPROVED",
    "CANCELLED"
  ]).optional(),
  observations: z.string().optional().nullable(),
  discount: z.number().nonnegative().optional(),
  services: z.array(z.object({
    id: z.string().uuid().optional(), // Se fornecido, atualiza o serviço existente
    itemId: z.string().uuid(),
    quantity: z.number().int().positive(),
    labor: z.string().min(1),
    duration: z.number().int().nonnegative(),
    value: z.number().nonnegative(),
    discount: z.number().nonnegative(),
    type: z.enum(["PREVENTIVE", "CORRECTIVE"]),
    status: z.enum(["PENDING", "APPROVED", "CANCELLED"]),
    category: z.enum(["LABOR", "MATERIAL"]),
    photo: z.string().optional().nullable()
  })).optional()
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Verificar se a ordem de reparo existe
    const existingOrder = await prisma.repairOrder.findUnique({
      where: { id: idResult.data },
      include: {
        services: true,
        users: true
      }
    });
    
    if (!existingOrder) {
      return NextResponse.json({ error: true, message: "Ordem de reparo não encontrada" }, { status: 404 });
    }
    
    // Validar o corpo da requisição
    const body = await request.json();
    const validationResult = repairOrderUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: true,
          message: "Dados inválidos",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }
    
    const updateData = validationResult.data;
    
    // Preparar os dados para atualização
    const updateOrderData: any = {};
    
    // Copiar campos simples
    if (updateData.gcaf !== undefined) updateOrderData.gcaf = updateData.gcaf;
    if (updateData.baseId !== undefined) updateOrderData.baseId = updateData.baseId;
    if (updateData.plate !== undefined) updateOrderData.plate = updateData.plate.toUpperCase();
    if (updateData.kilometers !== undefined) updateOrderData.kilometers = updateData.kilometers;
    if (updateData.status !== undefined) updateOrderData.status = updateData.status;
    if (updateData.observations !== undefined) updateOrderData.observations = updateData.observations;
    if (updateData.discount !== undefined) updateOrderData.discount = updateData.discount;
    
    // Atualizar usuários relacionados (sempre tratar este campo, mesmo quando vazio)
    if (updateData.userIds !== undefined) {
      // Desconectar todos os usuários existentes
      updateOrderData.users = {
        disconnect: existingOrder.users.map(user => ({ id: user.id })),
      };
      
      // Conectar os novos usuários (se houver)
      if (updateData.userIds.length > 0) {
        updateOrderData.users.connect = updateData.userIds.map(userId => ({ id: userId }));
      }
    }
    
    // Atualizar a ordem de reparo
    const updatedOrder = await prisma.repairOrder.update({
      where: { id: idResult.data },
      data: updateOrderData,
      include: {
        base: true,
        users: true,
        services: {
          include: {
            item: true
          }
        }
      }
    });
    
    // Atualizar ou criar serviços se fornecidos
    if (updateData.services && updateData.services.length > 0) {
      // Processar cada serviço
      for (const serviceData of updateData.services) {
        if (serviceData.id) {
          // Atualizar serviço existente
          await prisma.repairOrderService.update({
            where: { id: serviceData.id },
            data: {
              itemId: serviceData.itemId,
              quantity: serviceData.quantity,
              labor: serviceData.labor,
              duration: BigInt(serviceData.duration),
              value: serviceData.value,
              discount: serviceData.discount,
              type: serviceData.type,
              status: serviceData.status,
              category: serviceData.category,
              photo: serviceData.photo
            }
          });
        } else {
          // Criar novo serviço
          await prisma.repairOrderService.create({
            data: {
              itemId: serviceData.itemId,
              quantity: serviceData.quantity,
              labor: serviceData.labor,
              duration: BigInt(serviceData.duration),
              value: serviceData.value,
              discount: serviceData.discount,
              type: serviceData.type,
              status: serviceData.status,
              category: serviceData.category,
              photo: serviceData.photo,
              repairOrderId: id
            }
          });
        }
      }
    }
    
    // Buscar a ordem atualizada com todos os relacionamentos
    const finalOrder = await prisma.repairOrder.findUnique({
      where: { id },
      include: {
        base: true,
        users: true,
        services: {
          include: {
            item: true
          }
        }
      }
    });
    
    // Serializar a resposta para lidar com BigInt
    const serializedResponse = {
      ...finalOrder,
      gcaf: finalOrder?.gcaf?.toString() ?? null,
      services: finalOrder?.services.map(service => ({
        ...service,
        duration: service.duration.toString()
      })),
      message: "Ordem de reparo atualizada com sucesso"
    };
    
    return NextResponse.json(serializedResponse);
  } catch (error) {
    console.error("Erro ao atualizar ordem de reparo:", error);
    return ERROR_500_NEXT;
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

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
        { error: true, message: "Ordem de reparo não encontrada" },
        { status: 404 }
      );
    }

    // Serializar a resposta para lidar com BigInt
    const serializedResponse = {
      ...repairOrder,
      gcaf: repairOrder?.gcaf?.toString() ?? null,
      services: repairOrder?.services.map(service => ({
        ...service,
        duration: service.duration ? service.duration.toString() : null
      })),
    };

    return NextResponse.json(serializedResponse);
  } catch (error) {
    console.error("Erro ao buscar ordem de reparo:", error);
    return ERROR_500_NEXT;
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const existingOrder = await prisma.repairOrder.findUnique({
      where: { id: idResult.data },
    });

    if (!existingOrder) {
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