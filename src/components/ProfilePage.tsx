import type { CSSProperties } from "react";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import ActionDock from "@/components/ActionDock";
import { ContactPills } from "@/components/ContactActions";
import { APP_NAME } from "@/lib/config";
import { contactEmail, contactPhone, linkCaption, platformForUrl, SOCIALS_BY_ID } from "@/lib/socials";
import { bestOn, contrast, FONTS, similarColors, type Theme } from "@/lib/themes";
import type { PageData } from "@/lib/types";

const TILE_RADIUS: Record<Theme["buttonShape"], number> = { square: 14, rounded: 28, pill: 34 };

/** Tile surface in the owner's chosen button style. Filled tiles get a soft metallic sheen. */
function tileStyle(theme: Theme): CSSProperties {
  const base: CSSProperties = { borderRadius: TILE_RADIUS[theme.buttonShape] };
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
        boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.45), inset 0 0 0 1px rgb(255 255 255 / 0.12), 0 14px 30px -18px rgb(0 0 0 / 0.55)`,
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
  const whatsapp = phone ? `https://wa.me/${phone.slice(1)}` : null;
  // The name a saved contact gets: the display name, or the bare handle.
  const contactName = data.displayName || data.username;
  const background =
    theme.bgStyle === "gradient" ? `linear-gradient(165deg, ${theme.bg}, ${theme.bg2})` : theme.bg;
  const cover = data.coverUrl;

  // The profile card is the page's dark "ink" object. When filled tiles are already the ink colour,
  // it switches to a tinted page-colour surface so card and tiles don't merge into one slab.
  const cardBlends = theme.buttonStyle === "fill" && similarColors(theme.buttonBg, theme.text);
  const cardBg = cardBlends ? `color-mix(in oklab, ${theme.bg} 88%, ${theme.text})` : theme.text;
  const solidCard = cardBlends ? theme.bg : theme.text;
  const themed = bestOn(solidCard, [theme.bg, theme.bg2, theme.buttonBg, theme.buttonText]);
  const cardInk = cover ? "#ffffff" : contrast(themed, solidCard) >= 4.5 ? themed : bestOn(solidCard, ["#ffffff", "#0d0d0f"]);

  // WhatsApp has its own button on the card, so it isn't repeated among the social icons.
  const socials = phone ? data.socials.filter((s) => s.platform !== "whatsapp") : data.socials;
  const wideIndex = data.links.length % 2 === 1 ? data.links.length - 1 : -1;
  const radius = TILE_RADIUS[theme.buttonShape];
  // The footer sits at the bottom of the page, where a gradient has reached its second colour.
  const pageBottom = theme.bgStyle === "gradient" ? theme.bg2 : theme.bg;
  const footerInk = bestOn(pageBottom, [theme.text, theme.bg, theme.bg2, theme.buttonBg, theme.buttonText]);

  return (
    <div
      className={`profile relative isolate flex w-full flex-col ${preview ? "min-h-full" : "min-h-dvh"}`}
      style={
        {
          "--pf-bg": theme.bg,
          "--pf-ink": theme.text,
          "--pf-btn": theme.buttonBg,
          "--pf-btn-ink": theme.buttonText,
          background,
          color: theme.text,
          fontFamily: FONTS[theme.font].variable,
        } as CSSProperties
      }
    >
      {!preview && cover && (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element -- user upload */}
          <img src={cover} alt="" className="h-full w-full scale-110 object-cover opacity-60 blur-3xl saturate-125" />
          <div className="absolute inset-0" style={{ background, opacity: 0.55 }} />
        </div>
      )}

      <main className={`mx-auto flex w-full max-w-[440px] flex-1 flex-col ${preview ? "px-2.5 pt-2.5" : "px-3 pt-3 sm:pt-8"}`}>
        {/* Profile card */}
        <section
          className="pf-rise pf-ink relative isolate overflow-hidden rounded-[34px] px-5 pt-8 pb-6 text-center"
          style={
            {
              color: cardInk,
              background: cover
                ? "#0d0d0f"
                : `linear-gradient(180deg, color-mix(in oklab, ${cardBg} 84%, white) 0%, ${cardBg} 42%, color-mix(in oklab, ${cardBg} 90%, black) 100%)`,
              boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.18), inset 0 0 0 1px color-mix(in oklab, ${cardInk} 10%, transparent), 0 24px 50px -28px rgb(0 0 0 / 0.7)`,
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
            className="mx-auto block w-fit rounded-full p-[5px]"
            style={{
              background: `color-mix(in oklab, ${cardInk} 92%, transparent)`,
              boxShadow: "0 10px 28px -10px rgb(0 0 0 / 0.6)",
            }}
          >
            {data.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- user upload
              <img src={data.avatarUrl} alt="" width={112} height={112} className="block h-28 w-28 rounded-full object-cover" />
            ) : (
              <span
                aria-hidden
                className="grid h-28 w-28 place-items-center rounded-full text-4xl font-semibold"
                style={{ background: solidCard, color: cardInk }}
              >
                {(data.displayName || data.username).charAt(0).toUpperCase()}
              </span>
            )}
          </span>

          <h1
            className={`mt-4 font-semibold tracking-[-0.01em] text-balance break-words ${
              name.length > 18 ? "text-[19px] leading-snug" : "text-[22px] leading-tight"
            }`}
          >
            {breakable(name)}
            {data.verified && (
              <MdVerified aria-label="Verified" role="img" className="ml-1.5 inline-block size-[0.85em] -translate-y-[0.06em] align-middle" />
            )}
          </h1>
          {data.displayName && <p className="mt-1 text-[13px] opacity-60">@{data.username}</p>}
          {data.bio && (
            <p className="mx-auto mt-2.5 max-w-[30ch] text-[14px] leading-relaxed whitespace-pre-line opacity-75">{data.bio}</p>
          )}

          <ContactPills username={data.username} name={contactName} phone={phone} email={email} whatsapp={whatsapp} ink={cardInk} />

          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap justify-center gap-2">
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

        {/* Link tiles */}
        {data.links.length > 0 && (
          <ul className="mt-2.5 grid grid-cols-2 gap-2.5">
            {data.links.map((link, i) => {
              const wide = i === wideIndex;
              const platform = platformForUrl(link.url);
              const Icon = platform.icon;
              const caption = linkCaption(link.url);
              const media = (
                <span
                  className={`relative grid shrink-0 place-items-center overflow-hidden ${wide ? "aspect-square h-full" : "aspect-[1/0.82] w-full"}`}
                  style={{
                    borderRadius: Math.max(radius - 8, 8),
                    background: "color-mix(in oklab, currentColor 9%, transparent)",
                  }}
                >
                  {link.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- stored copy of the site's preview image
                    <img src={link.imageUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <Icon aria-hidden size={wide ? 34 : 30} className="opacity-80" />
                  )}
                </span>
              );
              return (
                <li key={link.id} className={`pf-rise ${wide ? "col-span-2" : ""}`} style={{ "--i": i + 1 } as CSSProperties}>
                  <a
                    href={preview ? link.url : `/go/${link.id}`}
                    target={preview ? "_blank" : undefined}
                    rel={preview ? "noopener noreferrer" : "nofollow"}
                    className={`pf-tile flex h-full p-2 ${wide ? "h-[136px] flex-row-reverse items-stretch gap-3" : "flex-col"}`}
                    style={tileStyle(theme)}
                  >
                    {media}
                    <span className={`flex min-w-0 flex-1 flex-col ${wide ? "justify-center pl-3" : "px-1.5 pt-2.5 pb-1"}`}>
                      <span className={`font-semibold leading-tight break-words ${wide ? "text-[17px]" : "line-clamp-2 text-[14px]"}`}>
                        {link.title}
                      </span>
                      {caption && <span className="mt-1 block truncate text-[12px] opacity-60">{caption}</span>}
                      {wide && (
                        <span
                          className="mt-3 inline-flex w-fit items-center rounded-full px-4 py-2 text-[13px] font-semibold"
                          style={{
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
        )}

        <Link
          href="/"
          className="mx-auto mt-10 mb-2 text-xs font-semibold tracking-wide opacity-70 transition-opacity hover:opacity-100"
          style={{ color: footerInk }}
        >
          {APP_NAME}
        </Link>
      </main>

      <ActionDock
        username={data.username}
        name={contactName}
        phone={phone}
        email={email}
        whatsapp={whatsapp}
        ink={theme.text}
        paper={theme.bg}
      />
    </div>
  );
}
