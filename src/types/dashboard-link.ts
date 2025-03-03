import type { LucideIcon } from "lucide-react";
import { z } from "zod";

const dashboardLinkIdSchema = z.number().positive().int("Por favor, insira um ID válido.");
const dashboardLinkTitleSchema = z.string().trim().nonempty("Título é obrigatório");
const dashboardLinkUrlSchema = z.string().url("URL inválida");
const dashboardLinkIconSchema = z.custom<LucideIcon>();
const dashboardLinkIsActiveSchema = z.boolean().optional();

export const dashboardLinkSchema = z.object({
  id: dashboardLinkIdSchema,
  title: dashboardLinkTitleSchema,
  url: dashboardLinkUrlSchema,
  icon: dashboardLinkIconSchema,
  isActive: dashboardLinkIsActiveSchema,
});

export type DashboardLink = z.infer<typeof dashboardLinkSchema>;

export const dashboardLinkListSchema = z.array(dashboardLinkSchema);
export type DashboardLinkList = z.infer<typeof dashboardLinkListSchema>;
