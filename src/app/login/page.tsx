import { LoginForm } from "@/app/login/components/login-form";
import { CentralizedView } from "@/components/CentralizedView";
import { DoubleCard } from "@/components/DoubleCard";
import { SideImage } from "@/components/SideImage";

export default function LoginPage() {
    return (
        <CentralizedView>
            <div className="w-full max-w-sm md:max-w-3xl">
                <DoubleCard>
                    <LoginForm />
                    <SideImage src="/placeholder.svg" />
                </DoubleCard>
            </div>
        </CentralizedView>
    )
}