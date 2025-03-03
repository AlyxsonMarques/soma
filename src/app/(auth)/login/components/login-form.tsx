"use client";

import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type React from "react";

import Link from "next/link";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type UserLogin, userLoginSchema } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export function LoginForm() {
  const form = useForm<UserLogin>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: UserLogin) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <CardHeader>
            <div className="flex flex-col items-center text-center">
              <CardTitle>
                <h1 className="text-2xl font-bold">Bem-Vindo de Volta</h1>
              </CardTitle>
              <CardDescription>
                <p className="text-balance text-muted-foreground">Entre na sua conta SOMA</p>
              </CardDescription>
            </div>
          </CardHeader>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
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
                <div className="flex items-center">
                  <FormLabel>Senha</FormLabel>
                  <Link className="ml-auto text-sm underline-offset-2 hover:underline" href="/forgot-password">
                    Esqueceu sua senha?
                  </Link>
                </div>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Login
          </Button>

          <div className="text-center text-sm">
            Não tem uma conta?{" "}
            <Link className="underline underline-offset-4" href="/register">
              Registre-se
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
