"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { SideImage } from "@/components/SideImage"

import Link from "next/link"
import DoubleCard from "@/components/DoubleCard"

export function RegisterForm() {
  const [userType, setUserType] = useState<"mechanic" | "budgetist">("mechanic")

  return (
    <DoubleCard>
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Criar Conta</h1>
                <p className="text-balance text-muted-foreground">Registre-se na SOMA</p>
              </div>

              <RadioGroup
                defaultValue="mechanic"
                onValueChange={(value) => setUserType(value as "mechanic" | "budgetist")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mechanic" id="mechanic" />
                  <Label htmlFor="mechanic">Mecânico</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="budgetist" id="budgetist" />
                  <Label htmlFor="budgetist">Orçamentista</Label>
                </div>
              </RadioGroup>

              <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" type="text" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="exemplo@gmail.com" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input id="confirmPassword" type="password" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input id="birthDate" type="date" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" type="text" required />
              </div>

              {userType === "mechanic" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="base">Base</Label>
                    <Select>
                      <SelectTrigger id="base">
                        <SelectValue placeholder="Selecione a base" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base1">Base 1</SelectItem>
                        <SelectItem value="base2">Base 2</SelectItem>
                        <SelectItem value="base3">Base 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="assistant" />
                    <Label htmlFor="assistant">Ajudante</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="observations">Observações</Label>
                    <Textarea id="observations" />
                  </div>
                </>
              )}

              {userType === "budgetist" && (
                <div className="grid gap-2">
                  <Label htmlFor="firm">Firma</Label>
                  <Select>
                    <SelectTrigger id="firm">
                      <SelectValue placeholder="Selecione a firma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="firma1">Firma 1</SelectItem>
                      <SelectItem value="firma2">Firma 2</SelectItem>
                      <SelectItem value="firma3">Firma 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button type="submit" className="w-full">
                Registrar
              </Button>
              <div className="text-center text-sm">
                Já tem uma conta?{" "}
                <Link
                className="underline underline-offset-4"
                href="/login">
                  Faça login
                </Link>
              </div>
            </div>
          </form>
          <SideImage src="/placeholder.svg" />
        </DoubleCard>
  )
}

