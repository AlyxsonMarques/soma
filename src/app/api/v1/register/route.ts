import prisma from "@/lib/prisma";
import { type UserEnumType, type UserRegister, userRegisterSchema } from "@/types/user";
import argon2 from "argon2";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body: UserRegister = await request.json();

  body.type = body.type.toUpperCase() as UserEnumType;
  body.birthDate = new Date(body.birthDate);
  const { success, error } = userRegisterSchema.safeParse(body);

  if (!success) {
    return NextResponse.json({ message: "Dados inválidos", error }, { status: 400 });
  }

  const alreadyExists = await prisma.user.findFirst({
    where: {
      OR: [{ email: body.email }, { cpf: body.cpf }],
    },
  });

  if (alreadyExists) {
    return NextResponse.json({ message: "Usuário já existe" }, { status: 400 });
  }

  const hashedPassword = await argon2.hash(body.password);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashedPassword,
      cpf: body.cpf,
      birthDate: body.birthDate,
      type: body.type,
      assistant: body.assistant,
      observations: body.observations,
    },
  });

  return NextResponse.json({ message: "Usuário criado com sucesso", user }, { status: 201 });
}
