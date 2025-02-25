import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Bem-Vindo de Volta</h1>
                <p className="text-balance text-muted-foreground">Entre na sua conta SOMA</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="exemplo@gmail.com" required />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <a href="/forgot-password" className="ml-auto text-sm underline-offset-2 hover:underline">
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <div className="text-center text-sm">
                Não tem uma conta?{" "}
                <a href="/register" className="underline underline-offset-4">
                  Registre-se
                </a>
              </div>
            </div>
          </form>
          <div className="relative hidden md:block">
            <img src="/placeholder.svg" alt="Image" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}