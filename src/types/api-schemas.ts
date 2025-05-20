import { RepairOrderStatus } from "@prisma/client";

export interface BaseAddressAPISchema {
  id: string;
  street: string;
  number: number;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseAPISchema {
  id: string;
  name: string;
  phone: string;
  address?: BaseAddressAPISchema;
  addressId?: string;
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
  observations?: string | null;
  base?: {
    id: string;
    name: string;
  };
  users?: Array<{
    id: string;
    name: string;
  }>;
  services?: RepairOrderServiceAPISchema[];
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

export interface RepairOrderServiceAPISchema {
  id: string;
  quantity: number;
  value: number;
  discount: number;
  category: string;
  type: string;
  labor?: string;
  photo?: string;
  duration?: {
    from: string;
    to: string;
  };
  item?: {
    id: string;
    name: string;
    value: number;
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
