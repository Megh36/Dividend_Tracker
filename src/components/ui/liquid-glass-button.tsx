"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export function GlassFilter() {
  return (
    <svg
      aria-hidden
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter
          id="container-glass"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feColorMatrix in="blur" type="saturate" values="1.8" result="saturated" />
        </filter>
      </defs>
    </svg>
  );
}

const liquidButtonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
    "backdrop-blur-md border",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
    "disabled:pointer-events-none disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-white/8 border-white/12 text-[#999]",
          "hover:bg-white/12 hover:border-white/20 hover:text-white",
          "shadow-[inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.3),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.08),inset_0_0_4px_2px_rgba(255,255,255,0.03)]",
        ],
        green: [
          "bg-[#00ff88]/15 border-[#00ff88]/25 text-[#00ff88]",
          "hover:bg-[#00ff88]/25 hover:border-[#00ff88]/45",
          "shadow-[inset_1px_1px_1px_-0.5px_rgba(0,255,136,0.5),inset_0_0_4px_2px_rgba(0,255,136,0.06),0_0_10px_rgba(0,255,136,0.08)]",
        ],
        "green-solid": [
          "bg-[#00ff88] border-[#00ff88]/60 text-[#0a0a0a] font-semibold",
          "hover:bg-[#00ff99] hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_12px_rgba(0,255,136,0.2)]",
        ],
        ghost: [
          "bg-transparent border-transparent text-[#555]",
          "hover:bg-white/5 hover:border-white/8 hover:text-[#999]",
        ],
      },
      size: {
        sm:   "px-3 py-1.5 text-xs rounded-lg",
        md:   "px-4 py-2 text-sm rounded-xl",
        lg:   "px-5 py-2.5 text-sm rounded-xl",
        icon: "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidButtonVariants> {
  asChild?: boolean;
}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(liquidButtonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
LiquidButton.displayName = "LiquidButton";

const metalButtonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-bold transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        gold: [
          "bg-gradient-to-b from-[#f5c842] via-[#d4a017] to-[#b8860b]",
          "border border-[#f5c842]/50 text-[#1a0e00]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.25),0_4px_16px_rgba(212,160,23,0.4)]",
          "hover:from-[#ffd94d] hover:via-[#e0a820] hover:to-[#c49010]",
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_6px_24px_rgba(212,160,23,0.55)]",
          "active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]",
        ],
        silver: [
          "bg-gradient-to-b from-[#e8e8e8] via-[#c0c0c0] to-[#a0a0a0]",
          "border border-white/40 text-[#1a1a1a]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.3)]",
          "hover:from-[#f0f0f0] hover:via-[#d0d0d0] hover:to-[#b0b0b0]",
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_16px_rgba(0,0,0,0.35)]",
        ],
      },
      size: {
        md: "px-5 py-2.5 text-sm rounded-xl",
        lg: "px-6 py-3 text-base rounded-xl",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "md",
    },
  }
);

export interface MetalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof metalButtonVariants> {
  asChild?: boolean;
}

export const MetalButton = React.forwardRef<HTMLButtonElement, MetalButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(metalButtonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
MetalButton.displayName = "MetalButton";
