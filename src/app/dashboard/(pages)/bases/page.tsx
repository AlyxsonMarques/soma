import { DataTable } from "@/components/data-table/data-table";
import type { BaseAPISchema } from "@/types/base";
import type { Base } from "@prisma/client";
import { DashboardHeader } from "../../components/dashboard-header";
import { columns } from "./components/bases-table-columns";
export default async function BasesPage() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bases`);
  let data = await response.json();
  data = data.map((base: Base) => ({
    ...base,
    createdAt: new Date(base.createdAt),
    updatedAt: new Date(base.updatedAt),
  }));

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DataTable<BaseAPISchema>
          columns={columns}
          data={data}
          filterColumn="name"
          filterPlaceholder="Pesquisar por nome"
        />
      </div>
    </>
  );
}
