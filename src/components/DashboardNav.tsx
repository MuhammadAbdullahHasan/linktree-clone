"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Links" },
  { href: "/dashboard/appearance", label: "Appearance" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="order-last -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition ${
              active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-200/70"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
