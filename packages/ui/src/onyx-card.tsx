"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "./lib/utils";

export interface OnyxCardProps extends HTMLMotionProps<"div"> {
    glass?: boolean;
    hoverEffect?: boolean;
}

export const OnyxCard = React.forwardRef<HTMLDivElement, OnyxCardProps>(
    ({ className, glass = true, hoverEffect = true, children, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                whileHover={hoverEffect ? { y: -4, shadow: "0 20px 40px rgba(0,0,0,0.4)" } : {}}
                className={cn(
                    "relative rounded-[2.5rem] border border-white/5 overflow-hidden",
                    glass ? "bg-card/40 backdrop-blur-xl shadow-2xl" : "bg-card",
                    className
                )}
                {...props}
            >
                <div className="relative z-10">{children as React.ReactNode}</div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            </motion.div>
        );
    }
);

OnyxCard.displayName = "OnyxCard";
