"use client";

import { AudioWaveform, Command, GalleryVerticalEnd, MapIcon, PieChart, User } from "lucide-react";
import type * as React from "react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

// This is sample data.
const data = {
  user: {
    name: "Vicente Ribeiro",
    email: "vicente.ribeiro@soma.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
  navMain: [
    {
      title: "Business Intelligence",
      url: "#",
      icon: PieChart,
      isActive: true,
    },
    {
      title: "GR's",
      url: "#",
      icon: MapIcon,
      isActive: true,
    },
    {
      title: "Usuários",
      url: "#",
      icon: User,
      isActive: true,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
