import type { RepairOrderAPISchema } from './api-schemas';

declare module '@/lib/api/repair-orders' {
  export function getRepairOrderById(id: string): Promise<RepairOrderAPISchema | null>;
  export function getAllRepairOrders(): Promise<RepairOrderAPISchema[]>;
  export function getFilteredRepairOrders(filters: Record<string, any>): Promise<RepairOrderAPISchema[]>;
}
