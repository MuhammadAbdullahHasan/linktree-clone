import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { eq } from "drizzle-orm";
import { db, links } from "@/db";

const TIMEOUT_MS = 4000;
const MAX_HTML_BYTES = 300 * 1024;
const MAX_REDIRECTS = 3;

/** True for loopback, private, link-local and other non-public addresses. */
function isPrivateAddress(ip: string) {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    if (v.startsWith("::ffff:")) return isPrivateAddress(v.slice(7));
    return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb");
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

/** Only public http(s) hosts may be fetched; blocks requests into private networks. */
async function isSafeUrl(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (url.username || url.password) return false;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) return false;
  try {
    const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
    return addresses.length > 0 && addresses.every((a) => !isPrivateAddress(a.address));
  } catch {
    return false;
  }
}

async function readHead(res: Response) {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
    // The tags we need live in <head>; stop once it has closed.
    if (new TextDecoder().decode(value).includes("</head>")) break;
  }
  reader.cancel().catch(() => {});
  return new TextDecoder().decode(Buffer.concat(chunks));
}

function metaContent(html: string, keys: string[]) {
  for (const key of keys) {
    const tag = html.match(
      new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, "i"),
    )?.[0];
    const content = tag?.match(/content=["']([^"']+)["']/i)?.[1];
    if (content) return content.replace(/&amp;/g, "&").trim();
  }
  return null;
}

/**
 * The page's preview image (og:image / twitter:image) as an https URL, or null.
 * Never throws: a missing preview just means the tile shows an icon instead.
 */
export async function fetchPreviewImage(pageUrl: string): Promise<string | null> {
  try {
    let url = new URL(pageUrl);
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!(await isSafeUrl(url))) return null;
      const res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          // Many sites only serve preview tags to link-preview bots.
          "User-Agent": "facebookexternalhit/1.1 (+OneTap link preview)",
          Accept: "text/html",
        },
      });
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        url = new URL(res.headers.get("location")!, url);
        continue;
      }
      if (!res.ok || !(res.headers.get("content-type") ?? "").includes("text/html")) return null;

      const html = await readHead(res);
      const found = metaContent(html, ["og:image:secure_url", "og:image", "twitter:image", "twitter:image:src"]);
      if (!found) return null;
      const image = new URL(found, url);
      // Only https images, so pages never load mixed content.
      return image.protocol === "https:" && image.href.length <= 1024 ? image.href : null;
    }
    return null;
  } catch {
    return null;
  }
}

const MAX_IMAGE_BYTES = 800 * 1024;
// Smaller files are thumbnails (Instagram hands out a 150px profile picture) that look blurry on a tile.
const MIN_IMAGE_BYTES = 6 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

/** Downloads an image through the same public-address guard, or returns null. */
async function downloadImage(imageUrl: string) {
  try {
    let url = new URL(imageUrl);
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!(await isSafeUrl(url))) return null;
      const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        url = new URL(res.headers.get("location")!, url);
        continue;
      }
      const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
      if (!res.ok || !IMAGE_TYPES.has(type)) return null;
      if (Number(res.headers.get("content-length") ?? 0) > MAX_IMAGE_BYTES) return null;
      const data = Buffer.from(await res.arrayBuffer());
      return data.length >= MIN_IMAGE_BYTES && data.length <= MAX_IMAGE_BYTES ? { data, type } : null;
    }
    return null;
  } catch {
    return null;
  }
}

/** Fetches and stores the preview image for one link. Meant to run in `after()`, off the request path. */
export async function refreshLinkImage(linkId: string, url: string) {
  const image = url.startsWith("http") ? await fetchPreviewImage(url) : null;
  const file = image ? await downloadImage(image) : null;
  await db
    .update(links)
    .set({ image, imageData: file?.data ?? null, imageType: file?.type ?? null, imageCheckedAt: new Date() })
    .where(eq(links.id, linkId));
}
