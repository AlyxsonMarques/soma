import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { ERROR_500_NEXT } from '@/errors/500';

// Schema de validação com Zod
const formSchema = z.object({
  plate: z.string().min(1, 'Placa é obrigatória').max(7, 'Placa deve ter no máximo 7 caracteres'),
  kilometers: z.number().int().min(0, 'Quilometragem deve ser um número inteiro positivo'),
  base: z.string().uuid('ID da base deve ser um UUID válido'),
  services: z.array(
    z.object({
      quantity: z.number().int().min(0, 'Quantidade deve ser um número inteiro positivo'),
      item: z.string().uuid('ID do item deve ser um UUID válido'),
      category: z.enum(['LABOR', 'MATERIAL'], { message: 'Categoria deve ser LABOR ou MATERIAL' }),
      type: z.enum(['PREVENTIVE', 'CORRECTIVE'], { message: 'Tipo deve ser PREVENTIVE ou CORRECTIVE' }),
      labor: z.string().min(1, 'Mão de obra é obrigatória'),
      duration: z.object({
        from: z.string().datetime({ message: 'Data inicial deve estar no formato ISO' }),
        to: z.string().datetime({ message: 'Data final deve estar no formato ISO' }),
      }),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    // Receber os dados do formulário
    const formData = await req.formData();
    const plate = formData.get('plate') as string;
    const kilometers = Number(formData.get('kilometers'));
    const base = formData.get('base') as string;
    const servicesRaw = formData.get('services') as string;
    const services = JSON.parse(servicesRaw);

    // Validar os dados recebidos
    const validatedData = formSchema.parse({
      plate,
      kilometers,
      base,
      services,
    });

    // Processar uploads de imagens
    const photos = formData.getAll('photos') as File[];
    const photoPaths: string[] = [];

    for (const photo of photos) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${photo.name}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      const filePath = path.join(uploadDir, fileName);

      // Garantir que o diretório de uploads exista
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(filePath, buffer);
      photoPaths.push(`/uploads/${fileName}`);
    }

    // Associar fotos aos serviços (se houver)
    validatedData.services.forEach((service, index) => {
      if (photoPaths[index]) {
        (service as any).photo = photoPaths[index]; // Adicionar campo photo dinamicamente
      }
    });

    // Criar a ordem de reparo no banco de dados
    const repairOrder = await prisma.repairOrder.create({
      data: {
        plate: validatedData.plate,
        kilometers: validatedData.kilometers,
        baseId: validatedData.base,
        status: 'PENDING', // Status padrão
        gcaf: BigInt(Date.now()), // Exemplo simples, substitua por lógica real
        discount: 0, // Valor padrão, ajuste conforme necessário
        services: {
          create: validatedData.services.map(service => ({
            quantity: service.quantity,
            itemId: service.item,
            labor: service.labor,
            duration: BigInt(
              new Date(service.duration.to).getTime() - new Date(service.duration.from).getTime()
            ), // Duração em milissegundos
            value: 0, // Ajuste conforme lógica de negócio
            discount: 0, // Ajuste conforme necessário
            type: service.type,
            status: 'PENDING', // Status padrão
            category: service.category,
            photo: (service as any).photo, // Campo extra não no  schema, ajuste se necessário
          })),
        },
      },
    });

    return NextResponse.json(
      { message: 'Ordem de reparo criada com sucesso', id: repairOrder.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: true, message: error.errors }, { status: 400 });
    }
    console.error(error);
    return ERROR_500_NEXT
  }
}