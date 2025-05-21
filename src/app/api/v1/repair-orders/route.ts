import { promises as fs } from "fs";
import path from "path";
import { ERROR_500_NEXT } from "@/errors/500";
import prisma from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const formSchema = z.object({
  plate: z.string().min(1, "Placa é obrigatória").max(7, "Placa deve ter no máximo 7 caracteres"),
  kilometers: z.number().int().min(0, "Quilometragem deve ser um número inteiro positivo"),
  base: z.string().uuid("ID da base deve ser um UUID válido"),
  services: z.array(
    z.object({
      quantity: z.number().int().min(0, "Quantidade deve ser um número inteiro positivo"),
      item: z.string().uuid("ID do item deve ser um UUID válido"),
      category: z.enum(["LABOR", "MATERIAL"], { message: "Categoria deve ser LABOR ou MATERIAL" }),
      type: z.enum(["PREVENTIVE", "CORRECTIVE"], { message: "Tipo deve ser PREVENTIVE ou CORRECTIVE" }),
      labor: z.string().min(1, "Mão de obra é obrigatória"),
      duration: z.object({
        from: z.string().datetime({ message: "Data inicial deve estar no formato ISO" }),
        to: z.string().datetime({ message: "Data final deve estar no formato ISO" }),
      }),
    }),
  ),
});

export async function GET(req: NextRequest) {
  // Obter parâmetros de consulta
  const { searchParams } = new URL(req.url);
  const plate = searchParams.get('plate');
  
  // Construir o filtro de consulta
  const where = plate ? { plate: { contains: plate, mode: 'insensitive' as const } } : {};
  
  // Buscar ordens de reparo com filtros aplicados
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
  
  return NextResponse.json(
    repairOrders.map((order) => ({
      ...order,
      gcaf: order.gcaf?.toString() ?? null,
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt),
      services: order.services.map(service => ({
        ...service,
        value: service.value.toString(),
        discount: service.discount.toString(),
        duration: service.duration.toString()
      }))
    })),
  );
}

export async function POST(req: NextRequest) {
  try {
    // Receber os dados do formulário
    const formData = await req.formData();
    const plate = formData.get("plate") as string;
    const kilometers = Number(formData.get("kilometers"));
    const base = formData.get("base") as string;
    const servicesRaw = formData.get("services") as string;
    const services = JSON.parse(servicesRaw);

    // Validar os dados recebidos
    const validatedData = formSchema.parse({
      plate,
      kilometers,
      base,
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

    // Criar a ordem de reparo no banco de dados
    const repairOrder = await prisma.repairOrder.create({
      data: {
        plate: validatedData.plate,
        kilometers: validatedData.kilometers,
        baseId: validatedData.base,
        status: "PENDING", // Status padrão
        gcaf: BigInt(Date.now()), // Exemplo simples, substitua por lógica real
        discount: 0, // Valor padrão, ajuste conforme necessário
        services: {
          create: validatedData.services.map((service) => ({
            quantity: service.quantity,
            itemId: service.item,
            labor: service.labor,
            duration: BigInt(new Date(service.duration.to).getTime() - new Date(service.duration.from).getTime()), // Duração em milissegundos
            value: 0, // Ajuste conforme lógica de negócio
            discount: 0, // Ajuste conforme necessário
            type: service.type,
            status: "PENDING", // Status padrão
            category: service.category,
            photo: (service as any).photo, // Campo extra não no  schema, ajuste se necessário
          })),
        },
      },
    });

    return NextResponse.json({ message: "Ordem de reparo criada com sucesso", id: repairOrder.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: true, message: error.errors }, { status: 400 });
    }
    console.error(error);
    return ERROR_500_NEXT;
  }
}
