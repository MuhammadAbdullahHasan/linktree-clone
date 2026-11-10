import { z } from "zod";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

/** `body: false` faces only make sense for headings (display, handwritten). */
export const FONTS = {
  sans: { label: "Modern", variable: "var(--font-inter)", body: true },
  rounded: { label: "Friendly", variable: "var(--font-nunito)", body: true },
  serif: { label: "Elegant", variable: "var(--font-lora)", body: true },
  mono: { label: "Technical", variable: "var(--font-jetbrains)", body: true },
  poppins: { label: "Poppins", variable: "var(--font-poppins)", body: true },
  montserrat: { label: "Montserrat", variable: "var(--font-montserrat)", body: true },
  manrope: { label: "Manrope", variable: "var(--font-manrope)", body: true },
  grotesk: { label: "Grotesk", variable: "var(--font-grotesk)", body: true },
  playfair: { label: "Playfair", variable: "var(--font-playfair)", body: false },
  dmserif: { label: "DM Serif", variable: "var(--font-dmserif)", body: false },
  bebas: { label: "Bebas", variable: "var(--font-bebas)", body: false },
  caveat: { label: "Handwritten", variable: "var(--font-caveat)", body: false },
} as const;

export type FontKey = keyof typeof FONTS;
const FONT_KEYS = Object.keys(FONTS) as [FontKey, ...FontKey[]];

const auto = z.union([hex, z.literal("auto")]);

/** Old themes stored a three-way button shape; the roundness slider replaces it. */
export const SHAPE_RADIUS = { square: 14, rounded: 28, pill: 34 } as const;
export const AVATAR_SIZES = { s: 88, m: 112, l: 136 } as const;
export const TEXT_SCALES = { s: 0.92, m: 1, l: 1.1 } as const;

const short = (max: number) => z.string().trim().max(max);

/**
 * What the business template shows besides the profile itself. Colours are the template's own
 * tokens so another company can re-brand it; text fields are optional and hide when empty.
 */
export const businessSchema = z.object({
  bg: hex,
  /** Link rows. */
  surface: hex,
  surfaceHover: hex,
  /** Quick-action cards. */
  card: hex,
  border: hex,
  /** Tile behind each link row's icon. */
  iconTile: hex,
  text: hex,
  muted: hex,
  accent: hex,
  accentLight: hex,
  legalName: short(60),
  tagline: short(120),
  location: short(80),
  /** The big button's target. A link with the same address keeps its /go/ click tracking. */
  websiteUrl: short(300),
  websiteLabel: short(40),
  servicesLabel: short(40),
  /** Services shown as plain rows, one per line as "Service: short description". No link needed. */
  services: short(2000),
  /** One line per link, "Link title: subtitle". Links without a line show their site as subtitle. */
  linkSubtitles: short(2000),
  platformsLabel: short(40),
  /** Comma-separated chip labels. */
  platforms: short(400),
  ctaLabel: short(40),
  /** Defaults to WhatsApp, then a phone call, then email. */
  ctaUrl: short(300),
  qrLabel: short(40),
  qrText: short(80),
});

export type BusinessTheme = z.infer<typeof businessSchema>;

export const BUSINESS_DEFAULT: BusinessTheme = {
  bg: "#0d0d0f",
  surface: "#151518",
  surfaceHover: "#1c1c20",
  card: "#1a1a1e",
  border: "#2c2c32",
  iconTile: "#2a1413",
  text: "#f4f4f6",
  muted: "#b9b9c2",
  accent: "#d7261e",
  accentLight: "#ff5a4f",
  legalName: "",
  tagline: "",
  location: "",
  websiteUrl: "",
  websiteLabel: "Visit our website",
  servicesLabel: "What we do",
  services: "",
  linkSubtitles: "",
  platformsLabel: "Platforms we support",
  platforms: "",
  ctaLabel: "Speak to an IT specialist",
  ctaUrl: "",
  qrLabel: "Tap or scan",
  qrText: "to open our business profile",
};

export const themeSchema = z.object({
  // Colours & background
  bgStyle: z.enum(["solid", "gradient", "radial", "mesh", "image"]),
  gradientAngle: z.number().int().min(0).max(360),
  bgBlur: z.number().int().min(0).max(40),
  bgDim: z.number().int().min(0).max(85),
  cardColor: auto,
  cardText: auto,
  accent: auto,
  bg: hex,
  bg2: hex,
  text: hex,
  buttonBg: hex,
  buttonText: hex,
  buttonShape: z.enum(["square", "rounded", "pill"]),
  buttonStyle: z.enum(["fill", "outline", "shadow"]),
  font: z.enum(FONT_KEYS),
  // Layout
  linkLayout: z.enum(["grid", "list", "chips"]),
  showPreviews: z.boolean(),
  cardAlign: z.enum(["center", "left"]),
  avatarShape: z.enum(["circle", "rounded", "square"]),
  avatarSize: z.enum(["s", "m", "l"]),
  // Shapes & finish
  radius: z.number().int().min(0).max(40),
  cardFinish: z.enum(["gloss", "matte", "glass", "outline"]),
  pillStyle: z.enum(["outline", "filled", "soft"]),
  shadow: z.enum(["none", "soft", "strong"]),
  // Fonts & extras
  headingFont: z.enum([...FONT_KEYS, "same"]),
  textScale: z.enum(["s", "m", "l"]),
  showHandle: z.boolean(),
  showFooter: z.boolean(),
  showDock: z.boolean(),
  animations: z.boolean(),
  // The floating dock at the bottom (Call, Email, QR, Share): derived from the theme ("auto",
  // the default), silver metal on black, or the owner's own colours.
  dockStyle: z.enum(["auto", "silver", "custom"]),
  dockBg: hex,
  dockIcon: hex,
  dockAccent: hex,
  // Page template: "card" is the glossy profile card over link tiles; "business" is the company
  // page (quick actions, service rows, platforms, QR card) in the colours below.
  template: z.enum(["card", "business"]),
  business: businessSchema,
});

export type Theme = z.infer<typeof themeSchema>;

export const DOCK_KEYS = ["dockStyle", "dockBg", "dockIcon", "dockAccent"] as const;
const DOCK_DEFAULT = { dockStyle: "auto", dockBg: "#141416", dockIcon: "#d4d4d7", dockAccent: "#d4d4d7" } as const;

/** Everything a preset doesn't decide: it keeps today's look until the owner changes it. */
const EXTRAS_DEFAULT = {
  gradientAngle: 165,
  bgBlur: 12,
  bgDim: 35,
  cardColor: "auto",
  cardText: "auto",
  accent: "auto",
  linkLayout: "grid",
  showPreviews: true,
  cardAlign: "center",
  avatarShape: "circle",
  avatarSize: "m",
  cardFinish: "gloss",
  pillStyle: "outline",
  shadow: "soft",
  headingFont: "same",
  textScale: "m",
  showHandle: true,
  showFooter: true,
  showDock: true,
  animations: true,
  template: "card",
  business: BUSINESS_DEFAULT,
} as const;

/** The keys a preset sets when picked. Layout, extras and dock settings carry over. */
export const PRESET_KEYS = [
  "bgStyle", "bg", "bg2", "text", "buttonBg", "buttonText", "buttonShape", "buttonStyle", "font",
  "radius", "cardColor", "cardText", "accent",
] as const;

export const THEME_PRESETS: { id: string; name: string; theme: Theme }[] = [
  {
    id: "chrome",
    name: "Chrome",
    theme: {
      bgStyle: "gradient", bg: "#c9c9cc", bg2: "#3a3a3d", text: "#0d0d0f",
      buttonBg: "#d4d4d7", buttonText: "#0d0d0f", buttonShape: "rounded", buttonStyle: "fill", font: "sans", ...DOCK_DEFAULT,
      ...EXTRAS_DEFAULT, radius: SHAPE_RADIUS.rounded,
    },
  },
  {
    id: "paper",
    name: "Paper",
    theme: {
      bgStyle: "solid", bg: "#f4f1ea", bg2: "#f4f1ea", text: "#1d1b16",
      buttonBg: "#1d1b16", buttonText: "#f4f1ea", buttonShape: "rounded", buttonStyle: "fill", font: "sans", ...DOCK_DEFAULT,
      ...EXTRAS_DEFAULT, radius: SHAPE_RADIUS.rounded,
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    theme: {
      bgStyle: "gradient", bg: "#0f172a", bg2: "#312e81", text: "#e0e7ff",
      buttonBg: "#e0e7ff", buttonText: "#1e1b4b", buttonShape: "pill", buttonStyle: "fill", font: "sans", ...DOCK_DEFAULT,
      ...EXTRAS_DEFAULT, radius: SHAPE_RADIUS.pill,
    },
  },
  {
    id: "lime",
    name: "Lime",
    theme: {
      bgStyle: "solid", bg: "#d9f99d", bg2: "#d9f99d", text: "#1a2e05",
      buttonBg: "#ffffff", buttonText: "#1a2e05", buttonShape: "square", buttonStyle: "shadow", font: "mono", ...DOCK_DEFAULT,
      ...EXTRAS_DEFAULT, radius: SHAPE_RADIUS.square,
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    theme: {
      bgStyle: "gradient", bg: "#fb7185", bg2: "#f59e0b", text: "#ffffff",
      buttonBg: "#ffffff", buttonText: "#9f1239", buttonShape: "pill", buttonStyle: "fill", font: "rounded", ...DOCK_DEFAULT,
      ...EXTRAS_DEFAULT, radius: SHAPE_RADIUS.pill,
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    theme: {
      bgStyle: "gradient", bg: "#0e7490", bg2: "#164e63", text: "#ecfeff",
      buttonBg: "#ecfeff", buttonText: "#164e63", buttonShape: "rounded", buttonStyle: "outline", font: "sans", ...DOCK_DEFAULT,
      ...EXTRAS_DEFAULT, radius: SHAPE_RADIUS.rounded,
    },
  },
  {
    id: "noir",
    name: "Noir",
    theme: {
      bgStyle: "solid", bg: "#0a0a0a", bg2: "#0a0a0a", text: "#fafafa",
      buttonBg: "#fafafa", buttonText: "#0a0a0a", buttonShape: "square", buttonStyle: "outline", font: "serif", ...DOCK_DEFAULT,
      ...EXTRAS_DEFAULT, radius: SHAPE_RADIUS.square,
    },
  },
  {
    id: "blush",
    name: "Blush",
    theme: {
      bgStyle: "solid", bg: "#fdf2f8", bg2: "#fdf2f8", text: "#831843",
      buttonBg: "#f9a8d4", buttonText: "#500724", buttonShape: "pill", buttonStyle: "fill", font: "serif", ...DOCK_DEFAULT,
      ...EXTRAS_DEFAULT, radius: SHAPE_RADIUS.pill,
    },
  },
  {
    id: "forest",
    name: "Forest",
    theme: {
      bgStyle: "gradient", bg: "#14532d", bg2: "#052e16", text: "#dcfce7",
      buttonBg: "#86efac", buttonText: "#052e16", buttonShape: "rounded", buttonStyle: "fill", font: "rounded", ...DOCK_DEFAULT,
      ...EXTRAS_DEFAULT, radius: SHAPE_RADIUS.rounded,
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
  // Themes saved before the roundness slider keep the corners they had.
  const oldShape = stored.buttonShape as keyof typeof SHAPE_RADIUS;
  if (!themeSchema.shape.radius.safeParse(stored.radius).success && oldShape in SHAPE_RADIUS) {
    merged.radius = SHAPE_RADIUS[oldShape];
  }
  // Fill business fields one by one, so one bad value doesn't drop the rest.
  const biz = stored.business && typeof stored.business === "object" ? (stored.business as Record<string, unknown>) : {};
  const business: Record<string, unknown> = { ...BUSINESS_DEFAULT };
  for (const key of Object.keys(businessSchema.shape) as (keyof BusinessTheme)[]) {
    if (businessSchema.shape[key].safeParse(biz[key]).success) business[key] = biz[key];
  }
  merged.business = business;
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

/** WCAG contrast ratio between two #rrggbb colours (1 to 21). */
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Whichever candidate colour reads best on `surface`. */
export function bestOn(surface: string, candidates: string[]) {
  return candidates.reduce((best, c) => (contrast(c, surface) > contrast(best, surface) ? c : best));
}

/**
 * Colours for the floating dock. Silver is brushed metal on near-black, like the Chrome tiles.
 * Custom docks use the owner's colours; auto docks sit on the theme's darker colour, with icons
 * in the first theme colour that reads clearly on it (4.5:1), falling back to white or near-black.
 * `accentFill` is the first button's background (may be a gradient); `accent` is its plain colour.
 */
export function dockColors(theme: Theme): { bg: string; icon: string; accent: string; accentIcon: string; accentFill?: string } {
  if (theme.dockStyle === "silver") {
    return {
      bg: "#141416",
      icon: "#d4d4d7",
      accent: "#d4d4d7",
      accentIcon: "#0d0d0f",
      accentFill: "linear-gradient(160deg, #f6f6f8 0%, #cfcfd3 45%, #9c9ca2 100%)",
    };
  }
  if (theme.dockStyle === "custom") {
    return {
      bg: theme.dockBg,
      icon: theme.dockIcon,
      accent: theme.dockAccent,
      accentIcon: bestOn(theme.dockAccent, [theme.dockBg, theme.dockIcon, "#ffffff", "#0d0d0f"]),
    };
  }
  const [bg, other] = luminance(theme.text) <= luminance(theme.bg) ? [theme.text, theme.bg] : [theme.bg, theme.text];
  const icon =
    [other, theme.bg2, theme.buttonBg, theme.buttonText].find((c) => contrast(c, bg) >= 4.5) ??
    bestOn(bg, ["#ffffff", "#0d0d0f"]);
  return { bg, icon, accent: icon, accentIcon: bg };
}
