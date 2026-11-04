import { siteUrl } from "@/lib/config";
import { getPublicPage } from "@/lib/page-data";
import { allPhones, contactEmail } from "@/lib/socials";

/** Escapes a value for a vCard 3.0 text field. */
const esc = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/[,;]/g, (c) => `\\${c}`);

/** A contact card (.vcf) for the page, so visitors can add it to their phone's contacts in one tap. */
export async function GET(_request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const page = (await getPublicPage(decodeURIComponent(username)))?.page;
  // Every number on the page; the first (the one Call rings) is the preferred one.
  const phones = page ? allPhones(page.socials, page.links) : [];
  if (!page || !phones.length) return new Response("Not found", { status: 404 });

  const name = page.displayName || page.username;
  const email = contactEmail(page.socials);
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:;${esc(name)};;;`,
    `FN:${esc(name)}`,
    ...phones.map((phone, i) => `TEL;TYPE=CELL,VOICE${i === 0 ? ",PREF" : ""}:${phone}`),
    email && `EMAIL;TYPE=INTERNET:${esc(email)}`,
    `URL:${siteUrl()}/${page.username}`,
    page.bio && `NOTE:${esc(page.bio)}`,
    "END:VCARD",
  ].filter(Boolean);

  const filename = page.username.replace(/[^a-z0-9_.-]/gi, "") || "contact";
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      // inline: iPhone Safari shows the contact card instead of offering a file download.
      "Content-Disposition": `inline; filename="${filename}.vcf"`,
      "Cache-Control": "no-store",
    },
  });
}
