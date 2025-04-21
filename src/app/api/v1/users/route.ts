import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            cpf: true,
            email: true,
            type: true,
            status: true,
            birthDate: true,
            assistant: true,
            observations: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true
        }
    });

    return NextResponse.json(users);
}