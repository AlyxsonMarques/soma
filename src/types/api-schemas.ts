import { RepairOrderStatus } from "@prisma/client";

export interface BaseAPISchema {
  id: string;
  name: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepairOrderAPISchema {
  id: string;
  plate: string;
  kilometers: number;
  status: RepairOrderStatus;
  gcaf: string | null;
  discount: number;
  baseId: string;
  base?: {
    id: string;
    name: string;
  };
  users?: Array<{
    id: string;
    name: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepairOrderServiceItemAPISchema {
  id: string;
  name: string;
  value: number;
  base: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAPISchema {
  id: string;
  name: string;
  email: string;
  role: string;
  type: string;
  cpf: string;
  birthDate: Date;
  assistant: boolean;
  createdAt: Date;
  updatedAt: Date;
}
