import type { DashboardLinkList } from "@/types/dashboard-link";
import { ChartNoAxesCombined, ClipboardList, FileSpreadsheet, User, UserRoundPlus } from "lucide-react";
export const dashboardLinks: DashboardLinkList = [
  {
    id: 1,
    title: "Business Intelligence",
    url: "bi",
    icon: ChartNoAxesCombined,
    isActive: false,
  },
  {
    id: 2,
    title: "GR's",
    url: "orders",
    icon: ClipboardList,
    isActive: false,
  },
  {
    id: 3,
    title: "Itens da GR",
    url: "items",
    icon: FileSpreadsheet,
    isActive: false,
  },
  {
    id: 4,
    title: "Usuários",
    url: "users",
    icon: User,
    isActive: false,
  },
  {
    id: 5,
    title: "Cadastros Pendentes",
    url: "pending-registrations",
    icon: UserRoundPlus,
    isActive: false,
  },
];
