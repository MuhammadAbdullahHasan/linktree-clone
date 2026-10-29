import { z } from "zod";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const FONTS = {
  sans: { label: "Modern", variable: "var(--font-inter)" },
  rounded: { label: "Friendly", variable: "var(--font-nunito)" },
  serif: { label: "Elegant", variable: "var(--font-lora)" },
  mono: { label: "Technical", variable: "var(--font-jetbrains)" },
} as const;

export const themeSchema = z.object({
  bgStyle: z.enum(["solid", "gradient"]),
  bg: hex,
  bg2: hex,
  text: hex,
  buttonBg: hex,
  buttonText: hex,
  buttonShape: z.enum(["square", "rounded", "pill"]),
  buttonStyle: z.enum(["fill", "outline", "shadow"]),
  font: z.enum(["sans", "rounded", "serif", "mono"]),
});

export type Theme = z.infer<typeof themeSchema>;

export const THEME_PRESETS: { id: string; name: string; theme: Theme }[] = [
  {
    id: "paper",
    name: "Paper",
    theme: {
      bgStyle: "solid", bg: "#f4f1ea", bg2: "#f4f1ea", text: "#1d1b16",
      buttonBg: "#1d1b16", buttonText: "#f4f1ea", buttonShape: "rounded", buttonStyle: "fill", font: "sans",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    theme: {
      bgStyle: "gradient", bg: "#0f172a", bg2: "#312e81", text: "#e0e7ff",
      buttonBg: "#e0e7ff", buttonText: "#1e1b4b", buttonShape: "pill", buttonStyle: "fill", font: "sans",
    },
  },
  {
    id: "lime",
    name: "Lime",
    theme: {
      bgStyle: "solid", bg: "#d9f99d", bg2: "#d9f99d", text: "#1a2e05",
      buttonBg: "#ffffff", buttonText: "#1a2e05", buttonShape: "square", buttonStyle: "shadow", font: "mono",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    theme: {
      bgStyle: "gradient", bg: "#fb7185", bg2: "#f59e0b", text: "#ffffff",
      buttonBg: "#ffffff", buttonText: "#9f1239", buttonShape: "pill", buttonStyle: "fill", font: "rounded",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    theme: {
      bgStyle: "gradient", bg: "#0e7490", bg2: "#164e63", text: "#ecfeff",
      buttonBg: "#ecfeff", buttonText: "#164e63", buttonShape: "rounded", buttonStyle: "outline", font: "sans",
    },
  },
  {
    id: "noir",
    name: "Noir",
    theme: {
      bgStyle: "solid", bg: "#0a0a0a", bg2: "#0a0a0a", text: "#fafafa",
      buttonBg: "#fafafa", buttonText: "#0a0a0a", buttonShape: "square", buttonStyle: "outline", font: "serif",
    },
  },
  {
    id: "blush",
    name: "Blush",
    theme: {
      bgStyle: "solid", bg: "#fdf2f8", bg2: "#fdf2f8", text: "#831843",
      buttonBg: "#f9a8d4", buttonText: "#500724", buttonShape: "pill", buttonStyle: "fill", font: "serif",
    },
  },
  {
    id: "forest",
    name: "Forest",
    theme: {
      bgStyle: "gradient", bg: "#14532d", bg2: "#052e16", text: "#dcfce7",
      buttonBg: "#86efac", buttonText: "#052e16", buttonShape: "rounded", buttonStyle: "fill", font: "rounded",
    },
  },
];

export const DEFAULT_THEME: Theme = THEME_PRESETS[0].theme;

/** Reads a stored theme, filling in defaults for anything missing or invalid. */
export function resolveTheme(raw: unknown): Theme {
  const stored = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const merged: Record<string, unknown> = { ...DEFAULT_THEME };
  for (const key of Object.keys(themeSchema.shape) as (keyof Theme)[]) {
    if (themeSchema.shape[key].safeParse(stored[key]).success) merged[key] = stored[key];
  }
  return merged as Theme;
}

function rgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** WCAG relative luminance of a #rrggbb colour (0 = black, 1 = white). */
export function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** True when two colours are close enough to read as the same surface. */
export function similarColors(a: string, b: string) {
  const [x, y] = [rgb(a), rgb(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) < 48;
}
