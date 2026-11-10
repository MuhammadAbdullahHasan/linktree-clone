import type { CSSProperties } from "react";
import {
  FaArrowRight,
  FaChevronRight,
  FaCircleCheck,
  FaCloud,
  FaDatabase,
  FaHeadset,
  FaLocationDot,
  FaNetworkWired,
  FaShieldHalved,
} from "react-icons/fa6";
import { BusinessQr, BusinessQuickActions } from "@/components/BusinessActions";
import { APP_NAME } from "@/lib/config";
import { linkCaption, platformForUrl } from "@/lib/socials";
import type { BusinessTheme } from "@/lib/themes";
import type { PageData } from "@/lib/types";

type Link = PageData["links"][number];

type Props = {
  data: PageData;
  /** Links left after the page drops duplicates of its contact buttons. */
  links: Link[];
  name: string;
  contactName: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  preview: boolean;
  /** Room to leave under the content for the floating dock. */
  dockSpace: boolean;
};

/** The template's colours as CSS variables, read by the .biz rules in globals.css. */
export function businessVars(b: BusinessTheme): CSSProperties {
  return {
    "--biz-bg": b.bg,
    "--biz-surface": b.surface,
    "--biz-surface-hover": b.surfaceHover,
    "--biz-card": b.card,
    "--biz-border": b.border,
    "--biz-icon-tile": b.iconTile,
    "--biz-text": b.text,
    "--biz-muted": b.muted,
    "--biz-accent": b.accent,
    "--biz-accent-light": b.accentLight,
  } as CSSProperties;
}

/** Service icons picked from words in the link title, falling back to the site's own icon. */
const SERVICE_ICONS: [RegExp, typeof FaDatabase][] = [
  [/data|sql|backup/i, FaDatabase],
  [/cloud|hosting|aws|azure/i, FaCloud],
  [/cyber|secur|firewall/i, FaShieldHalved],
  [/network|wifi|lan\b/i, FaNetworkWired],
  [/support|help ?desk|service desk/i, FaHeadset],
];
function serviceIcon(link: Link) {
  return SERVICE_ICONS.find(([re]) => re.test(link.title))?.[1] ?? platformForUrl(link.url).icon;
}

/** "Service: description" lines; the description is optional. */
function parseServices(text: string) {
  return text
    .split("\n")
    .map((line) => {
      const i = line.indexOf(":");
      const title = (i > 0 ? line.slice(0, i) : line).trim();
      const subtitle = i > 0 ? line.slice(i + 1).trim() : "";
      return { title, subtitle };
    })
    .filter((s) => s.title);
}

/** "Title: subtitle" lines, keyed by lower-cased title. */
function parseSubtitles(text: string) {
  const map = new Map<string, string>();
  for (const line of text.split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) map.set(line.slice(0, i).trim().toLowerCase(), line.slice(i + 1).trim());
  }
  return map;
}

const sameUrl = (a: string, b: string) => a.trim().replace(/\/+$/, "").toLowerCase() === b.trim().replace(/\/+$/, "").toLowerCase();

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default function BusinessProfile({ data, links, name, contactName, phone, email, whatsapp, preview, dockSpace }: Props) {
  const b = data.theme.business;

  // A link's address: through /go/ so the click is counted, or straight out in the dashboard preview.
  const linkProps = (link: Link) => ({
    href: preview ? link.url : `/go/${link.id}`,
    target: preview ? "_blank" : undefined,
    rel: preview ? "noopener noreferrer" : "nofollow",
  });
  // A configured address that is also one of the owner's links goes through that link (and its tracking).
  const target = (url: string) => {
    if (!url) return null;
    const link = links.find((l) => sameUrl(l.url, url));
    if (link) return { link, props: linkProps(link) };
    const external = /^https?:/i.test(url);
    return { link: null, props: { href: url, target: external ? "_blank" : undefined, rel: external ? "noopener noreferrer" : undefined } };
  };

  // "datacare-solutions.com" is enough; the page adds https://.
  const websiteUrl = b.websiteUrl && !/^[a-z][a-z0-9+.-]*:/i.test(b.websiteUrl) ? `https://${b.websiteUrl}` : b.websiteUrl;
  const website = target(websiteUrl);
  const cta = target(b.ctaUrl || whatsapp || (phone ? `tel:${phone}` : email ? `mailto:${email}` : ""));
  const services = links.filter((l) => l !== website?.link && l !== cta?.link);
  const subtitles = parseSubtitles(b.linkSubtitles);
  const textServices = parseServices(b.services);
  const platforms = b.platforms
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const tagline = b.tagline || data.bio;
  const domain = hostOf(websiteUrl);

  return (
    <main
      className="mx-auto flex w-full max-w-[390px] flex-1 flex-col px-4 pt-8"
      // The dock is sticky and already takes its own height at the end of the page, so this only
      // adds breathing room; without a dock the page ends with a little more.
      style={{ paddingBottom: dockSpace ? 24 : 40 }}
    >
      {/* Header */}
      <header className="text-center">
        {data.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- user upload
          <img
            src={data.avatarUrl}
            alt=""
            width={88}
            height={88}
            className="mx-auto block h-[88px] w-[88px] rounded-[22px] object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="biz-heading mx-auto grid h-[88px] w-[88px] place-items-center rounded-[22px] text-[34px] font-bold"
            style={{ background: "var(--biz-icon-tile)", color: "var(--biz-accent-light)" }}
          >
            {contactName.charAt(0).toUpperCase()}
          </span>
        )}
        <h1 className="biz-heading mt-5 text-[30px] leading-[1.1] font-bold tracking-[-0.02em] text-balance break-words">{name}</h1>
        {b.legalName && <p className="biz-label mt-2 text-[var(--biz-muted)]">{b.legalName}</p>}
        {tagline && <p className="mt-3 text-[15px] leading-snug text-[var(--biz-text)]">{tagline}</p>}
        {b.location && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[14px] text-[var(--biz-muted)]">
            <FaLocationDot aria-hidden size={13} className="biz-icon" />
            {b.location}
          </p>
        )}
      </header>

      {/* Quick actions */}
      <div className="mt-7">
        <BusinessQuickActions username={data.username} name={contactName} phone={phone} email={email} />
      </div>

      {website && (
        <a {...website.props} className="biz-primary mt-3">
          <span>{b.websiteLabel || "Visit our website"}</span>
          <FaArrowRight aria-hidden size={16} />
        </a>
      )}

      {(textServices.length > 0 || services.length > 0) && (
        <section className="mt-8" aria-labelledby="biz-services">
          <h2 id="biz-services" className="biz-label biz-section">
            {b.servicesLabel || "What we do"}
          </h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {textServices.map((service, i) => {
              const Icon = SERVICE_ICONS.find(([re]) => re.test(service.title))?.[1] ?? FaCircleCheck;
              return (
                <li key={`s${i}`} className="biz-row biz-row-static">
                  <span aria-hidden className="biz-icon-tile">
                    <Icon size={18} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="biz-heading text-[16px] leading-tight font-semibold">{service.title}</span>
                    {service.subtitle && <span className="mt-1 text-[13px] leading-snug text-[var(--biz-muted)]">{service.subtitle}</span>}
                  </span>
                </li>
              );
            })}
            {services.map((link) => {
              const Icon = serviceIcon(link);
              const subtitle = subtitles.get(link.title.trim().toLowerCase()) ?? linkCaption(link.url);
              return (
                <li key={link.id}>
                  <a {...linkProps(link)} className="biz-row">
                    <span aria-hidden className="biz-icon-tile">
                      <Icon size={18} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="biz-heading truncate text-[16px] leading-tight font-semibold">{link.title}</span>
                      {subtitle && <span className="mt-1 truncate text-[13px] text-[var(--biz-muted)]">{subtitle}</span>}
                    </span>
                    <FaChevronRight aria-hidden size={14} className="shrink-0 text-[var(--biz-muted)]" />
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {platforms.length > 0 && (
        <section className="mt-8" aria-labelledby="biz-platforms">
          <h2 id="biz-platforms" className="biz-label biz-section">
            {b.platformsLabel || "Platforms we support"}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {platforms.map((p) => (
              <li key={p} className="biz-chip">
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}

      {cta && (
        <a {...cta.props} className="biz-outline mt-8">
          {b.ctaLabel || "Speak to an IT specialist"}
        </a>
      )}

      {/* Tap or scan */}
      <section className="biz-qr-card mt-3" aria-label={b.qrLabel || "Tap or scan"}>
        <BusinessQr username={data.username} />
        <p className="min-w-0">
          <span className="biz-label block">{b.qrLabel || "Tap or scan"}</span>
          <span className="mt-1.5 block text-[15px] leading-snug text-[var(--biz-text)]">{b.qrText || "to open our business profile"}</span>
        </p>
      </section>

      <footer className="mt-8 flex flex-col items-center gap-1 text-center text-[13px] text-[var(--biz-muted)]">
        {domain && <span>{domain}</span>}
        {data.theme.showFooter && <span>Powered by {APP_NAME}</span>}
      </footer>
    </main>
  );
}
