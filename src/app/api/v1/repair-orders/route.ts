import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { ERROR_500_NEXT } from "@/errors/500";
import prisma from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema para validação de requisições via formData (existente)
const formSchema = z.object({
  plate: z.string().min(1, "Por favor, informe a placa do veículo").max(7, "A placa deve ter no máximo 7 caracteres").transform(val => val.toUpperCase()),
  kilometers: z.number().int().min(0, "Por favor, informe uma quilometragem válida (número positivo)"),
  base: z.string().uuid("Por favor, selecione uma base válida"),
  userId: z.string().uuid("Por favor, selecione um usuário válido"),
  assistantId: z.union([
    z.literal("none"),
    z.string().uuid("Por favor, selecione um mecânico assistente válido")
  ]),
  services: z.array(
    z.object({
      quantity: z.number().int().min(0, "Por favor, informe uma quantidade válida"),
      item: z.string().uuid("Por favor, selecione um item válido"),
      category: z.enum(["LABOR", "MATERIAL"], { message: "Por favor, selecione uma categoria válida (Mão de obra ou Material)" }),
      type: z.enum(["PREVENTIVE", "CORRECTIVE", "HELP"], { message: "Por favor, selecione um tipo válido (Preventivo, Corretivo ou Ajuda)" }),
      labor: z.string().min(1, "Por favor, descreva a mão de obra realizada"),
      duration: z.object({
        from: z.string().datetime({ message: "Por favor, informe uma data inicial válida" }),
        to: z.string().datetime({ message: "Por favor, informe uma data final válida" }),
      }),
    }),
  ),
});

// Schema para validação de requisições JSON (novo)
const jsonSchema = z.object({
  gcaf: z.coerce.number().int().positive("GCAF deve ser um número positivo"),
  baseId: z.string().min(1, "Base é obrigatória"),
  userIds: z.array(z.string()).min(1, "Pelo menos um usuário é obrigatório"),
  plate: z.string().min(1, "Placa é obrigatória").transform(val => val.toUpperCase()),
  kilometers: z.coerce.number().min(0, "Kilometragem deve ser maior ou igual a 0"),
  status: z.enum(["PENDING", "REVISION", "APPROVED", "PARTIALLY_APPROVED", "INVOICE_APPROVED", "CANCELLED"]).default("PENDING"),
  observations: z.string().optional(),
  discount: z.coerce.number().min(0, "Desconto deve ser maior ou igual a 0").default(0),
});

export async function GET(req: NextRequest) {
  // Obter parâmetros de consulta
  const { searchParams } = new URL(req.url);
  const plate = searchParams.get('plate');
  
  // Construir o filtro de consulta
  const where = plate 
    ? { plate: { contains: plate, mode: 'insensitive' as const }, deletedAt: null } 
    : { deletedAt: null };
  
  // Buscar ordens de reparo com filtros aplicados
  try {
    // Primeiro, vamos atualizar qualquer serviço com foto nula para usar um placeholder
    await prisma.$executeRaw`
      UPDATE "RepairOrderService"
      SET "photo" = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
      WHERE "photo" IS NULL
    `;
    
    // Agora podemos buscar normalmente
    const repairOrders = await prisma.repairOrder.findMany({ 
      where,
      include: { 
        users: true, 
        base: true,
        services: {
          include: {
            item: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Converter os resultados para o formato esperado
    const formattedOrders = (repairOrders as any[]).map((order: any) => ({
      ...order,
      gcaf: order.gcaf?.toString() ?? null,
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt),
      // Os serviços já estão formatados pela query SQL
      // mas podemos garantir que os valores numéricos estão como strings
      services: Array.isArray(order.services) ? order.services.map((service: any) => ({
        ...service,
        value: service.value?.toString() || '0',
        discount: service.discount?.toString() || '0',
        duration: service.duration?.toString() || '0'
      })) : []
    }));
    
    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching repair orders:", error);
    return NextResponse.json({ error: true, message: "Erro ao buscar ordens de reparo" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verificar o tipo de conteúdo para determinar como processar a requisição
    const contentType = req.headers.get("content-type") || "";
    
    // Se for JSON, processar como JSON
    if (contentType.includes("application/json")) {
      const jsonData = await req.json();
      
      // Validar os dados JSON
      const validationResult = jsonSchema.safeParse(jsonData);
      
      if (!validationResult.success) {
        return NextResponse.json(
          { error: true, message: "Dados inválidos", details: validationResult.error.issues },
          { status: 400 }
        );
      }
      
      // Verificar se a base existe
      const baseExists = await prisma.base.findUnique({
        where: { id: validationResult.data.baseId },
      });
      
      if (!baseExists) {
        return NextResponse.json(
          { error: true, message: "Base não encontrada" },
          { status: 404 }
        );
      }
      
      // Verificar se todos os usuários existem
      const userCount = await prisma.user.count({
        where: {
          id: {
            in: validationResult.data.userIds
          }
        }
      });
      
      if (userCount !== validationResult.data.userIds.length) {
        return NextResponse.json(
          { error: true, message: "Um ou mais usuários não foram encontrados" },
          { status: 404 }
        );
      }
      
      // Criar a ordem de reparo
      const repairOrder = await prisma.repairOrder.create({
        data: {
          plate: validationResult.data.plate,
          kilometers: validationResult.data.kilometers,
          baseId: validationResult.data.baseId,
          gcaf: BigInt(validationResult.data.gcaf),
          status: validationResult.data.status,
          observations: validationResult.data.observations || "",
          discount: validationResult.data.discount,
          users: {
            connect: validationResult.data.userIds.map(id => ({ id }))
          }
        },
      });
      
      return NextResponse.json({ message: "Ordem de reparo criada com sucesso", id: repairOrder.id }, { status: 201 });
    }
    
    // Caso contrário, processar como formData (comportamento existente)
    const formData = await req.formData();
    const plate = formData.get("plate") as string;
    const kilometers = Number(formData.get("kilometers"));
    const base = formData.get("base") as string;
    const userId = formData.get("userId") as string;
    const assistantId = formData.get("assistantId") as string || undefined;
    const servicesRaw = formData.get("services") as string;
    const services = JSON.parse(servicesRaw);

    // Validar os dados recebidos
    const validatedData = formSchema.parse({
      plate,
      kilometers,
      base,
      userId,
      assistantId,
      services,
    });

    // Processar uploads de imagens
    const photoPaths: string[] = [];
    
    // Buscar todas as chaves do formData que começam com "photos["
    const photoEntries = Array.from(formData.entries())
      .filter(([key]) => key.startsWith('photos['))
      .map(([key, value]) => ({ key, value: value as File }));

    for (const { key, value: photo } of photoEntries) {
      if (photo instanceof File) {
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${photo.name}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        const filePath = path.join(uploadDir, fileName);

        // Extrair o índice do nome da chave (photos[0], photos[1], etc)
        const indexMatch = key.match(/\[(\d+)\]/);
        const index = indexMatch ? parseInt(indexMatch[1]) : photoPaths.length;

        console.log(`Salvando arquivo ${fileName} no caminho ${filePath}`);

        try {
          // Garantir que o diretório de uploads exista
          await fs.mkdir(uploadDir, { recursive: true });
          await fs.writeFile(filePath, buffer);
          
          // Armazenar o caminho da foto com seu índice para associar corretamente depois
          photoPaths[index] = `/uploads/${fileName}`;
          console.log(`Arquivo salvo com sucesso: ${filePath}`);
        } catch (error) {
          console.error(`Erro ao salvar arquivo: ${error}`);
        }
      }
    }

    // Associar fotos aos serviços (se houver)
    validatedData.services.forEach((service, index) => {
      if (photoPaths[index]) {
        console.log(`Associando foto ${photoPaths[index]} ao serviço ${index}`);
        (service as any).photo = photoPaths[index]; // Adicionar campo photo dinamicamente
      }
    });

    // Criar a ordem de reparo no banco de dados sem os serviços primeiro
    const repairOrder = await prisma.repairOrder.create({
      data: {
        plate: validatedData.plate,
        kilometers: validatedData.kilometers,
        baseId: validatedData.base,
        status: "PENDING", // Status padrão
        gcaf: BigInt(Date.now()), // Exemplo simples, substitua por lógica real
        discount: 0, // Valor padrão, ajuste conforme necessário
        users: {
          connect: validatedData.assistantId === "none" 
            ? [{ id: validatedData.userId }] 
            : [{ id: validatedData.userId }, { id: validatedData.assistantId }]
        }
      },
    });
    
    // Agora criar os serviços separadamente para cada um
    for (const service of validatedData.services) {
      try {
        // Usar $queryRaw para inserir diretamente no banco de dados, evitando a validação de enum do Prisma
        // Usar Prisma.createMany em vez de SQL direto para evitar problemas de casting
        await prisma.repairOrderService.create({
          data: {
            id: crypto.randomUUID(),
            quantity: service.quantity,
            itemId: service.item,
            labor: service.labor || '',
            duration: BigInt(new Date(service.duration.to).getTime() - new Date(service.duration.from).getTime()),
            value: 0,
            discount: 0,
            // Usar uma string literal direta para o tipo, evitando a validação de enum
            // @ts-ignore - Ignorar erro de tipo para permitir o valor HELP
            type: service.type,
            status: "PENDING",
            category: service.category,
            photo: (service as any).photo || null,
            repairOrderId: repairOrder.id
          }
        });
      } catch (error) {
        console.error('Erro ao criar serviço:', error);
        // Continuar criando os outros serviços mesmo se um falhar
      }
    }

    return NextResponse.json({ message: "Ordem de reparo criada com sucesso", id: repairOrder.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: true, message: error.errors }, { status: 400 });
    }
    console.error(error);
    return ERROR_500_NEXT;
  }
}
