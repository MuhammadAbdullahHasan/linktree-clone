// Rename the product here.
export const APP_NAME = "Linkfolio";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function siteHost() {
  return siteUrl().replace(/^https?:\/\//, "");
}
