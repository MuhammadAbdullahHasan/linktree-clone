"use client";

import { useRef, useState } from "react";
import { FaCamera, FaTrash } from "react-icons/fa6";
import { deleteSocial, saveSocial, updateProfile, updateTheme } from "@/app/dashboard/actions";
import PhonePreview from "@/components/PhonePreview";
import { SOCIAL_PLATFORMS, SOCIALS_BY_ID } from "@/lib/socials";
import { createClient } from "@/lib/supabase/client";
import { FONTS, THEME_PRESETS, type Theme } from "@/lib/themes";
import type { Link, PageData, SocialLink } from "@/lib/types";
import { useAutosave, type SaveStatus } from "@/lib/use-autosave";

type ProfileFields = { displayName: string; bio: string; avatarUrl: string | null };

type Props = {
  userId: string;
  username: string;
  initialProfile: ProfileFields;
  initialTheme: Theme;
  initialSocials: SocialLink[];
  links: Link[];
};

export default function AppearanceEditor(props: Props) {
  const [profile, setProfile] = useState(props.initialProfile);
  const [theme, setTheme] = useState(props.initialTheme);
  const [socials, setSocials] = useState(props.initialSocials);

  const profileSave = useAutosave(profile, (p) =>
    updateProfile({ display_name: p.displayName, bio: p.bio }),
  );
  const themeSave = useAutosave(theme, updateTheme);

  const preview: PageData = {
    username: props.username,
    displayName: profile.displayName.trim() || null,
    bio: profile.bio.trim() || null,
    avatarUrl: profile.avatarUrl,
    theme,
    links: props.links,
    socials,
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Appearance</h1>

        <Section title="Profile" status={profileSave.status} error={profileSave.error}>
          <AvatarPicker
            userId={props.userId}
            url={profile.avatarUrl}
            fallback={(profile.displayName || props.username).charAt(0).toUpperCase()}
            onChange={(avatarUrl) => setProfile((p) => ({ ...p, avatarUrl }))}
          />
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="display-name" className="label">Display name</label>
              <input
                id="display-name"
                maxLength={60}
                placeholder={`@${props.username}`}
                className="input"
                value={profile.displayName}
                onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="bio" className="label">Bio</label>
              <textarea
                id="bio"
                rows={3}
                maxLength={160}
                placeholder="Tell visitors who you are"
                className="input resize-none"
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              />
              <p className="mt-1 text-right text-xs text-neutral-500">{profile.bio.length}/160</p>
            </div>
          </div>
        </Section>

        <Section title="Theme" status={themeSave.status} error={themeSave.error}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {THEME_PRESETS.map((preset) => {
              const t = preset.theme;
              const selected = JSON.stringify(t) === JSON.stringify(theme);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setTheme(t)}
                  aria-pressed={selected}
                  className={`overflow-hidden rounded-xl border-2 text-left transition ${
                    selected ? "border-accent" : "border-transparent hover:border-neutral-300"
                  }`}
                >
                  <div
                    className="flex h-24 flex-col items-center justify-center gap-1.5 px-4"
                    style={{
                      background: t.bgStyle === "gradient" ? `linear-gradient(165deg, ${t.bg}, ${t.bg2})` : t.bg,
                    }}
                  >
                    {[0, 1].map((i) => (
                      <span
                        key={i}
                        className="block h-3.5 w-full"
                        style={{
                          background: t.buttonStyle === "outline" ? "transparent" : t.buttonBg,
                          border: t.buttonStyle === "outline" ? `1.5px solid ${t.buttonBg}` : undefined,
                          borderRadius: t.buttonShape === "pill" ? 999 : t.buttonShape === "rounded" ? 5 : 2,
                        }}
                      />
                    ))}
                  </div>
                  <span className="block bg-white px-2.5 py-1.5 text-xs font-semibold">{preset.name}</span>
                </button>
              );
            })}
          </div>

          <h3 className="mt-8 text-sm font-semibold text-neutral-900">Customize</h3>
          <div className="mt-3 grid gap-5 sm:grid-cols-2">
            <Choice
              label="Background"
              value={theme.bgStyle}
              options={[["solid", "Solid"], ["gradient", "Gradient"]]}
              onChange={(bgStyle) => setTheme((t) => ({ ...t, bgStyle }))}
            />
            <div className="flex gap-4">
              <ColorField label={theme.bgStyle === "gradient" ? "From" : "Color"} value={theme.bg} onChange={(bg) => setTheme((t) => ({ ...t, bg }))} />
              {theme.bgStyle === "gradient" && (
                <ColorField label="To" value={theme.bg2} onChange={(bg2) => setTheme((t) => ({ ...t, bg2 }))} />
              )}
              <ColorField label="Text" value={theme.text} onChange={(text) => setTheme((t) => ({ ...t, text }))} />
            </div>
            <Choice
              label="Button style"
              value={theme.buttonStyle}
              options={[["fill", "Fill"], ["outline", "Outline"], ["shadow", "Hard shadow"]]}
              onChange={(buttonStyle) => setTheme((t) => ({ ...t, buttonStyle }))}
            />
            <Choice
              label="Button shape"
              value={theme.buttonShape}
              options={[["square", "Square"], ["rounded", "Rounded"], ["pill", "Pill"]]}
              onChange={(buttonShape) => setTheme((t) => ({ ...t, buttonShape }))}
            />
            <div className="flex gap-4">
              <ColorField label="Button" value={theme.buttonBg} onChange={(buttonBg) => setTheme((t) => ({ ...t, buttonBg }))} />
              <ColorField label="Button text" value={theme.buttonText} onChange={(buttonText) => setTheme((t) => ({ ...t, buttonText }))} />
            </div>
            <Choice
              label="Font"
              value={theme.font}
              options={Object.entries(FONTS).map(([id, f]) => [id as Theme["font"], f.label])}
              onChange={(font) => setTheme((t) => ({ ...t, font }))}
            />
          </div>
        </Section>

        <SocialsEditor socials={socials} setSocials={setSocials} />
      </div>

      <aside className="hidden lg:block">
        <PhonePreview data={preview} />
      </aside>
    </div>
  );
}

function Section({
  title,
  status,
  error,
  children,
}: {
  title: string;
  status?: SaveStatus;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <span aria-live="polite" className={`text-xs ${status === "error" ? "text-red-600" : "text-neutral-500"}`}>
          {status === "saving" && "Saving…"}
          {status === "saved" && "Saved"}
          {status === "error" && (error ?? "Couldn't save")}
        </span>
      </div>
      {children}
    </section>
  );
}

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([id, text]) => (
          <button
            key={id}
            type="button"
            aria-pressed={value === id}
            onClick={() => onChange(id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              value === id
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
      {label}
      <span className="relative block h-10 w-14 overflow-hidden rounded-lg border border-neutral-300">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer"
        />
      </span>
    </label>
  );
}

function AvatarPicker({
  userId,
  url,
  fallback,
  onChange,
}: {
  userId: string;
  url: string | null;
  fallback: string;
  onChange: (url: string | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) return setError("Choose an image file");
    if (file.size > 2 * 1024 * 1024) return setError("Image must be under 2 MB");

    setBusy(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
    });
    if (uploadError) {
      setBusy(false);
      return setError("Upload failed. Try a PNG, JPG, WebP or GIF under 2 MB.");
    }
    const publicUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    const result = await updateProfile({ avatar_url: publicUrl });
    setBusy(false);
    if (!result.ok) return setError(result.error);
    onChange(publicUrl);
  }

  async function remove() {
    setBusy(true);
    const result = await updateProfile({ avatar_url: null });
    setBusy(false);
    if (!result.ok) return setError(result.error);
    onChange(null);
  }

  return (
    <div className="flex items-center gap-5">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- user uploads from Supabase Storage
        <img src={url} alt="" className="h-20 w-20 rounded-full object-cover" />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-200 text-3xl font-semibold text-neutral-600">
          {fallback}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn-primary">
          <FaCamera /> {busy ? "Working…" : url ? "Change photo" : "Upload photo"}
        </button>
        {url && (
          <button type="button" disabled={busy} onClick={remove} className="btn-secondary">
            Remove
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
      {error && <p role="alert" className="basis-full text-sm text-red-600">{error}</p>}
    </div>
  );
}

function SocialsEditor({
  socials,
  setSocials,
}: {
  socials: SocialLink[];
  setSocials: React.Dispatch<React.SetStateAction<SocialLink[]>>;
}) {
  const available = SOCIAL_PLATFORMS.filter((p) => !socials.some((s) => s.platform === p.id));
  const [platform, setPlatform] = useState(available[0]?.id ?? "");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selected = available.find((p) => p.id === platform) ?? available[0];

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError(null);
    const result = await saveSocial(selected.id, value);
    setSaving(false);
    if (!result.ok) return setError(result.error);
    setSocials((list) => [...list, result.data]);
    setValue("");
    setPlatform(available.find((p) => p.id !== selected.id)?.id ?? "");
  }

  async function remove(id: string) {
    const previous = socials;
    setSocials((list) => list.filter((s) => s.id !== id));
    const result = await deleteSocial(id);
    if (!result.ok) {
      setSocials(previous);
      setError(result.error);
    }
  }

  return (
    <Section title="Social icons">
      <p className="-mt-3 mb-5 text-sm text-neutral-600">Icons appear under your bio, in the order you add them.</p>

      {socials.length > 0 && (
        <ul className="mb-5 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
          {socials.map((social) => {
            const p = SOCIALS_BY_ID.get(social.platform);
            if (!p) return null;
            const Icon = p.icon;
            return (
              <li key={social.id} className="flex items-center gap-3 px-4 py-3">
                <Icon size={18} className="shrink-0" />
                <span className="w-24 shrink-0 text-sm font-semibold">{p.label}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-neutral-600">{social.url}</span>
                <button
                  type="button"
                  onClick={() => remove(social.id)}
                  aria-label={`Remove ${p.label}`}
                  className="rounded-full p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                >
                  <FaTrash size={13} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected ? (
        <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
          <select
            aria-label="Platform"
            className="input sm:w-44"
            value={selected.id}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {available.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            aria-label={`${selected.label} link`}
            required
            placeholder={selected.placeholder}
            className="input flex-1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Adding…" : "Add"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-neutral-600">You&apos;ve added every platform.</p>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </Section>
  );
}
