import { DataTable } from "@/components/data-table/data-table";
import type { ItemAPISchema } from "@/types/repair-order-service-item";
import type { RepairOrderServiceItem } from "@prisma/client";
import { DashboardHeader } from "../../components/dashboard-header";
import { columns } from "./components/items-table-columns";

export default async function ItemsPage() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/repair-order-service-items`);
  let data = await response.json();

  data = data.map((item: RepairOrderServiceItem) => ({
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }));
  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DataTable<ItemAPISchema>
          columns={columns}
          data={data}
          filterColumn="name"
          filterPlaceholder="Pesquisar por nome"
        />
      </div>
    </>
  );
}
