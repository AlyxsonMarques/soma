"use client";

import { AlertCircle, CheckCircle, HelpCircle, Mail } from "lucide-react";
import Link from "next/link";

import { CentralizedView } from "@/components/CentralizedView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function RegistrationPendingPage() {
  return (
    <CentralizedView>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="h-10 w-10 text-amber-500" />
          </div>
          <CardTitle className="text-2xl text-center">Cadastro Pendente</CardTitle>
          <CardDescription className="text-center">Seu cadastro está em análise pela nossa equipe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-amber-500">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Aguardando aprovação</AlertTitle>
            <AlertDescription>Seu cadastro está sendo analisado e será aprovado em breve.</AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Formulário recebido</p>
                <p className="text-sm text-muted-foreground">Recebemos seu formulário de cadastro com sucesso.</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Verificação em andamento</p>
                <p className="text-sm text-muted-foreground">
                  Estamos verificando suas informações. Isso pode levar até 24 horas.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 opacity-50">
              <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Aprovação final</p>
                <p className="text-sm text-muted-foreground">Após a aprovação, você poderá acessar a plataforma</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </CentralizedView>
  );
}
