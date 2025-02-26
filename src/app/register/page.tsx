import { RegisterForm } from "@/app/register/components/register-form";
import { CentralizedView } from "@/components/CentralizedView";
import { DoubleCard } from "@/components/DoubleCard";
import { SideImage } from "@/components/SideImage";

export default function RegisterPage() {
    return (
        <CentralizedView>
            <div className="w-full max-w-sm md:max-w-7xl">
                <DoubleCard>
                    <RegisterForm />
                    <SideImage src="/placeholder.svg" />
                </DoubleCard>
            </div>
        </CentralizedView>
    )
}