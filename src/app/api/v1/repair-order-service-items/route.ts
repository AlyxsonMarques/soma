import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const repairOrderServiceItems = await prisma.repairOrderServiceItem.findMany();
  return NextResponse.json(repairOrderServiceItems);
}
