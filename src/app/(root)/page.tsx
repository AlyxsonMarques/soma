import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  
  // If user is not authenticated, redirect to login
  if (!session || !session.user) {
    redirect("/login");
  }
  
  // If user is a mechanic, redirect to repair-order
  if (session.user.type === "MECHANIC") {
    redirect("/repair-order");
  }
  
  // Otherwise redirect to dashboard
  redirect("/dashboard");
}
