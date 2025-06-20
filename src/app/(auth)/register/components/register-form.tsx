"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CPFInput } from "@/components/ui/cpf-input";
import { useState } from "react";

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type UserEnumType, type UserRegister, userRegisterSchema } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
export function RegisterForm() {
  const [userType, setUserType] = useState<UserEnumType>("MECHANIC");

  const form = useForm<UserRegister>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      type: "MECHANIC",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthDate: new Date(),
      cpf: "",
      assistant: false,
      observations: "",
    },
  });

  const onSubmit = async (data: UserRegister) => {
    const response = await fetch("/api/v1/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      toast.error(responseData.message);
      return;
    }

    toast.success(responseData.message);
    redirect("/login");
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
                <p className="text-balance text-muted-foreground">Registre-se na Start</p>
              </CardDescription>
            </div>
          </CardHeader>

          <FormField
            control={form.control}
            name="type"
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
                            setUserType("MECHANIC");
                            form.reset();
                          }}
                          value="MECHANIC"
                        />
                      </FormControl>
                      <FormLabel>Mecânico</FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          {...field}
                          onClick={() => {
                            setUserType("BUDGETIST");
                            form.reset();
                          }}
                          value="BUDGETIST"
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
                  <CPFInput 
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {userType === "MECHANIC" && (
            <>
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
