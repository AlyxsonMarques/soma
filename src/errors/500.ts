import { NextResponse } from "next/server"

export const ERROR_500_NEXT = NextResponse.json(
    {error: true, message: "Oops, ocorreu um erro, tente novamente e aguarde alguns minutos."},
    { status: 500 }
);