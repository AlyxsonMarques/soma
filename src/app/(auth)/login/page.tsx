import { LoginForm } from "@/app/(auth)/login/components/login-form";
import { CentralizedView } from "@/components/CentralizedView";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  return (
    <CentralizedView>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </CentralizedView>
  );
}
