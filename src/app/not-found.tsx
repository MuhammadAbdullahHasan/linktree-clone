import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-extrabold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold">This page doesn&apos;t exist</h1>
      <p className="mt-2 text-neutral-600">The link may be wrong, or this username hasn&apos;t been claimed yet.</p>
      <div className="mt-8 flex gap-2">
        <Link href="/" className="btn-secondary">Go home</Link>
        <Link href="/signup" className="btn-primary">Claim it</Link>
      </div>
    </div>
  );
}
