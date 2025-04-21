import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    await signIn("credentials", {
      email: body.email,
      password: body.password,
      redirect: false,
    });
  } catch (error) {
    return NextResponse.json({ message: "Email ou senha inválidos" }, { status: 401 });
  }

  return NextResponse.json({ message: "Login realizado com sucesso" }, { status: 200 });
}
