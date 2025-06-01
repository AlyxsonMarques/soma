import { UserEnumType, UserStatusEnumType } from "./user";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      type: UserEnumType;
      status: UserStatusEnumType;
      assistant: boolean;
      observations?: string | null;
      birthDate: Date;
      createdAt: Date;
      updatedAt: Date;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    type: UserEnumType;
    status: UserStatusEnumType;
    assistant: boolean;
    observations?: string | null;
    birthDate: Date;
    createdAt: Date;
    updatedAt: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    type: UserEnumType;
    status: UserStatusEnumType;
    assistant: boolean;
    observations?: string | null;
    birthDate: Date;
    createdAt: Date;
    updatedAt: Date;
  }
}
