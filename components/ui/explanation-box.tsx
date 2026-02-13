"use client";

import { ReactNode } from "react";
import { Lightbulb, Info, Zap } from "lucide-react";

interface ExplanationBoxProps {
  title?: string;
  children: ReactNode;
  variant?: "info" | "insight" | "dynamic";
  className?: string;
}

const variantStyles = {
  info: {
    border: "border-l-4 border-l-blue-500 dark:border-l-blue-400",
    bg: "bg-blue-50/50 dark:bg-blue-950/20",
    icon: Info,
    iconColor: "text-blue-500 dark:text-blue-400",
  },
  insight: {
    border: "border-l-4 border-l-amber-500 dark:border-l-amber-400",
    bg: "bg-amber-50/50 dark:bg-amber-950/20",
    icon: Lightbulb,
    iconColor: "text-amber-500 dark:text-amber-400",
  },
  dynamic: {
    border: "border-l-4 border-l-emerald-500 dark:border-l-emerald-400",
    bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
    icon: Zap,
    iconColor: "text-emerald-500 dark:text-emerald-400",
  },
};

export function ExplanationBox({
  title,
  children,
  variant = "info",
  className = "",
}: ExplanationBoxProps) {
  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <div
      className={`${style.border} ${style.bg} rounded-r-md p-4 ${className}`}
    >
      {title && (
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-4 w-4 ${style.iconColor}`} />
          <h4 className="font-semibold text-sm">{title}</h4>
        </div>
      )}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
