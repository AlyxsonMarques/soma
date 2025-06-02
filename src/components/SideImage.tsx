import { formatImageUrl } from "@/lib/image-utils";

export function SideImage({ src }: { src: string }) {
  return (
    <div className="relative hidden md:block">
      <img src={formatImageUrl(src)} alt="Image" className="absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}
