import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const bases = await prisma.base.findMany({
    include: {
      address: true
    }
  });
  return NextResponse.json(bases);
}