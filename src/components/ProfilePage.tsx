import type { CSSProperties } from "react";
import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import SaveContactButton from "@/components/SaveContactButton";
import { contactEmail, contactPhone, SOCIALS_BY_ID } from "@/lib/socials";
import { FONTS, type Theme } from "@/lib/themes";
import type { PageData } from "@/lib/types";

const RADIUS: Record<Theme["buttonShape"], string> = {
  square: "6px",
  rounded: "16px",
  pill: "9999px",
};

function buttonStyle(theme: Theme): CSSProperties {
  const base: CSSProperties = { borderRadius: RADIUS[theme.buttonShape] };
  switch (theme.buttonStyle) {
    case "outline":
      return { ...base, border: `2px solid ${theme.buttonBg}`, color: theme.buttonBg, background: "transparent" };
    case "shadow":
      return {
        ...base,
        background: theme.buttonBg,
        color: theme.buttonText,
        border: `2px solid ${theme.text}`,
        boxShadow: `4px 4px 0 ${theme.text}`,
      };
    default:
      return { ...base, background: theme.buttonBg, color: theme.buttonText };
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
  const phone = contactPhone(data.socials);
  const background =
    theme.bgStyle === "gradient" ? `linear-gradient(165deg, ${theme.bg}, ${theme.bg2})` : theme.bg;

  return (
    <div
      className={`flex w-full flex-col items-center px-5 pb-8 ${preview ? "min-h-full pt-10" : "min-h-dvh pt-16"}`}
      style={{ background, color: theme.text, fontFamily: FONTS[theme.font].variable }}
    >
      <main className="flex w-full max-w-[580px] flex-1 flex-col items-center">
        {data.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- user uploads from Supabase Storage
          <img
            src={data.avatarUrl}
            alt=""
            className="h-24 w-24 rounded-full object-cover"
            width={96}
            height={96}
          />
        ) : (
          <div
            aria-hidden
            className="flex h-24 w-24 items-center justify-center rounded-full text-4xl font-semibold"
            style={{ background: theme.buttonBg, color: theme.buttonText }}
          >
            {(data.displayName || data.username).charAt(0).toUpperCase()}
          </div>
        )}

        <h1 className="mt-4 text-center text-xl font-bold break-words">{name}</h1>
        {data.bio && (
          <p className="mt-2 max-w-sm text-center text-[15px] leading-relaxed whitespace-pre-line opacity-85">
            {data.bio}
          </p>
        )}

        {data.socials.length > 0 && (
          <ul className="mt-5 flex flex-wrap justify-center gap-4">
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
                    className="block transition-transform hover:scale-110"
                  >
                    <Icon size={26} />
                  </a>
                </li>
              );
            })}
          </ul>
        )}

        {phone && (
          <SaveContactButton
            username={data.username}
            name={data.displayName || data.username}
            phone={phone}
            email={contactEmail(data.socials)}
            style={buttonStyle(theme)}
          />
        )}

        <ul className="mt-8 flex w-full flex-col gap-4">
          {data.links.map((link) => (
            <li key={link.id}>
              <a
                href={preview ? link.url : `/go/${link.id}`}
                target={preview ? "_blank" : undefined}
                rel={preview ? "noopener noreferrer" : "nofollow"}
                className="block w-full px-5 py-4 text-center text-[15px] font-semibold break-words transition-transform hover:scale-[1.02] active:scale-[0.99]"
                style={buttonStyle(theme)}
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>

        {data.links.length === 0 && data.socials.length === 0 && (
          <p className="mt-8 text-sm opacity-70">No links yet.</p>
        )}
      </main>

      <Link href="/" className="mt-12 text-xs font-semibold tracking-wide opacity-70 hover:opacity-100">
        {APP_NAME}
      </Link>
    </div>
  );
}
