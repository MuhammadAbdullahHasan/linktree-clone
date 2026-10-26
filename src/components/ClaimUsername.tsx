"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { siteHost } from "@/lib/config";

export default function ClaimUsername() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(value ? `/signup?username=${encodeURIComponent(value)}` : "/signup");
      }}
      className="flex flex-col gap-2 sm:flex-row"
    >
      <label className="flex min-w-0 flex-1 items-center rounded-full border border-neutral-300 bg-white pl-5 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15">
        <span className="text-neutral-500">{siteHost()}/</span>
        <input
          aria-label="Choose a username"
          placeholder="yourname"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={30}
          className="w-full min-w-0 bg-transparent py-3.5 pr-4 outline-none"
          value={value}
          onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
        />
      </label>
      <button type="submit" className="btn-primary px-6 py-3.5 text-[15px]">
        Claim your link
      </button>
    </form>
  );
}
