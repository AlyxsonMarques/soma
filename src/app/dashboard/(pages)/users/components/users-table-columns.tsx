"use client"
 
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { UserTableType } from "@/types/user"
import type { ColumnDef } from "@tanstack/react-table"
import { EllipsisVerticalIcon } from "lucide-react"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"
export const columns: ColumnDef<UserTableType>[] = [
    {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    
    {
        accessorKey: "id",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="ID" />
        },
    },
    {
        accessorKey: "userType",
        header: "Tipo de usuário",
        cell: ({ row }) => {
            return row.original.userType === "mechanic" ? "Mecânico" : "Orçamentista"
        }
    },
    {
        accessorKey: "cpf",
        header: "CPF",
        cell: ({ row }) => {
            return row.original.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
        }
    },
    {
        accessorKey: "name",
        header: "Nome"
    },
    {
        accessorKey: "email",
        header: "Email"
    },
    {
        accessorKey: "base",
        header: "Base"
    },
    {
        accessorKey: "firm",
        header: "Firma"
    },
    {
        accessorKey: "assistant",
        header: "Assistente",
        cell: ({ row }) => {
            return row.original.assistant ? "Sim" : "Não"
        }
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Criado em" />
        },
        cell: ({ row }) => {
            return <span>{row.original.createdAt.toLocaleDateString("pt-BR")}</span>
        }
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Atualizado em" />
        },
        cell: ({ row }) => {
            return <span>{row.original.updatedAt.toLocaleDateString("pt-BR")}</span>
        }
    },
    {
        accessorKey: "actions",
        header: "Ações",
        cell: ({ row }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <EllipsisVerticalIcon className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]