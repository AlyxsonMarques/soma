import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const repairOrderServiceItems = await prisma.repairOrderServiceItem.findMany({
    include: {
      base: true,
    },
  });
  return NextResponse.json(repairOrderServiceItems);
}
