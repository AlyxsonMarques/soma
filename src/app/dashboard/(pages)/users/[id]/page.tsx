"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "../../../components/dashboard-header";
import { Loader2, ArrowLeft, Edit } from "lucide-react";
import type { UserAPISchema } from "@/types/api-schemas";
import { UserDetailsForm } from "../components/user-details-form";

export default function UserDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [user, setUser] = useState<UserAPISchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleBackClick = () => {
    router.back();
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">Usuário não encontrado</h1>
        <Button onClick={handleBackClick}>Voltar</Button>
      </div>
    );
  }

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Detalhes do Usuário</h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">
              {user.type === "MECHANIC" ? "Mecânico" : "Orçamentista"}
              {user.assistant && " • Assistente"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={isEditing ? "default" : "outline"} 
              onClick={handleEditToggle}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancelar Edição" : "Editar Usuário"}
            </Button>
          </div>
        </div>

        <Separator />

        {isEditing ? (
          <UserDetailsForm 
            user={user} 
            onSuccess={() => {
              fetchUser();
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
              <CardDescription>Detalhes completos do usuário</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Nome</p>
                <p>{user.name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Email</p>
                <p>{user.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">CPF</p>
                <p>{formatCPF(user.cpf)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Tipo</p>
                <p>{user.type === "MECHANIC" ? "Mecânico" : "Orçamentista"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Data de Nascimento</p>
                <p>{new Date(user.birthDate).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Assistente</p>
                <p>{user.assistant ? "Sim" : "Não"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Criado em</p>
                <p>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Atualizado em</p>
                <p>{new Date(user.updatedAt).toLocaleDateString("pt-BR")}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
