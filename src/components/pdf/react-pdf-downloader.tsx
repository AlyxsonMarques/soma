"use client";

import React, { useState } from 'react';
import { 
  Document, 
  Page, 
  PDFDownloadLink,
  BlobProvider
} from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { RepairOrderPDFTemplate } from './react-pdf-template';
import type { RepairOrderAPISchema } from '@/types/api-schemas';

interface ReactPDFDownloaderProps {
  repairOrder: RepairOrderAPISchema;
  fileName: string;
}

export const ReactPDFDownloader: React.FC<ReactPDFDownloaderProps> = ({ 
  repairOrder, 
  fileName 
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Efeito para verificar se estamos no cliente
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Função para download manual usando BlobProvider
  const handleDownload = async (blob: Blob) => {
    setIsGenerating(true);
    try {
      // Criar URL para o blob
      const url = URL.createObjectURL(blob);
      
      // Criar link para download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'documento.pdf';
      document.body.appendChild(link);
      
      // Simular clique no link
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isClient) {
    return (
      <Button disabled>
        Carregando...
      </Button>
    );
  }

  return (
    <div className="flex justify-end mb-4">
      <BlobProvider document={<RepairOrderPDFTemplate repairOrder={repairOrder} />}>
        {({ blob, url, loading, error }) => {
          if (loading || !blob) {
            return (
              <Button disabled>
                Preparando PDF...
              </Button>
            );
          }

          if (error) {
            return (
              <Button variant="destructive" disabled>
                Erro ao gerar PDF
              </Button>
            );
          }

          return (
            <Button 
              onClick={() => handleDownload(blob)}
              disabled={isGenerating}
            >
              {isGenerating ? 'Gerando PDF...' : 'Baixar PDF'}
            </Button>
          );
        }}
      </BlobProvider>
    </div>
  );
};
