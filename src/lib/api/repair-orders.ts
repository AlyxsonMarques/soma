import type { RepairOrderAPISchema } from '@/types/api-schemas';

/**
 * Busca uma ordem de reparo pelo ID
 * @param id ID da ordem de reparo
 * @returns Dados da ordem de reparo
 */
export async function getRepairOrderById(id: string): Promise<RepairOrderAPISchema | null> {
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

/**
 * Busca todas as ordens de reparo
 * @returns Lista de ordens de reparo
 */
export async function getAllRepairOrders(): Promise<RepairOrderAPISchema[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${apiUrl}/api/v1/repair-orders`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar ordens de reparo: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar ordens de reparo:', error);
    return [];
  }
}

/**
 * Busca ordens de reparo com filtros
 * @param filters Filtros a serem aplicados
 * @returns Lista de ordens de reparo filtradas
 */
export async function getFilteredRepairOrders(filters: Record<string, any>): Promise<RepairOrderAPISchema[]> {
  try {
    // Construir query string a partir dos filtros
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const url = `${apiUrl}/api/v1/repair-orders${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar ordens de reparo: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar ordens de reparo:', error);
    return [];
  }
}
