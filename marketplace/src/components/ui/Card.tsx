import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export default function Card({ children, className, padding = "md", hover = false }: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg",
        hover && "transition-shadow hover:shadow-md",
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
