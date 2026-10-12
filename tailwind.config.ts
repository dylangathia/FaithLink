import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const hsl = (v: string) => `hsl(var(--${v}))`;

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        border: hsl("border"),
        input: hsl("input"),
        ring: hsl("ring"),
        background: hsl("background"),
        foreground: hsl("foreground"),
        primary: { DEFAULT: hsl("primary"), foreground: hsl("primary-foreground") },
        secondary: { DEFAULT: hsl("secondary"), foreground: hsl("secondary-foreground") },
        destructive: { DEFAULT: hsl("destructive"), foreground: hsl("destructive-foreground") },
        muted: { DEFAULT: hsl("muted"), foreground: hsl("muted-foreground") },
        accent: { DEFAULT: hsl("accent"), foreground: hsl("accent-foreground") },
        popover: { DEFAULT: hsl("popover"), foreground: hsl("popover-foreground") },
        card: { DEFAULT: hsl("card"), foreground: hsl("card-foreground") },
        sidebar: {
          DEFAULT: hsl("sidebar-background"),
          foreground: hsl("sidebar-foreground"),
          primary: hsl("sidebar-primary"),
          "primary-foreground": hsl("sidebar-primary-foreground"),
          accent: hsl("sidebar-accent"),
          "accent-foreground": hsl("sidebar-accent-foreground"),
          border: hsl("sidebar-border"),
          ring: hsl("sidebar-ring"),
        },
        gold: { DEFAULT: hsl("gold"), foreground: hsl("gold-foreground") },
        parchment: { DEFAULT: hsl("parchment"), dark: hsl("parchment-dark") },
        "slate-blue": hsl("slate-blue"),
        mist: hsl("mist"),
        charcoal: hsl("charcoal"),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
