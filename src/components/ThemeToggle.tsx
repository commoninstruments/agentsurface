"use client";

import { useTheme } from "fumadocs-ui/provider/base";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const order = ["light", "dark", "system"] as const;
const icons = { dark: Moon, light: Sun, system: Monitor };
const labels = { dark: "Dark", light: "Light", system: "System" };

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Theme resolves only on the client; render the neutral System icon until
  // mount so the markup matches on hydration and the icon does not flash.
  useEffect(() => {
    setMounted(true);
  }, []);

  const current = mounted ? ((theme as keyof typeof icons) ?? "system") : "system";
  const Icon = icons[current];

  const cycle = () => {
    setTheme(order[(order.indexOf(current) + 1) % order.length]);
  };

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${labels[current]}. Click to change.`}
      title={`Theme: ${labels[current]}`}
      className={`inline-flex size-7 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground ${className ?? ""}`}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}
