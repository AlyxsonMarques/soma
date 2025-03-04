import { DataTable } from "@/components/data-table/data-table";
import type { BaseAPISchema } from "@/types/base";
import { DashboardHeader } from "../../components/dashboard-header";
import { columns } from "./components/bases-table-columns";
export default function BasesPage() {
  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DataTable<BaseAPISchema>
          columns={columns}
          data={[]}
          filterColumn="name"
          filterPlaceholder="Pesquisar por nome"
        />
      </div>
    </>
  );
}
