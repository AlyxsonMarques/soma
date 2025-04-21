import { DataTable } from "@/components/data-table/data-table";
import type { UserAPISchema } from "@/types/user";
import { DashboardHeader } from "../../components/dashboard-header";
import { columns } from "./components/users-table-columns";
import { User } from "@prisma/client";
export default async function UsersPage() {

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`);
  let data = await response.json();
  data = data.map((user: User) => ({
    ...user,
    birthDate: new Date(user.birthDate),
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt)
  }))

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DataTable<UserAPISchema>
          columns={columns}
          data={data}
          filterColumn="name"
          filterPlaceholder="Pesquisar por nome"
        />
      </div>
    </>
  );
}
