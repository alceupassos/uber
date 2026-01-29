"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "./lib/utils";

export interface OnyxButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg" | "xl";
    liquid?: boolean;
}

export const OnyxButton = React.forwardRef<HTMLButtonElement, OnyxButtonProps>(
    ({ className, variant = "primary", size = "md", liquid = true, children, ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)]",
            secondary: "bg-secondary text-secondary-foreground backdrop-blur-md border border-white/5",
            outline: "bg-transparent border border-primary/50 text-primary hover:bg-primary/10",
            ghost: "bg-transparent hover:bg-white/5 text-foreground",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-xs",
            md: "px-5 py-2.5 text-sm",
            lg: "px-8 py-4 text-base",
            xl: "px-10 py-5 text-lg",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={liquid ? { scale: 1.02, y: -1 } : {}}
                whileTap={liquid ? { scale: 0.98 } : {}}
                className={cn(
                    "relative inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-300 overflow-hidden active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                <span className="relative z-10 flex items-center gap-2">{children as React.ReactNode}</span>
                {variant === "primary" && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                )}
            </motion.button>
        );
    }
);

OnyxButton.displayName = "OnyxButton";
