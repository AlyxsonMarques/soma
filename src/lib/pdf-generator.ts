import type { RepairOrderAPISchema } from '@/types/api-schemas';

// Importações que só funcionam no cliente
let saveAs: any;
let JSZip: any;
let html2pdf: any;

// Verificar se estamos no navegador antes de importar bibliotecas que dependem do DOM
if (typeof window !== 'undefined') {
  import('file-saver').then((module) => {
    saveAs = module.saveAs;
  });
  import('jszip').then((module) => {
    JSZip = module.default;
  });
  import('html2pdf.js').then((module) => {
    html2pdf = module.default || module;
  });
}

/**
 * Utilitários para formatação e tradução
 */
export const formatCurrency = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
};

export const formatDate = (dateString: string | Date | null | undefined) => {
  if (dateString === null || dateString === undefined) return '-';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const translateStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: 'Pendente',
    REVISION: 'Em Revisão',
    APPROVED: 'Aprovado',
    PARTIALLY_APPROVED: 'Parcialmente Aprovado',
    INVOICE_APPROVED: 'Fatura Aprovada',
    CANCELLED: 'Cancelado'
  };
  return statusMap[status] || status;
};

export const translateServiceType = (type: string) => {
  const typeMap: Record<string, string> = {
    PREVENTIVE: 'Preventivo',
    CORRECTIVE: 'Corretivo',
    HELP: 'Socorro'
  };
  return typeMap[type] || type;
};

export const translateServiceCategory = (category: string) => {
  const categoryMap: Record<string, string> = {
    LABOR: 'Mão de Obra',
    MATERIAL: 'Material'
  };
  return categoryMap[category] || category;
};

export const translateServiceStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: 'Pendente',
    APPROVED: 'Aprovado',
    CANCELLED: 'Cancelado'
  };
  return statusMap[status] || status;
};

/**
 * Função para redirecionar para a página de visualização do PDF
 */
export const viewRepairOrderPDF = (repairOrderId: string) => {
  if (typeof window !== 'undefined') {
    window.open(`/repair-order-pdf/${repairOrderId}`, '_blank');
  }
};

/**
 * Função para exportar uma única GR como PDF usando html2pdf
 * Esta função é usada diretamente no componente PdfViewer
 */
export const exportSingleRepairOrderToPDF = (repairOrder: RepairOrderAPISchema) => {
  if (typeof window !== 'undefined') {
    window.open(`/repair-order-pdf/${repairOrder.id}`, '_blank');
  }
};

/**
 * Função para exportar múltiplas GRs como um arquivo ZIP contendo PDFs
 * Esta função requer uma abordagem diferente, pois precisamos gerar PDFs no cliente
 * usando html2pdf para cada GR e depois compactar
 */
export const exportMultipleRepairOrdersToZip = async (repairOrders: RepairOrderAPISchema[]) => {
  // Verificar se estamos no cliente
  if (typeof window === 'undefined' || !html2pdf || !JSZip || !saveAs) {
    console.error('Esta função só pode ser executada no navegador');
    return;
  }
  
  const zip = new JSZip();
  
  // Para cada GR, abrimos a página em um iframe oculto, renderizamos o PDF e adicionamos ao ZIP
  for (const repairOrder of repairOrders) {
    try {
      // Criar um iframe oculto para renderizar o conteúdo
      const iframe = document.createElement('iframe');
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      document.body.appendChild(iframe);
      
      // Carregar a página de PDF no iframe
      iframe.src = `/repair-order-pdf/${repairOrder.id}`;
      
      // Esperar o iframe carregar
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
      });
      
      // Capturar o conteúdo do PDF do iframe
      const iframeDocument = iframe.contentDocument;
      if (!iframeDocument) {
        console.error('Não foi possível acessar o documento do iframe');
        continue;
      }
      
      // Encontrar o elemento de conteúdo do PDF
      const pdfContent = iframeDocument.querySelector('.pdf-content');
      if (!pdfContent) {
        console.error('Elemento de conteúdo do PDF não encontrado');
        continue;
      }
      
      // Configurar opções do html2pdf
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `GR_${repairOrder.gcaf || repairOrder.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      };
      
      // Gerar o PDF como blob
      const pdfBlob = await html2pdf().set(opt).from(pdfContent).outputPdf('blob');
      
      // Adicionar o PDF ao ZIP
      zip.file(`GR_${repairOrder.gcaf || repairOrder.id}.pdf`, pdfBlob);
      
      // Remover o iframe
      document.body.removeChild(iframe);
    } catch (error) {
      console.error(`Erro ao gerar PDF para GR ${repairOrder.id}:`, error);
    }
  }
  
  // Gerar e salvar o arquivo ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `GRs_Export_${new Date().toISOString().slice(0, 10)}.zip`);
};