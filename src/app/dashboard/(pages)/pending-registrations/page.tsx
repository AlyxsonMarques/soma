import { DataTable } from "@/components/data-table/data-table";
import type { UserAPISchema } from "@/types/user";
import { DashboardHeader } from "../../components/dashboard-header";
import { columns } from "./components/pending-registrations-table-columns";

export default async function PendingRegistrationsPage() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`);
  const data = await response.json();

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DataTable<UserAPISchema>
          columns={columns}
          data={data}
          filterColumn="email"
          filterPlaceholder="Pesquisar por email"
        />
      </div>
    </>
  );
}
