import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import { MdVerified } from "react-icons/md";
import ActionDock from "@/components/ActionDock";
import { ContactPills } from "@/components/ContactActions";
import { APP_NAME } from "@/lib/config";
import { contactEmail, contactPhone, linkCaption, platformForUrl, SOCIALS_BY_ID, telPhone, whatsappPhone } from "@/lib/socials";
import {
  AVATAR_SIZES,
  bestOn,
  contrast,
  dockColors,
  FONTS,
  similarColors,
  TEXT_SCALES,
  type Theme,
} from "@/lib/themes";
import type { PageData } from "@/lib/types";

const DROP_SHADOW: Record<Theme["shadow"], { tile: string; card: string }> = {
  none: { tile: "", card: "" },
  soft: { tile: "0 14px 30px -18px rgb(0 0 0 / 0.55)", card: "0 24px 50px -28px rgb(0 0 0 / 0.7)" },
  strong: { tile: "0 22px 40px -14px rgb(0 0 0 / 0.65)", card: "0 34px 70px -24px rgb(0 0 0 / 0.85)" },
};

/** A font size that follows the owner's text-size setting. */
const fs = (px: number) => `calc(${px}px * var(--pf-scale))`;

/** The page background for each background style (a photo background sits on top of `bg`). */
function pageBackground(theme: Theme) {
  const glow = theme.accent !== "auto" ? theme.accent : theme.buttonBg;
  switch (theme.bgStyle) {
    case "gradient":
      return `linear-gradient(${theme.gradientAngle}deg, ${theme.bg}, ${theme.bg2})`;
    case "radial":
      return `radial-gradient(circle at 50% 0%, ${theme.bg2} 0%, ${theme.bg} 70%)`;
    case "mesh":
      return `radial-gradient(at 15% 10%, ${theme.bg2} 0px, transparent 55%), radial-gradient(at 90% 25%, ${glow} 0px, transparent 50%), radial-gradient(at 65% 95%, ${theme.bg2} 0px, transparent 55%), ${theme.bg}`;
    default:
      return theme.bg;
  }
}

/** Link tile surface in the owner's chosen button style. Filled tiles get a soft metallic sheen. */
function tileStyle(theme: Theme, radius: number): CSSProperties {
  const base: CSSProperties = { borderRadius: radius };
  const drop = DROP_SHADOW[theme.shadow].tile;
  switch (theme.buttonStyle) {
    case "outline":
      return { ...base, boxShadow: `inset 0 0 0 1.5px ${theme.buttonBg}`, color: theme.text, background: "transparent" };
    case "shadow":
      // The owner picked the "Hard shadow" style, so the offset shadow is theirs to keep.
      return {
        ...base,
        background: theme.buttonBg,
        color: theme.buttonText,
        border: `2px solid ${theme.text}`,
        boxShadow: `4px 4px 0 ${theme.text}`,
      };
    default:
      return {
        ...base,
        color: theme.buttonText,
        background: `linear-gradient(160deg, color-mix(in oklab, ${theme.buttonBg} 70%, white) 0%, ${theme.buttonBg} 45%, color-mix(in oklab, ${theme.buttonBg} 88%, black) 100%)`,
        boxShadow: [`inset 0 1px 0 rgb(255 255 255 / 0.45)`, `inset 0 0 0 1px rgb(255 255 255 / 0.12)`, drop]
          .filter(Boolean)
          .join(", "),
      };
  }
}

/** Lets long names and handles wrap after dots and underscores instead of mid-word. */
function breakable(text: string) {
  return text.split(/(?<=[._])/).flatMap((part, i) => (i === 0 ? [part] : [<wbr key={i} />, part]));
}

type Props = {
  data: PageData;
  /** Preview mode: fills its container, links open directly in a new tab and aren't counted. */
  preview?: boolean;
};

export default function ProfilePage({ data, preview = false }: Props) {
  const { theme } = data;
  const name = data.displayName || `@${data.username}`;
  const phone = contactPhone(data.socials, data.links);
  const email = contactEmail(data.socials);
  const waPhone = whatsappPhone(data.socials, data.links);
  const whatsapp = waPhone ? `https://wa.me/${waPhone.slice(1)}` : null;
  // The name a saved contact gets: the display name, or the bare handle.
  const contactName = data.displayName || data.username;
  const background = pageBackground(theme);
  const photoBackground = theme.bgStyle === "image" ? data.bgImageUrl : null;
  const cover = data.coverUrl;
  const radius = theme.radius;
  const headingFont = FONTS[theme.headingFont === "same" ? theme.font : theme.headingFont].variable;
  const centered = theme.cardAlign === "center";

  // The profile card is the page's dark "ink" object unless the owner picked its colours. When filled
  // tiles are already the ink colour, it switches to a tinted page colour so card and tiles don't merge.
  const cardBlends = theme.buttonStyle === "fill" && similarColors(theme.buttonBg, theme.text);
  const solidCard =
    theme.cardFinish === "outline"
      ? theme.bg // An outline card has no surface: its text sits on the page itself.
      : theme.cardColor !== "auto"
        ? theme.cardColor
        : cardBlends
          ? theme.bg
          : theme.text;
  const cardSurface =
    theme.cardColor === "auto" && cardBlends ? `color-mix(in oklab, ${theme.bg} 88%, ${theme.text})` : solidCard;
  const themed = bestOn(solidCard, [theme.bg, theme.bg2, theme.buttonBg, theme.buttonText, theme.text]);
  const cardInk =
    theme.cardText !== "auto"
      ? theme.cardText
      : cover
        ? "#ffffff"
        : contrast(themed, solidCard) >= 4.5
          ? themed
          : bestOn(solidCard, ["#ffffff", "#0d0d0f"]);
  const accent = theme.accent !== "auto" ? theme.accent : cardInk;

  const cardLook: Record<Theme["cardFinish"], CSSProperties> = {
    gloss: {
      background: `linear-gradient(180deg, color-mix(in oklab, ${cardSurface} 68%, white) 0%, ${cardSurface} 55%, color-mix(in oklab, ${cardSurface} 90%, black) 100%)`,
      boxShadow: [`inset 0 1px 0 rgb(255 255 255 / 0.18)`, `inset 0 0 0 1px color-mix(in oklab, ${cardInk} 10%, transparent)`, DROP_SHADOW[theme.shadow].card]
        .filter(Boolean)
        .join(", "),
    },
    matte: {
      background: cardSurface,
      boxShadow: [`inset 0 0 0 1px color-mix(in oklab, ${cardInk} 8%, transparent)`, DROP_SHADOW[theme.shadow].card]
        .filter(Boolean)
        .join(", "),
    },
    glass: {
      background: `color-mix(in oklab, ${cardSurface} 55%, transparent)`,
      backdropFilter: "blur(18px) saturate(1.4)",
      WebkitBackdropFilter: "blur(18px) saturate(1.4)",
      boxShadow: [`inset 0 1px 0 rgb(255 255 255 / 0.25)`, `inset 0 0 0 1px rgb(255 255 255 / 0.16)`, DROP_SHADOW[theme.shadow].card]
        .filter(Boolean)
        .join(", "),
    },
    outline: {
      background: "transparent",
      boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${cardInk} 35%, transparent)`,
    },
  };

  const avatarSize = AVATAR_SIZES[theme.avatarSize];
  const avatarRadius =
    theme.avatarShape === "circle" ? 9999 : Math.round(avatarSize * (theme.avatarShape === "rounded" ? 0.28 : 0.1));

  // WhatsApp has its own button on the card.
  // Email has a dock button, so neither repeats among the social icons.
  const socials = data.socials.filter((s) => !(s.platform === "whatsapp" && waPhone) && s.platform !== "email");
  // A link tile to the same WhatsApp number would be a third copy of the card pill and dock button.
  // The same goes for a mailto: tile to the address the page already offers as a button, and a
  // tel: tile to the number the dock's Call button rings (kept when the dock is hidden).
  const links = data.links.filter(
    (l) =>
      !(waPhone && whatsappPhone([], [{ url: l.url }]) === waPhone) &&
      !(theme.showDock && phone && telPhone(l.url) === phone) &&
      !(email && l.url === `mailto:${email}`),
  );

  // The footer sits at the bottom of the page, where a linear gradient has reached its second colour.
  const pageBottom = theme.bgStyle === "gradient" ? theme.bg2 : theme.bg;
  const footerInk = bestOn(pageBottom, [theme.text, theme.bg, theme.bg2, theme.buttonBg, theme.buttonText]);

  return (
    <div
      className={`profile relative isolate flex w-full flex-col ${preview ? "min-h-full" : "min-h-dvh"} ${
        theme.animations ? "" : "pf-static"
      }`}
      style={
        {
          "--pf-bg": theme.bg,
          "--pf-ink": theme.text,
          "--pf-btn": theme.buttonBg,
          "--pf-btn-ink": theme.buttonText,
          "--pf-scale": TEXT_SCALES[theme.textScale],
          background,
          color: theme.text,
          fontFamily: FONTS[theme.font].variable,
        } as CSSProperties
      }
    >
      {photoBackground ? (
        <div
          aria-hidden
          className={`pointer-events-none inset-0 -z-10 overflow-hidden ${preview ? "absolute" : "fixed"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- user upload */}
          <img
            src={photoBackground}
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: `blur(${theme.bgBlur}px)`, transform: theme.bgBlur ? "scale(1.1)" : undefined }}
          />
          <div className="absolute inset-0" style={{ background: theme.bg, opacity: theme.bgDim / 100 }} />
        </div>
      ) : (
        !preview &&
        cover && (
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element -- user upload */}
            <img src={cover} alt="" className="h-full w-full scale-110 object-cover opacity-60 blur-3xl saturate-125" />
            <div className="absolute inset-0" style={{ background, opacity: 0.55 }} />
          </div>
        )
      )}

      <main className={`mx-auto flex w-full max-w-[440px] flex-1 flex-col ${preview ? "px-2.5 pt-2.5" : "px-3 pt-3 sm:pt-8"}`}>
        {/* Profile card */}
        <section
          className={`pf-rise pf-ink relative isolate overflow-hidden px-5 pt-8 pb-6 ${centered ? "text-center" : "text-left"}`}
          style={
            {
              color: cardInk,
              borderRadius: Math.min(radius + 6, 44),
              ...(cover ? { ...cardLook[theme.cardFinish], background: "#0d0d0f" } : cardLook[theme.cardFinish]),
              "--i": 0,
              "--pf-focus": cardInk,
            } as CSSProperties
          }
        >
          {cover && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- user upload */}
              <img src={cover} alt="" className="pf-hero-media absolute inset-0 -z-10 h-full w-full object-cover" />
              <div
                aria-hidden
                className="absolute inset-0 -z-10"
                style={{ background: "linear-gradient(180deg, rgb(0 0 0 / 0.25), rgb(0 0 0 / 0.55) 45%, rgb(0 0 0 / 0.85))" }}
              />
            </>
          )}

          <span
            className={`block w-fit p-[5px] ${centered ? "mx-auto" : ""}`}
            style={{
              borderRadius: avatarRadius === 9999 ? 9999 : avatarRadius + 5,
              background: `color-mix(in oklab, ${cardInk} 92%, transparent)`,
              boxShadow: "0 10px 28px -10px rgb(0 0 0 / 0.6)",
            }}
          >
            {data.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- user upload
              <img
                src={data.avatarUrl}
                alt=""
                width={avatarSize}
                height={avatarSize}
                className="block object-cover"
                style={{ width: avatarSize, height: avatarSize, borderRadius: avatarRadius }}
              />
            ) : (
              <span
                aria-hidden
                className="grid place-items-center font-semibold"
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarRadius,
                  background: solidCard,
                  color: cardInk,
                  fontSize: avatarSize * 0.36,
                }}
              >
                {(data.displayName || data.username).charAt(0).toUpperCase()}
              </span>
            )}
          </span>

          <h1
            className="mt-4 font-semibold tracking-[-0.01em] text-balance break-words"
            style={{
              fontFamily: headingFont,
              fontSize: fs(name.length > 18 ? 19 : 22),
              lineHeight: name.length > 18 ? 1.35 : 1.2,
            }}
          >
            {breakable(name)}
            {data.verified && (
              <MdVerified
                aria-label="Verified"
                role="img"
                className="ml-1.5 inline-block size-[0.85em] -translate-y-[0.06em] align-middle"
                style={{ color: accent }}
              />
            )}
          </h1>
          {theme.showHandle && data.displayName && (
            <p className="mt-1 opacity-60" style={{ fontSize: fs(13) }}>
              @{data.username}
            </p>
          )}
          {data.bio && (
            <p
              className={`mt-2.5 max-w-[30ch] leading-relaxed text-balance whitespace-pre-line opacity-75 ${centered ? "mx-auto" : ""}`}
              style={{ fontSize: fs(14) }}
            >
              {data.bio}
            </p>
          )}

          <ContactPills
            username={data.username}
            name={contactName}
            phone={phone}
            email={email}
            whatsapp={whatsapp}
            ink={cardInk}
            surface={solidCard}
            accent={accent}
            variant={theme.pillStyle}
            radius={radius}
          />

          {socials.length > 0 && (
            <ul className={`mt-4 flex flex-wrap gap-2 ${centered ? "justify-center" : "justify-start"}`}>
              {socials.map((social) => {
                const platform = SOCIALS_BY_ID.get(social.platform);
                if (!platform) return null;
                const Icon = platform.icon;
                return (
                  <li key={social.id}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={platform.label}
                      className="grid h-10 w-10 place-items-center rounded-full transition-[background-color,transform] duration-200 hover:bg-[color-mix(in_oklab,currentColor_10%,transparent)] active:scale-95"
                      style={{ boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${cardInk} 35%, transparent)` }}
                    >
                      <Icon size={16} />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {links.length > 0 && (
          <LinkTiles links={links} theme={theme} radius={radius} preview={preview} headingFont={headingFont} centered={centered} />
        )}

        {theme.showFooter && (
          <Link
            href="/"
            className="mx-auto mt-10 mb-2 text-xs font-semibold tracking-wide"
            style={{ color: footerInk }}
          >
            {APP_NAME}
          </Link>
        )}
        {!theme.showFooter && <div className="mb-6" />}
      </main>

      {theme.showDock && (
        <ActionDock
          username={data.username}
          name={contactName}
          phone={phone}
          // Without WhatsApp, the card's second pill is already Email.
          email={whatsapp ? email : null}
          colors={dockColors(theme)}
        />
      )}
    </div>
  );
}

type TilesProps = {
  links: PageData["links"];
  theme: Theme;
  radius: number;
  preview: boolean;
  headingFont: string;
  centered: boolean;
};

/** The owner's links as a picture grid, a full-width list, or compact chips. */
function LinkTiles({ links, theme, radius, preview, headingFont, centered }: TilesProps) {
  const linkProps = (link: PageData["links"][number]) => ({
    href: preview ? link.url : `/go/${link.id}`,
    target: preview ? "_blank" : undefined,
    rel: preview ? "noopener noreferrer" : "nofollow",
  });
  const image = (link: PageData["links"][number]) => (theme.showPreviews ? link.imageUrl : null);
  const innerRadius = Math.max(radius - 8, 4);

  if (theme.linkLayout === "chips") {
    return (
      <ul className={`mt-3 flex flex-wrap gap-2 ${centered ? "justify-center" : "justify-start"}`}>
        {links.map((link, i) => {
          const Icon = platformForUrl(link.url).icon;
          return (
            <li key={link.id} className="pf-rise" style={{ "--i": i + 1 } as CSSProperties}>
              <a
                {...linkProps(link)}
                className="pf-tile inline-flex h-11 max-w-full items-center gap-2 px-4 font-semibold"
                style={{ ...tileStyle(theme, radius >= 20 ? 9999 : radius), fontSize: fs(14), fontFamily: headingFont }}
              >
                <Icon aria-hidden size={15} className="shrink-0" />
                <span className="truncate">{link.title}</span>
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

  if (theme.linkLayout === "list") {
    return (
      <ul className="mt-2.5 flex flex-col gap-2.5">
        {links.map((link, i) => {
          const Icon = platformForUrl(link.url).icon;
          const caption = linkCaption(link.url);
          const src = image(link);
          return (
            <li key={link.id} className="pf-rise" style={{ "--i": i + 1 } as CSSProperties}>
              <a {...linkProps(link)} className="pf-tile flex min-h-[72px] items-center gap-3 p-2 pr-3" style={tileStyle(theme, radius)}>
                <span
                  aria-hidden
                  className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden"
                  style={{ borderRadius: innerRadius }}
                >
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element -- stored copy of the site's preview image
                    <img src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <Icon size={26} />
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="leading-tight font-semibold break-words" style={{ fontSize: fs(15), fontFamily: headingFont }}>
                    {link.title}
                  </span>
                  {caption && (
                    <span className="mt-1 block truncate opacity-75" style={{ fontSize: fs(12) }}>
                      {caption}
                    </span>
                  )}
                </span>
                <span
                  aria-hidden
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                  style={{ background: "color-mix(in oklab, currentColor 12%, transparent)" }}
                >
                  <FaArrowRight size={12} />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

  // Grid: two columns; an odd last tile spans both with its picture on the right.
  const wideIndex = links.length % 2 === 1 ? links.length - 1 : -1;
  return (
    <ul className="mt-2.5 grid grid-cols-2 gap-2.5">
      {links.map((link, i) => {
        const wide = i === wideIndex;
        const Icon = platformForUrl(link.url).icon;
        const caption = linkCaption(link.url);
        const src = image(link);
        let media: ReactNode;
        if (src) {
          media = (
            <span
              className={`relative shrink-0 overflow-hidden ${wide ? "aspect-[4/3] self-center" : "aspect-video w-full"}`}
              style={{ borderRadius: innerRadius, ...(wide ? { width: "42%" } : {}) }}
            >
              {/* Preview images carry their own text; show them whole over a blurred fill, never cropped. */}
              {/* eslint-disable-next-line @next/next/no-img-element -- stored copy of the site's preview image */}
              <img src={src} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full scale-125 object-cover blur-xl" />
              {/* eslint-disable-next-line @next/next/no-img-element -- stored copy of the site's preview image */}
              <img src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-contain" />
            </span>
          );
        } else {
          media = (
            <span aria-hidden className={`grid shrink-0 place-items-center ${wide ? "w-[30%]" : "aspect-[1/0.62] w-full"}`}>
              <Icon size={wide ? 48 : 56} />
            </span>
          );
        }
        return (
          <li key={link.id} className={`pf-rise ${wide ? "col-span-2" : ""}`} style={{ "--i": i + 1 } as CSSProperties}>
            <a
              {...linkProps(link)}
              className={`pf-tile flex h-full p-2 ${wide ? "min-h-[152px] flex-row-reverse items-stretch gap-3" : "flex-col"}`}
              style={tileStyle(theme, radius)}
            >
              {media}
              <span className={`flex min-w-0 flex-1 flex-col ${wide ? "justify-center py-3 pl-3" : "px-1.5 pt-2.5 pb-1"}`}>
                <span
                  className={`leading-tight font-semibold break-words ${wide ? "" : "line-clamp-2"}`}
                  style={{ fontSize: fs(wide ? 17 : 14), fontFamily: headingFont }}
                >
                  {link.title}
                </span>
                {caption && (
                  <span className="mt-1 block truncate opacity-75" style={{ fontSize: fs(12) }}>
                    {caption}
                  </span>
                )}
                {wide && (
                  <span
                    className="mt-3 inline-flex w-fit items-center rounded-full px-4 py-2 font-semibold"
                    style={{
                      fontSize: fs(13),
                      background: theme.buttonStyle === "outline" ? theme.buttonBg : theme.buttonText,
                      color: theme.buttonStyle === "outline" ? theme.bg : theme.buttonBg,
                    }}
                  >
                    Open
                  </span>
                )}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
