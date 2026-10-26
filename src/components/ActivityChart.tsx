"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { day: string; views: number; clicks: number };

// Categorical slots 1 and 2 from the dataviz reference palette (light surface).
const SERIES = [
  { key: "views", label: "Views", color: "#2a78d6" },
  { key: "clicks", label: "Clicks", color: "#eb6834" },
] as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Formatted by hand so the server and browser render the same text regardless of locale.
const dayLabel = (day: string) => {
  const [, month, date] = day.split("-").map(Number);
  return `${MONTHS[month - 1]} ${date}`;
};

export default function ActivityChart({ data }: { data: Point[] }) {
  return (
    <div className="mt-4">
      <ul className="flex gap-5 text-sm text-neutral-700">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className="h-0.5 w-4 rounded" style={{ background: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>

      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid vertical={false} stroke="#ececea" />
            <XAxis
              dataKey="day"
              tickFormatter={dayLabel}
              tick={{ fontSize: 12, fill: "#73726c" }}
              tickLine={false}
              axisLine={{ stroke: "#d6d5d0" }}
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#73726c" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ stroke: "#a3a29c", strokeDasharray: "3 3" }}
              labelFormatter={(day) => dayLabel(String(day))}
              contentStyle={{ borderRadius: 12, border: "1px solid #e5e5e5", fontSize: 13 }}
              itemStyle={{ color: "#16151a" }}
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="linear"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-neutral-600 hover:text-neutral-900">Show as table</summary>
        <table className="mt-3 w-full max-w-md text-left tabular-nums">
          <thead className="text-neutral-500">
            <tr>
              <th className="py-1.5 font-medium">Day</th>
              <th className="py-1.5 text-right font-medium">Views</th>
              <th className="py-1.5 text-right font-medium">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {[...data].reverse().map((d) => (
              <tr key={d.day} className="border-t border-neutral-100">
                <td className="py-1.5">{dayLabel(d.day)}</td>
                <td className="py-1.5 text-right">{d.views}</td>
                <td className="py-1.5 text-right">{d.clicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
