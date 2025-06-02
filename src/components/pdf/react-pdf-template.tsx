"use client";

import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFViewer,
  Image,
  Font
} from '@react-pdf/renderer';
import type { RepairOrderAPISchema } from '@/types/api-schemas';
import { 
  formatCurrency, 
  formatDate, 
  translateStatus, 
  translateServiceType, 
  translateServiceCategory, 
  translateServiceStatus 
} from '@/lib/pdf-generator';

// Usar fonte padrão para evitar problemas
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' }
  ]
});

// Definir estilos para o PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'semibold',
    marginBottom: 15,
  },
  section: {
    margin: 10,
    padding: 10,
    borderRadius: 5,
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: '1px solid #e2e8f0',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    marginBottom: 5,
  },
  badge: {
    fontSize: 10,
    padding: '3 8',
    borderRadius: 12,
    color: 'white',
    display: 'flex',
    marginRight: 5,
    textAlign: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e2e8f0',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 12,
    fontWeight: 'semibold',
  },
  userDetails: {
    fontSize: 10,
    color: '#64748b',
  },
  serviceItem: {
    padding: 10,
    borderRadius: 5,
    border: '1px solid #e2e8f0',
    marginBottom: 10,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: 'semibold',
  },
  serviceBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  servicePrice: {
    fontSize: 12,
    fontWeight: 'semibold',
    textAlign: 'right',
  },
  serviceDetails: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  photoContainer: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  photoLabel: {
    fontSize: 10,
    marginBottom: 5,
    color: '#64748b',
  },
  photo: {
    maxWidth: '80%',
    maxHeight: 200,
    objectFit: 'contain',
    marginBottom: 5,
  },
  totalSection: {
    marginTop: 10,
    alignSelf: 'flex-end',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 12,
  },
  totalFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 5,
    borderTop: '1px solid #e2e8f0',
  },
  totalFinalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalFinalValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  observations: {
    fontSize: 10,
    marginTop: 5,
  },
  noItems: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});

// Função para obter a cor do status
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    PENDING: '#eab308',
    REVISION: '#3b82f6',
    APPROVED: '#22c55e',
    PARTIALLY_APPROVED: '#10b981',
    INVOICE_APPROVED: '#15803d',
    CANCELLED: '#ef4444'
  };
  return colorMap[status] || '#6b7280';
};

// Função para obter a cor do status do serviço
const getServiceStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    PENDING: '#eab308',
    APPROVED: '#22c55e',
    CANCELLED: '#ef4444'
  };
  return colorMap[status] || '#6b7280';
};

interface RepairOrderPDFTemplateProps {
  repairOrder: RepairOrderAPISchema;
}

// Função para garantir que elementos não sejam cortados entre páginas
const AvoidBreak: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View wrap={false}>{children}</View>
);

// Componente principal do template PDF
export const RepairOrderPDFTemplate: React.FC<RepairOrderPDFTemplateProps> = ({ repairOrder }) => {
  // Calcular subtotal e total dos serviços
  let subtotal = 0;
  let totalDiscount = 0;
  
  repairOrder.services?.forEach(service => {
    const serviceValue = typeof service.value === 'string' ? parseFloat(service.value) : service.value || 0;
    const serviceDiscount = typeof service.discount === 'string' ? parseFloat(service.discount) : service.discount || 0;
    subtotal += serviceValue;
    totalDiscount += serviceDiscount;
  });
  
  const total = subtotal - totalDiscount - (repairOrder.discount || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Guia de Remessa (GR)</Text>
          <Text style={styles.subtitle}>GCAF: {repairOrder.gcaf || 'N/A'}</Text>
          <View style={[styles.badge, { backgroundColor: getStatusColor(repairOrder.status) }]}>
            <Text>{translateStatus(repairOrder.status)}</Text>
          </View>
        </View>

        {/* Informações da GR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da GR</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Base</Text>
              <Text style={styles.value}>{repairOrder.base?.name || 'N/A'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Placa</Text>
              <Text style={styles.value}>{repairOrder.plate || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Kilometragem</Text>
              <Text style={styles.value}>{repairOrder.kilometers || 0} km</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Desconto Total</Text>
              <Text style={styles.value}>{formatCurrency(repairOrder.discount)}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Data de Criação</Text>
              <Text style={styles.value}>{formatDate(repairOrder.createdAt)}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Última Atualização</Text>
              <Text style={styles.value}>{formatDate(repairOrder.updatedAt)}</Text>
            </View>
          </View>
          
          {repairOrder.observations && (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Observações</Text>
                <Text style={styles.observations}>{repairOrder.observations}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Mecânicos Responsáveis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mecânicos Responsáveis</Text>
          {repairOrder.users && repairOrder.users.length > 0 ? (
            repairOrder.users.map((user, index) => {
              const cpfFormatted = user.cpf ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 'N/A';
              const initials = user.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '??';
              
              return (
                <View key={`user-${index}`} style={styles.userRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name || 'N/A'}</Text>
                    <Text style={styles.userDetails}>CPF: {cpfFormatted} | Email: {user.email || 'N/A'}</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.noItems}>Nenhum mecânico responsável associado.</Text>
          )}
        </View>

        {/* Serviços - Começar em uma nova página */}
        <View style={styles.section} break>
          <Text style={styles.sectionTitle}>Serviços</Text>
          {repairOrder.services && repairOrder.services.length > 0 ? (
            <>
              {repairOrder.services.map((service, index) => (
                <AvoidBreak key={`service-${index}`}>
                  <View style={styles.serviceItem}>
                  <View style={styles.serviceHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.serviceName}>{service.item?.name || 'N/A'}</Text>
                      <View style={styles.serviceBadges}>
                        <View style={[styles.badge, { backgroundColor: '#e2e8f0', color: '#475569' }]}>
                          <Text>{translateServiceType(service.type)}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: '#e2e8f0', color: '#475569' }]}>
                          <Text>{translateServiceCategory(service.category)}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: getServiceStatusColor(service.status) }]}>
                          <Text>{translateServiceStatus(service.status)}</Text>
                        </View>
                      </View>
                    </View>
                    <View>
                      <Text style={styles.servicePrice}>{formatCurrency(service.value)}</Text>
                      <Text style={styles.serviceDetails}>Qtd: {service.quantity || 0}</Text>
                      <Text style={styles.serviceDetails}>Desconto: {formatCurrency(service.discount)}</Text>
                    </View>
                  </View>
                  
                  {service.photo && (
                    <View style={styles.photoContainer}>
                      <Text style={styles.photoLabel}>Foto do Serviço:</Text>
                      <Text style={styles.photoLabel}>{service.item?.name || 'Serviço'}</Text>
                    </View>
                  )}
                  
                  <View style={styles.separator} />
                  </View>
                </AvoidBreak>
              ))}
              
              {/* Totais */}
              <AvoidBreak>
                <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Desconto em Serviços:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(totalDiscount)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Desconto Adicional:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(repairOrder.discount)}</Text>
                </View>
                <View style={styles.totalFinal}>
                  <Text style={styles.totalFinalLabel}>Total:</Text>
                  <Text style={styles.totalFinalValue}>{formatCurrency(total)}</Text>
                </View>
              </View>
              </AvoidBreak>
            </>
          ) : (
            <Text style={styles.noItems}>Nenhum serviço registrado.</Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

// Componente para visualização e download do PDF
export const ReactPDFViewer: React.FC<{ repairOrder: RepairOrderAPISchema, fileName: string }> = ({ 
  repairOrder, 
  fileName 
}) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Carregando visualizador de PDF...</div>;
  }

  return (
    <PDFViewer style={{ width: '100%', height: '80vh', border: 'none' }}>
      <RepairOrderPDFTemplate repairOrder={repairOrder} />
    </PDFViewer>
  );
};
