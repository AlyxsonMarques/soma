import { DataTable } from "@/components/data-table/data-table";
import type { RepairOrderAPISchema } from "@/types/repair-order";
import { DashboardHeader } from "../../components/dashboard-header";
import { columns } from "./components/orders-table-columns";

export default async function RepairOrder() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-orders`);
  const data = await response.json();

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DataTable<RepairOrderAPISchema>
          columns={columns}
          data={data}
          filterColumn="gcaf"
          filterPlaceholder="Pesquisar por GCAF"
        />
      </div>
    </>
  );
}
