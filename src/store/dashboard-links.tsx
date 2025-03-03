import type { DashboardLinkList } from "@/types/dashboard-link";
import { ChartNoAxesCombined, ClipboardList, FileSpreadsheet, User } from "lucide-react";
export const dashboardLinks: DashboardLinkList = [
  {
    title: "Business Intelligence",
    url: "bi",
    icon: ChartNoAxesCombined,
    isActive: false,
  },
  {
    title: "GR's",
    url: "orders",
    icon: ClipboardList,
    isActive: false,
  },
  {
    title: "Itens da GR",
    url: "items",
    icon: FileSpreadsheet,
    isActive: false,
  },
  {
    title: "Usuários",
    url: "users",
    icon: User,
    isActive: false,
  },
];
