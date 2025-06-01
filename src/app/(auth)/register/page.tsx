import { RegisterForm } from "@/app/(auth)/register/components/register-form";
import { CentralizedView } from "@/components/CentralizedView";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RegisterPage() {
  return (
    <CentralizedView>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm md:max-w-7xl">
        <RegisterForm />
      </div>
    </CentralizedView>
  );
}
