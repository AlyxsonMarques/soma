import Image from "next/image";

export function SideImage({ src }: { src: string }) {
    return (
        <div className="relative hidden md:block">
            <Image fill src={src} alt="Image" className="absolute inset-0 h-full w-full object-cover" />
        </div>
    );
}