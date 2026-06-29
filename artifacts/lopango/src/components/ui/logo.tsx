import Image from "next/image";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface LogoProps {
  size?: LogoSize;
  className?: string;
}

const sizeMap: Record<LogoSize, { container: string; img: number }> = {
  xs: { container: "w-6 h-6", img: 24 },
  sm: { container: "w-8 h-8", img: 32 },
  md: { container: "w-10 h-10", img: 40 },
  lg: { container: "w-12 h-12", img: 48 },
  xl: { container: "w-16 h-16", img: 64 },
};

export function Logo({ size = "sm", className = "" }: LogoProps) {
  const { container, img } = sizeMap[size];

  return (
    <div className={`${container} rounded-xl overflow-hidden flex items-center justify-center ${className}`}>
      <Image
        src="/favicon.svg"
        alt="DIGIPARC"
        width={img}
        height={img}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}
