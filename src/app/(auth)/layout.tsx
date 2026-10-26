import Link from "next/link";
import { APP_NAME } from "@/lib/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-10">
      <Link href="/" className="text-xl font-extrabold tracking-tight">
        {APP_NAME}
        <span className="text-accent">.</span>
      </Link>
      <div className="mt-12 w-full max-w-sm">{children}</div>
    </div>
  );
}
