import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { RepairOrderAPISchema } from '@/types/api-schemas';

// Função para formatar valores monetários
const formatCurrency = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
};

// Função para formatar datas
const formatDate = (dateString: string | Date | null | undefined) => {
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

// Função para traduzir o status da GR
const translateStatus = (status: string) => {
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

// Função para traduzir o tipo de serviço
const translateServiceType = (type: string) => {
  const typeMap: Record<string, string> = {
    PREVENTIVE: 'Preventivo',
    CORRECTIVE: 'Corretivo',
    HELP: 'Socorro'
  };
  return typeMap[type] || type;
};

// Função para traduzir a categoria do serviço
const translateServiceCategory = (category: string) => {
  const categoryMap: Record<string, string> = {
    LABOR: 'Mão de Obra',
    MATERIAL: 'Material'
  };
  return categoryMap[category] || category;
};

// Função para traduzir o status do serviço
const translateServiceStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: 'Pendente',
    APPROVED: 'Aprovado',
    CANCELLED: 'Cancelado'
  };
  return statusMap[status] || status;
};

// Função para gerar o PDF de uma GR
export const generateRepairOrderPDF = (repairOrder: RepairOrderAPISchema): jsPDF => {
  // Criar um novo documento PDF
  const doc = new jsPDF();
  
  // Adicionar cabeçalho
  doc.setFontSize(20);
  doc.text('Guia de Remessa (GR)', 105, 15, { align: 'center' });
  
  // Adicionar GCAF em destaque
  doc.setFontSize(16);
  doc.text(`GCAF: ${repairOrder.gcaf || 'N/A'}`, 105, 25, { align: 'center' });
  
  // Informações da GR
  doc.setFontSize(12);
  doc.text('Informações da GR', 14, 35);
  
  // Informações básicas
  let yPos = 40;
  const lineHeight = 7;
  
  doc.setFontSize(10);
  doc.text(`Base: ${repairOrder.base?.name || 'N/A'}`, 14, yPos); yPos += lineHeight;
  doc.text(`Placa: ${repairOrder.plate || 'N/A'}`, 14, yPos); yPos += lineHeight;
  doc.text(`Kilometragem: ${repairOrder.kilometers || 0} km`, 14, yPos); yPos += lineHeight;
  doc.text(`Status: ${translateStatus(repairOrder.status)}`, 14, yPos); yPos += lineHeight;
  doc.text(`Desconto Total: ${formatCurrency(repairOrder.discount)}`, 14, yPos); yPos += lineHeight;
  doc.text(`Data de Criação: ${formatDate(repairOrder.createdAt)}`, 14, yPos); yPos += lineHeight;
  doc.text(`Última Atualização: ${formatDate(repairOrder.updatedAt)}`, 14, yPos); yPos += lineHeight * 1.5;
  
  // Observações
  if (repairOrder.observations) {
    doc.setFontSize(12);
    doc.text('Observações:', 14, yPos); yPos += lineHeight;
    doc.setFontSize(10);
    const splitObservations = doc.splitTextToSize(repairOrder.observations, 180);
    doc.text(splitObservations, 14, yPos);
    yPos += splitObservations.length * lineHeight + lineHeight;
  }
  
  // Mecânicos Responsáveis
  doc.setFontSize(12);
  doc.text('Mecânicos Responsáveis:', 14, yPos); yPos += lineHeight;
  
  if (repairOrder.users && repairOrder.users.length > 0) {
    doc.setFontSize(10);
    for (const user of repairOrder.users) {
      const cpfFormatted = user.cpf ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 'N/A';
      doc.text(`Nome: ${user.name || 'N/A'} | CPF: ${cpfFormatted} | Email: ${user.email || 'N/A'}`, 14, yPos);
      yPos += lineHeight;
    }
  } else {
    doc.setFontSize(10);
    doc.text('Nenhum mecânico responsável associado.', 14, yPos);
    yPos += lineHeight;
  }
  
  yPos += lineHeight;
  
  // Serviços
  doc.setFontSize(12);
  doc.text('Serviços:', 14, yPos); yPos += lineHeight;
  
  if (repairOrder.services && repairOrder.services.length > 0) {
    // Calcular subtotal e total dos serviços
    let subtotal = 0;
    let totalDiscount = 0;
    
    repairOrder.services.forEach(service => {
      const serviceValue = typeof service.value === 'string' ? parseFloat(service.value) : service.value || 0;
      const serviceDiscount = typeof service.discount === 'string' ? parseFloat(service.discount) : service.discount || 0;
      subtotal += serviceValue;
      totalDiscount += serviceDiscount;
    });
    
    const total = subtotal - totalDiscount - (repairOrder.discount || 0);
    
    doc.setFontSize(10);
    for (const service of repairOrder.services) {
      doc.text(`Item: ${service.item?.name || 'N/A'} | Qtd: ${service.quantity || 0} | Valor: ${formatCurrency(service.value)} | Desconto: ${formatCurrency(service.discount)}`, 14, yPos);
      yPos += lineHeight;
      doc.text(`Tipo: ${translateServiceType(service.type)} | Categoria: ${translateServiceCategory(service.category)} | Status: ${translateServiceStatus(service.status)}`, 14, yPos);
      yPos += lineHeight;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, yPos, 196, yPos);
      yPos += lineHeight;
    }
    
    yPos += lineHeight;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 14, yPos); yPos += lineHeight;
    doc.text(`Desconto em Serviços: ${formatCurrency(totalDiscount)}`, 14, yPos); yPos += lineHeight;
    doc.text(`Desconto Adicional: ${formatCurrency(repairOrder.discount)}`, 14, yPos); yPos += lineHeight;
    doc.text(`Total: ${formatCurrency(total)}`, 14, yPos);
    doc.setFont('helvetica', 'normal');
  } else {
    doc.setFontSize(10);
    doc.text('Nenhum serviço registrado.', 14, yPos);
  }
  
  return doc;
};

// Função para exportar uma única GR como PDF
export const exportSingleRepairOrderToPDF = (repairOrder: RepairOrderAPISchema) => {
  const doc = generateRepairOrderPDF(repairOrder);
  doc.save(`GR_${repairOrder.gcaf || repairOrder.id}.pdf`);
};

// Função para exportar múltiplas GRs como um arquivo ZIP contendo PDFs
export const exportMultipleRepairOrdersToZip = async (repairOrders: RepairOrderAPISchema[]) => {
  const zip = new JSZip();
  
  // Criar um PDF para cada GR e adicionar ao ZIP
  for (const repairOrder of repairOrders) {
    const doc = generateRepairOrderPDF(repairOrder);
    const pdfBlob = doc.output('blob');
    zip.file(`GR_${repairOrder.gcaf || repairOrder.id}.pdf`, pdfBlob);
  }
  
  // Gerar e salvar o arquivo ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `GRs_Export_${new Date().toISOString().slice(0, 10)}.zip`);
};
