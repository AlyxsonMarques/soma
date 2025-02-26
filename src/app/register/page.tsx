import { RegisterForm } from "@/app/register/components/register-form";
import { CentralizedView } from "@/components/CentralizedView";
    export default function RegisterPage() {
    return (
        <CentralizedView>
            <div className="w-full max-w-sm md:max-w-7xl">
                <RegisterForm />
            </div>
        </CentralizedView>
    )
}