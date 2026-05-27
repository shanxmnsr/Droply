import { cn } from "@/lib/db/utils";
import React from "react";

export type BadgeProps = {
  children: React.ReactNode;
  color?: "default" | "indigo" | "sky" | "success" | "warning" | "danger";
  variant?: "solid" | "soft" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export const Badge = ({
  children,
  color = "default",
  variant = "soft",
  size = "md",
  className,
  ...props
}: BadgeProps & React.HTMLAttributes<HTMLSpanElement>) => {
  const colors = {
    default: {
      solid: "bg-white/10 text-white",
      soft: "bg-white/5 text-white/70",
      outline: "border border-white/10 text-white/70",
    },

    indigo: {
      solid: "bg-indigo-500 text-white",
      soft: "bg-indigo-500/10 text-indigo-300",
      outline: "border border-indigo-500/30 text-indigo-300",
    },

    sky: {
      solid: "bg-sky-500 text-white",
      soft: "bg-sky-500/10 text-sky-300",
      outline: "border border-sky-500/30 text-sky-300",
    },

    success: {
      solid: "bg-emerald-500 text-white",
      soft: "bg-emerald-500/10 text-emerald-300",
      outline: "border border-emerald-500/30 text-emerald-300",
    },

    warning: {
      solid: "bg-amber-500 text-black",
      soft: "bg-amber-500/10 text-amber-300",
      outline: "border border-amber-500/30 text-amber-300",
    },

    danger: {
      solid: "bg-red-500 text-white",
      soft: "bg-red-500/10 text-red-300",
      outline: "border border-red-500/30 text-red-300",
    },
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium backdrop-blur-md",
        colors[color][variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
