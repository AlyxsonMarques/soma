import { DataTable } from "@/components/data-table/data-table";
import type { ItemAPISchema } from "@/types/repair-order-item";
import { DashboardHeader } from "../../components/dashboard-header";
import { columns } from "./components/items-table-columns";

export default function ItemsPage() {
  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DataTable<ItemAPISchema>
          columns={columns}
          data={[]}
          filterColumn="name"
          filterPlaceholder="Pesquisar por nome"
        />
      </div>
    </>
  );
}
