"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterKey = "all" | "high-yield" | "it" | "energy" | "fmcg" | "saved";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",        label: "All" },
  { key: "high-yield", label: "High Yield >4%" },
  { key: "it",         label: "IT" },
  { key: "energy",     label: "Energy" },
  { key: "fmcg",       label: "FMCG" },
  { key: "saved",      label: "Saved" },
];

interface Props {
  active: FilterKey;
  onChange: (f: FilterKey) => void;
  counts: Record<FilterKey, number>;
}

export function FilterBar({ active, onChange, counts }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map((f) => {
        const isActive = active === f.key;
        const isSaved = f.key === "saved";
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className={cn("filter-pill", isActive && "active")}
          >
            {isSaved && (
              <Heart
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-colors",
                  isActive ? "fill-white text-white" : "text-text-muted"
                )}
                style={{ fontSize: 14 }}
              />
            )}
            {f.label}
            <span className="count">{counts[f.key]}</span>
          </button>
        );
      })}
    </div>
  );
}
