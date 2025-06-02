"use client";

import React, { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import { PdfViewer } from '@/components/pdf/pdf-viewer';
import { RepairOrderTemplate } from '@/components/pdf/repair-order-template';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sun, Moon, Laptop, ChevronDown } from 'lucide-react';

// Importar diretamente a função em vez de usar o módulo
async function getRepairOrderById(id: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${apiUrl}/api/v1/repair-orders/${id}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar ordem de reparo: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar ordem de reparo:', error);
    return null;
  }
}

// Configurações para o Next.js
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Tipos
type RepairOrderPdfPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function RepairOrderPdfPage({ params }: RepairOrderPdfPageProps) {
  // Usando React.use() para desempacotar params conforme recomendado pelo Next.js
  const { id } = use(params);
  const [repairOrder, setRepairOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  // Efeito para carregar o tema salvo no localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('pdf-theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    // Aplicar o tema
    applyTheme(savedTheme || 'system');
  }, []);
  
  // Efeito para buscar os dados da ordem de reparo
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getRepairOrderById(id);
        if (!data) {
          throw new Error('Ordem de reparo não encontrada');
        }
        setRepairOrder(data);
      } catch (err) {
        console.error('Erro ao buscar GR:', err);
        setError(err instanceof Error ? err : new Error('Erro desconhecido'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Função para aplicar o tema
  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    // Remover classes existentes
    root.classList.remove('light', 'dark');
    
    // Aplicar o tema selecionado
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
    
    // Salvar no localStorage
    localStorage.setItem('pdf-theme', newTheme);
  };
  
  // Função para alternar o tema
  const changeTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error || !repairOrder) {
    return notFound();
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Visualização da Guia de Remessa</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {theme === 'light' && <Sun size={16} />}
              {theme === 'dark' && <Moon size={16} />}
              {theme === 'system' && <Laptop size={16} />}
              Tema
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => changeTheme('light')} className="flex items-center gap-2">
              <Sun size={16} /> Claro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeTheme('dark')} className="flex items-center gap-2">
              <Moon size={16} /> Escuro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeTheme('system')} className="flex items-center gap-2">
              <Laptop size={16} /> Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <PdfViewer fileName={`GR_${repairOrder.gcaf || repairOrder.id}.pdf`}>
        <RepairOrderTemplate repairOrder={repairOrder} />
      </PdfViewer>
    </div>
  );
}
