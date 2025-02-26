import { Card } from "./ui/card";

export default function DoubleCard({ children }: { children: React.ReactNode }) {
    return (
        <Card className="overflow-hidden grid p-0 md:grid-cols-2">
            {children}
        </Card>
    )
}