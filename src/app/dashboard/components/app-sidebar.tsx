"use client";

import {
  AudioWaveform,
  ChartNoAxesCombined,
  ClipboardList,
  Command,
  FileSpreadsheet,
  GalleryVerticalEnd,
  User,
} from "lucide-react";
import type * as React from "react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { dashboardLinks } from "@/store/dashboard-links";
import { usePathname } from "next/navigation";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

export const data = {
  teams: [
    {
      name: "Boituva",
      logo: GalleryVerticalEnd,
      plan: "",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const navMain = dashboardLinks.map((item) => ({
    ...item,
    isActive: pathname === `/dashboard/${item.url}`,
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
