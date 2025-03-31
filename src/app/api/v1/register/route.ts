import prisma from "@/lib/prisma";
import { type UserEnumType, type UserRegister, userRegisterSchema } from "@/types/user";
import { hash } from "bcrypt-ts";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body: UserRegister = await request.json();

  body.type = body.type.toUpperCase() as UserEnumType;
  body.birthDate = new Date(body.birthDate);
  const { success, error } = userRegisterSchema.safeParse(body);

  if (!success) {
    return NextResponse.json({ message: "Dados inválidos", error }, { status: 400 });
  }

  const cpfExists = await prisma.user.findUnique({
    where: { cpf: body.cpf },
  });

  if (cpfExists) {
    return NextResponse.json({ message: "CPF já cadastrado" }, { status: 400 });
  }

  const emailExists = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (emailExists) {
    return NextResponse.json({ message: "Email já cadastrado" }, { status: 400 });
  }

  const hashedPassword = await hash(body.password, Number.parseInt(process.env.BCRYPT_ROUNDS || "12"));

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
