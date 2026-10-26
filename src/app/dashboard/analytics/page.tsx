import Link from "next/link";
import ActivityChart from "@/components/ActivityChart";
import { clicksPerLink, dailyActivity } from "@/lib/analytics";
import { getDashboardData } from "@/lib/dashboard-data";

export const metadata = { title: "Analytics" };

const RANGES = [7, 30, 90] as const;

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { profile, links } = await getDashboardData();
  const requested = Number((await searchParams).days);
  const days = RANGES.find((r) => r === requested) ?? 7;

  const [series, clicksByLink] = await Promise.all([
    dailyActivity(profile.id, days),
    clicksPerLink(profile.id, days),
  ]);
  const views = series.reduce((sum, d) => sum + d.views, 0);
  const clicks = series.reduce((sum, d) => sum + d.clicks, 0);
  const ctr = views > 0 ? `${((clicks / views) * 100).toFixed(1)}%` : "–";

  const linkRows = links
    .map((l) => ({ id: l.id, title: l.title, active: l.isActive, clicks: clicksByLink.get(l.id) ?? 0 }))
    .sort((a, b) => b.clicks - a.clicks);
  const deletedClicks = [...clicksByLink.entries()]
    .filter(([id]) => !links.some((l) => l.id === id))
    .reduce((sum, [, c]) => sum + c, 0);
  const maxClicks = Math.max(1, ...linkRows.map((r) => r.clicks));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
          <p className="mt-1 text-neutral-600">Visits to your page and clicks on your links. Your own visits aren&apos;t counted.</p>
        </div>
        <nav aria-label="Time range" className="flex gap-1 rounded-full border border-neutral-300 bg-white p-1">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/dashboard/analytics?days=${r}`}
              aria-current={r === days ? "page" : undefined}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
                r === days ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {r} days
            </Link>
          ))}
        </nav>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Views" value={views.toLocaleString()} />
        <Stat label="Clicks" value={clicks.toLocaleString()} />
        <Stat label="Click rate" value={ctr} hint="Clicks per view" />
      </div>

      <section className="card p-6">
        <h2 className="text-lg font-bold">Daily activity</h2>
        <ActivityChart data={series} />
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold">Clicks per link</h2>
        {linkRows.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600">Add some links to see which ones people click.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead className="sr-only">
              <tr>
                <th>Link</th>
                <th>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {linkRows.map((row) => (
                <tr key={row.id} className="border-t border-neutral-100 first:border-0">
                  <td className="w-1/2 py-2.5 pr-4">
                    <span className="font-medium">{row.title}</span>
                    {!row.active && <span className="ml-2 text-xs text-neutral-500">(hidden)</span>}
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 flex-1">
                        <div
                          className="h-full rounded-r bg-[#2a78d6]"
                          style={{ width: `${(row.clicks / maxClicks) * 100}%`, minWidth: row.clicks ? 4 : 0 }}
                        />
                      </div>
                      <span className="w-12 text-right font-semibold tabular-nums">{row.clicks.toLocaleString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {deletedClicks > 0 && (
          <p className="mt-3 text-xs text-neutral-500">
            Plus {deletedClicks.toLocaleString()} clicks on links you&apos;ve since deleted.
          </p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-neutral-600">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
