import type { CSSProperties } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import { MdVerified } from "react-icons/md";
import ActionDock from "@/components/ActionDock";
import { APP_NAME } from "@/lib/config";
import { contactEmail, contactPhone, linkCaption, SOCIALS_BY_ID } from "@/lib/socials";
import { FONTS, similarColors, type Theme } from "@/lib/themes";
import type { PageData } from "@/lib/types";

const TILE_RADIUS: Record<Theme["buttonShape"], string> = {
  square: "10px",
  rounded: "22px",
  pill: "9999px",
};

function tileStyle(theme: Theme): CSSProperties {
  const base: CSSProperties = { borderRadius: TILE_RADIUS[theme.buttonShape] };
  switch (theme.buttonStyle) {
    case "outline":
      return { ...base, border: `1.5px solid ${theme.buttonBg}`, color: theme.text, background: "transparent" };
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
        background: theme.buttonBg,
        color: theme.buttonText,
        boxShadow: "0 1px 2px rgb(0 0 0 / 0.06), 0 8px 24px -12px rgb(0 0 0 / 0.25)",
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
  const background =
    theme.bgStyle === "gradient" ? `linear-gradient(165deg, ${theme.bg}, ${theme.bg2})` : theme.bg;
  const cover = data.coverUrl;
  const vars = {
    "--pf-bg": theme.bg,
    "--pf-ink": theme.text,
    "--pf-btn": theme.buttonBg,
    "--pf-btn-ink": theme.buttonText,
    background,
    color: theme.text,
    fontFamily: FONTS[theme.font].variable,
  } as CSSProperties;

  // WhatsApp sits in the dock whenever there's a number, so the panel doesn't repeat it.
  const socials = phone ? data.socials.filter((s) => s.platform !== "whatsapp") : data.socials;
  // The panel only appears when it has something the hero doesn't already say.
  const hasPanel = Boolean(data.bio || socials.length);
  // The panel is normally an inverse "ink" surface. When filled tiles are already the ink colour,
  // it switches to a tinted page-colour surface so panel and tiles don't merge into one slab.
  const panelBlends = theme.buttonStyle === "fill" && similarColors(theme.buttonBg, theme.text);
  const panelBg = panelBlends ? `color-mix(in oklab, ${theme.bg} 90%, ${theme.text})` : theme.text;
  const panelInk = panelBlends ? theme.text : theme.bg;

  return (
    <div className={`profile relative isolate flex w-full flex-col ${preview ? "min-h-full" : "min-h-dvh"}`} style={vars}>
      {!preview && cover && (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element -- user upload */}
          <img src={cover} alt="" className="h-full w-full scale-110 object-cover opacity-60 blur-3xl saturate-125" />
          <div className="absolute inset-0" style={{ background, opacity: 0.55 }} />
        </div>
      )}

      <main className={`mx-auto flex w-full max-w-[480px] flex-1 flex-col ${preview ? "px-2.5 pt-2.5" : "px-3 pt-3 sm:pt-8"}`}>
        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-[32px]"
          style={{
            // Without a cover there's no photo to show off, so the hero shrinks to a name card.
            height: cover ? (preview ? 310 : "min(56svh, 520px)") : preview ? 220 : "min(34svh, 300px)",
            minHeight: preview ? undefined : cover ? 360 : 250,
            // No cover: the name sits straight on the page background (a gradient squeezed into this
            // short box would put dark text on the gradient's dark end).
            background: cover ? "#111" : "transparent",
          }}
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- user upload
            <img src={cover} alt="" className="pf-hero-media absolute inset-0 h-full w-full object-cover" />
          ) : data.avatarUrl ? null : (
            <span
              aria-hidden
              className="absolute -top-6 -right-4 select-none text-[220px] leading-none font-bold opacity-15"
            >
              {(data.displayName || data.username).charAt(0).toUpperCase()}
            </span>
          )}

          {cover && (
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgb(0 0 0 / 0.68) 0%, rgb(0 0 0 / 0.28) 42%, rgb(0 0 0 / 0) 68%)",
              }}
            />
          )}

          <div
            className={`absolute inset-x-0 bottom-0 px-6 ${hasPanel ? "pb-12" : "pb-6"} ${cover ? "" : "text-center"}`}
            style={{ color: cover ? "#fff" : theme.text }}
          >
            {!cover && data.avatarUrl && (
              <span
                className="mb-4 inline-block rounded-full p-[3px]"
                style={{ boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${theme.text} 45%, transparent)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- user upload */}
                <img src={data.avatarUrl} alt="" width={88} height={88} className="block h-[88px] w-[88px] rounded-full object-cover" />
              </span>
            )}
            <h1
              className={`font-semibold tracking-[-0.02em] text-balance break-words ${
                preview
                  ? name.length > 16 ? "text-[22px] leading-[1.1]" : "text-[28px] leading-[1.05]"
                  : name.length > 16
                    ? "text-[clamp(1.6rem,7vw,2.25rem)] leading-[1.08]"
                    : "text-[clamp(2rem,9vw,2.75rem)] leading-[1.03]"
              }`}
            >
              {breakable(name)}
              {data.verified && (
                <MdVerified aria-label="Verified" role="img" className="ml-2 inline-block size-[0.72em] -translate-y-[0.08em] align-middle" />
              )}
            </h1>
            {data.displayName && <p className="mt-1.5 text-[15px] font-medium opacity-75">@{data.username}</p>}
          </div>
        </section>

        {/* Ink panel */}
        {hasPanel && (
          <section
            className="pf-rise pf-ink relative z-10 -mt-7 rounded-[32px] px-5 py-5"
            style={
              {
                background: panelBg,
                color: panelInk,
                boxShadow: panelBlends ? `inset 0 0 0 1px color-mix(in oklab, ${theme.text} 14%, transparent)` : undefined,
                "--i": 0,
                "--pf-focus": panelInk,
              } as CSSProperties
            }
          >
            <div className="flex items-center gap-4">
              {cover && data.avatarUrl && (
                <span
                  className="shrink-0 rounded-full p-[3px]"
                  style={{ boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${panelInk} 70%, transparent)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- user upload */}
                  <img src={data.avatarUrl} alt="" width={64} height={64} className="block h-16 w-16 rounded-full object-cover" />
                </span>
              )}
              {data.bio && (
                <p className="min-w-0 text-[15px] leading-snug whitespace-pre-line" style={{ color: `color-mix(in oklab, ${panelInk} 82%, ${panelBg})` }}>
                  {data.bio}
                </p>
              )}
            </div>

            {socials.length > 0 && (
              <ul className={`flex flex-wrap gap-2.5 ${(cover && data.avatarUrl) || data.bio ? "mt-5" : ""}`}>
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
                        className="grid h-11 w-11 place-items-center rounded-full transition-[background-color,transform] duration-200 hover:scale-105 active:scale-95"
                        style={{ boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${panelInk} 40%, transparent)` }}
                      >
                        <Icon size={18} />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {/* Links */}
        <ul className="mt-3 flex flex-col gap-2.5">
          {data.links.map((link, i) => (
            <li key={link.id} className="pf-rise" style={{ "--i": i + 1 } as CSSProperties}>
              <a
                href={preview ? link.url : `/go/${link.id}`}
                target={preview ? "_blank" : undefined}
                rel={preview ? "noopener noreferrer" : "nofollow"}
                className="pf-tile group flex min-h-[68px] items-center gap-4 py-3 pr-3 pl-5"
                style={tileStyle(theme)}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] leading-tight font-semibold break-words">{link.title}</span>
                  {linkCaption(link.url) && (
                    <span className="mt-0.5 block truncate text-[13px] opacity-65">{linkCaption(link.url)}</span>
                  )}
                </span>
                <span
                  aria-hidden
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5"
                  style={{ background: "color-mix(in oklab, currentColor 13%, transparent)" }}
                >
                  <FaArrowRight size={13} />
                </span>
              </a>
            </li>
          ))}
        </ul>

        {data.links.length === 0 && !hasPanel && <p className="mt-8 text-center text-sm opacity-70">Nothing here yet.</p>}

        <Link
          href="/"
          className="mx-auto mt-10 mb-2 text-xs font-semibold tracking-wide opacity-60 transition-opacity hover:opacity-100"
        >
          {APP_NAME}
        </Link>
      </main>

      <ActionDock
        username={data.username}
        name={data.displayName || data.username}
        phone={phone}
        email={contactEmail(data.socials)}
        whatsapp={phone ? `https://wa.me/${phone.slice(1)}` : null}
        ink={theme.text}
        paper={theme.bg}
      />
    </div>
  );
}
