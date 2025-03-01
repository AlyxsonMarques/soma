"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type React from "react";
import { useState } from "react";

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type UserEnumType, type UserRegister, userRegisterSchema } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

export function RegisterForm() {
  const [userType, setUserType] = useState<UserEnumType>("mechanic");

  const form = useForm<UserRegister>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      userType: "mechanic",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthDate: new Date(),
      cpf: "",
      base: "",
      assistant: false,
      observations: "",
      firm: "",
    },
  });

  const onSubmit = (data: UserRegister) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <CardHeader>
            <div className="flex flex-col items-center text-center">
              <CardTitle>
                <h1 className="text-2xl font-bold">Criar Conta</h1>
              </CardTitle>
              <CardDescription>
                <p className="text-balance text-muted-foreground">Registre-se na SOMA</p>
              </CardDescription>
            </div>
          </CardHeader>

          <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Tipo de Usuário</FormLabel>

                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          {...field}
                          onClick={() => {
                            setUserType("mechanic");
                            form.reset();
                          }}
                          value="mechanic"
                        />
                      </FormControl>
                      <FormLabel>Mecânico</FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          {...field}
                          onClick={() => {
                            setUserType("budgetist");
                            form.reset();
                          }}
                          value="budgetist"
                        />
                      </FormControl>
                      <FormLabel>Orçamentista</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="exemplo@gmail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Confirmar Senha</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Data de Nascimento</FormLabel>
                <FormControl>
                  <DatePickerInput className="w-full" field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {userType === "mechanic" && (
            <>
              <FormField
                control={form.control}
                name="base"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Base</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a base" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="base1">Base 1</SelectItem>
                          <SelectItem value="base2">Base 2</SelectItem>
                          <SelectItem value="base3">Base 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assistant"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Ajudante</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {userType === "budgetist" && (
            <FormField
              control={form.control}
              name="firm"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Firma</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a firma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="firma1">Firma 1</SelectItem>
                        <SelectItem value="firma2">Firma 2</SelectItem>
                        <SelectItem value="firma3">Firma 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button type="submit" className="w-full">
            Registrar
          </Button>
          <div className="text-center text-sm">
            Já tem uma conta?{" "}
            <Link className="underline underline-offset-4" href="/login">
              Faça login
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
