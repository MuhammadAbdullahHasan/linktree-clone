import type { CSSProperties } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import { MdVerified } from "react-icons/md";
import ActionDock from "@/components/ActionDock";
import { APP_NAME } from "@/lib/config";
import { contactEmail, contactPhone, linkCaption, SOCIALS_BY_ID } from "@/lib/socials";
import { FONTS, type Theme } from "@/lib/themes";
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
  const media = data.coverUrl ?? data.avatarUrl;
  const vars = {
    "--pf-bg": theme.bg,
    "--pf-ink": theme.text,
    "--pf-btn": theme.buttonBg,
    "--pf-btn-ink": theme.buttonText,
    background,
    color: theme.text,
    fontFamily: FONTS[theme.font].variable,
  } as CSSProperties;

  // The panel only appears when it has something the hero doesn't already say.
  const hasPanel = Boolean(data.bio || data.socials.length);

  return (
    <div className={`profile relative isolate flex w-full flex-col ${preview ? "min-h-full" : "min-h-dvh"}`} style={vars}>
      {!preview && media && (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element -- user upload */}
          <img src={media} alt="" className="h-full w-full scale-110 object-cover opacity-60 blur-3xl saturate-125" />
          <div className="absolute inset-0" style={{ background, opacity: 0.55 }} />
        </div>
      )}

      <main className={`mx-auto flex w-full max-w-[480px] flex-1 flex-col ${preview ? "px-2.5 pt-2.5" : "px-3 pt-3 sm:pt-8"}`}>
        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-[32px]"
          style={{
            height: preview ? 310 : "min(56svh, 520px)",
            minHeight: preview ? undefined : 360,
            background: media ? "#111" : background,
          }}
        >
          {data.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- user upload
            <img src={data.coverUrl} alt="" className="pf-hero-media absolute inset-0 h-full w-full object-cover" />
          ) : data.avatarUrl ? (
            // No cover: the profile photo, enlarged and softened, becomes the backdrop.
            // eslint-disable-next-line @next/next/no-img-element -- user upload
            <img
              src={data.avatarUrl}
              alt=""
              className="pf-hero-media absolute inset-0 h-full w-full scale-125 object-cover blur-2xl saturate-150"
            />
          ) : (
            <span
              aria-hidden
              className="absolute -top-6 -right-4 select-none text-[220px] leading-none font-bold opacity-15"
            >
              {(data.displayName || data.username).charAt(0).toUpperCase()}
            </span>
          )}

          {media && (
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgb(0 0 0 / 0.68) 0%, rgb(0 0 0 / 0.28) 42%, rgb(0 0 0 / 0) 68%)",
              }}
            />
          )}

          <div className={`absolute inset-x-0 bottom-0 px-6 ${hasPanel ? "pb-12" : "pb-6"}`} style={{ color: media ? "#fff" : theme.text }}>
            {data.displayName && (
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md"
              style={
                media
                  ? { background: "rgb(255 255 255 / 0.82)", color: "rgb(0 0 0 / 0.78)" }
                  : { background: `color-mix(in oklab, ${theme.text} 12%, transparent)` }
              }
            >
              @{data.username}
            </span>
            )}
            <h1
              className={`${data.displayName ? "mt-3" : ""} font-semibold tracking-[-0.02em] text-balance break-words ${
                preview ? "text-[28px] leading-[1.05]" : "text-[clamp(2rem,9vw,2.75rem)] leading-[1.03]"
              }`}
            >
              {name}
              {data.verified && (
                <MdVerified aria-label="Verified" role="img" className="ml-2 inline-block size-[0.72em] -translate-y-[0.08em] align-middle" />
              )}
            </h1>
          </div>
        </section>

        {/* Ink panel */}
        {hasPanel && (
          <section
            className="pf-rise relative z-10 -mt-7 rounded-[32px] px-5 py-5"
            style={{ background: theme.text, color: theme.bg, "--i": 0 } as CSSProperties}
          >
            <div className="flex items-center gap-4">
              {data.avatarUrl && (
                <span
                  className="shrink-0 rounded-full p-[3px]"
                  style={{ boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${theme.bg} 70%, transparent)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- user upload */}
                  <img src={data.avatarUrl} alt="" width={64} height={64} className="block h-16 w-16 rounded-full object-cover" />
                </span>
              )}
              {data.bio && (
                <p className="min-w-0 text-[15px] leading-snug whitespace-pre-line" style={{ color: `color-mix(in oklab, ${theme.bg} 82%, ${theme.text})` }}>
                  {data.bio}
                </p>
              )}
            </div>

            {data.socials.length > 0 && (
              <ul className={`flex flex-wrap gap-2.5 ${data.avatarUrl || data.bio ? "mt-5" : ""}`}>
                {data.socials.map((social) => {
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
                        style={{ boxShadow: `inset 0 0 0 1.5px color-mix(in oklab, ${theme.bg} 40%, transparent)` }}
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
