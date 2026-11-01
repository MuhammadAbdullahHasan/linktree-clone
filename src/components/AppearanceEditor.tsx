"use client";

import { useMemo, useRef, useState } from "react";
import { FaCamera, FaPhone, FaQrcode, FaShareNodes, FaTrash } from "react-icons/fa6";
import {
  deleteSocial,
  removeAvatar,
  removeBackground,
  removeCover,
  saveSocial,
  updateProfile,
  updateTheme,
  uploadAvatar,
  uploadBackground,
  uploadCover,
} from "@/app/dashboard/actions";
import PhonePreview from "@/components/PhonePreview";
import { SOCIAL_PLATFORMS, SOCIALS_BY_ID } from "@/lib/socials";
import { contrast, dockColors, FONTS, PRESET_KEYS, THEME_PRESETS, type FontKey, type Theme } from "@/lib/themes";
import type { Link, PageData, SocialLink } from "@/lib/types";
import { useAutosave, type SaveStatus } from "@/lib/use-autosave";

type ProfileFields = {
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bgImageUrl: string | null;
};

type Props = {
  username: string;
  verified: boolean;
  initialProfile: ProfileFields;
  initialTheme: Theme;
  initialSocials: SocialLink[];
  links: Link[];
};

export default function AppearanceEditor(props: Props) {
  const [profile, setProfile] = useState(props.initialProfile);
  const [theme, setTheme] = useState(props.initialTheme);
  const [socials, setSocials] = useState(props.initialSocials);

  const profileText = useMemo(
    () => ({ displayName: profile.displayName, bio: profile.bio }),
    [profile.displayName, profile.bio],
  );
  const profileSave = useAutosave(profileText, (p) =>
    updateProfile({ displayName: p.displayName, bio: p.bio }),
  );
  const themeSave = useAutosave(theme, updateTheme);

  const preview: PageData = {
    username: props.username,
    displayName: profile.displayName.trim() || null,
    bio: profile.bio.trim() || null,
    avatarUrl: profile.avatarUrl,
    coverUrl: profile.coverUrl,
    bgImageUrl: profile.bgImageUrl,
    verified: props.verified,
    theme,
    links: props.links,
    socials,
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Appearance</h1>

        <Section title="Profile" status={profileSave.status} error={profileSave.error}>
          <AvatarPicker
            url={profile.avatarUrl}
            fallback={(profile.displayName || props.username).charAt(0).toUpperCase()}
            onChange={(avatarUrl) => setProfile((p) => ({ ...p, avatarUrl }))}
          />
          <CoverPicker
            url={profile.coverUrl}
            onChange={(coverUrl) => setProfile((p) => ({ ...p, coverUrl }))}
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
          <p className="-mt-2 mb-5 text-sm text-neutral-500">
            Start from a preset, then make it yours below. Presets change colours and style; your layout and other choices stay.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {THEME_PRESETS.map((preset) => {
              const t = preset.theme;
              const selected = PRESET_KEYS.every((k) => t[k] === theme[k]);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setTheme((cur) => ({ ...cur, ...pickPreset(t) }))}
                  aria-pressed={selected}
                  className={`overflow-hidden rounded-xl border-2 text-left transition ${
                    selected ? "border-accent" : "border-transparent hover:border-neutral-300"
                  }`}
                >
                  <div
                    className="flex h-24 flex-col items-center justify-center gap-1.5 px-4"
                    style={{ background: t.bgStyle === "solid" ? t.bg : `linear-gradient(165deg, ${t.bg}, ${t.bg2})` }}
                  >
                    {[0, 1].map((i) => (
                      <span
                        key={i}
                        className="block h-3.5 w-full"
                        style={{
                          background: t.buttonStyle === "outline" ? "transparent" : t.buttonBg,
                          border: t.buttonStyle === "outline" ? `1.5px solid ${t.buttonBg}` : undefined,
                          borderRadius: Math.round(t.radius / 5),
                        }}
                      />
                    ))}
                  </div>
                  <span className="block bg-white px-2.5 py-1.5 text-xs font-semibold">{preset.name}</span>
                </button>
              );
            })}
          </div>

          <ThemeTabs
            theme={theme}
            setTheme={setTheme}
            bgImageUrl={profile.bgImageUrl}
            onBgImageChange={(bgImageUrl) => setProfile((p) => ({ ...p, bgImageUrl }))}
          />
        </Section>

        <Section title="Bottom dock" status={themeSave.status} error={themeSave.error}>
          <p className="-mt-2 mb-5 text-sm text-neutral-500">
            The round Call, Email, QR code and Share buttons at the bottom of your page. Style them on their own, separately from the theme.
          </p>
          <div className="grid items-start gap-6 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-5">
              <Choice
                label="Colours"
                value={theme.dockStyle}
                options={[["auto", "Match theme"], ["silver", "Silver"], ["custom", "Custom"]]}
                onChange={(dockStyle) =>
                  setTheme((t) => {
                    if (dockStyle !== "custom" || t.dockStyle === "custom") return { ...t, dockStyle };
                    // Start custom from what the dock looks like now.
                    const c = dockColors(t);
                    return { ...t, dockStyle, dockBg: c.bg, dockIcon: c.icon, dockAccent: c.accent };
                  })
                }
              />
              {theme.dockStyle === "custom" && (
                <div>
                  <div className="flex gap-4">
                    <ColorField label="Dock" value={theme.dockBg} onChange={(dockBg) => setTheme((t) => ({ ...t, dockBg }))} />
                    <ColorField label="Icons" value={theme.dockIcon} onChange={(dockIcon) => setTheme((t) => ({ ...t, dockIcon }))} />
                    <ColorField label="First button" value={theme.dockAccent} onChange={(dockAccent) => setTheme((t) => ({ ...t, dockAccent }))} />
                  </div>
                  {contrast(theme.dockIcon, theme.dockBg) < 3 && (
                    <p className="mt-2 text-xs font-medium text-amber-700">Icons will be hard to see on this dock colour. Pick a lighter or darker one.</p>
                  )}
                </div>
              )}
            </div>
            <DockSample theme={theme} />
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

/** A small live sample of the dock on the page background, so the choice is visible on phones too. */
function DockSample({ theme }: { theme: Theme }) {
  const c = dockColors(theme);
  const ground = theme.bgStyle === "gradient" ? `linear-gradient(165deg, ${theme.bg}, ${theme.bg2})` : theme.bg;
  return (
    <div aria-hidden className="flex items-center justify-center rounded-2xl px-6 py-5" style={{ background: ground }}>
      <div className="flex items-center gap-1.5 rounded-full p-1.5" style={{ background: c.bg, color: c.icon, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${c.icon} 18%, transparent), 0 10px 24px -8px rgb(0 0 0 / 0.5)` }}>
        <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: c.accentFill ?? c.accent, color: c.accentIcon }}><FaPhone size={14} /></span>
        <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: `color-mix(in oklab, ${c.icon} 13%, transparent)` }}><FaQrcode size={15} /></span>
        <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: `color-mix(in oklab, ${c.icon} 13%, transparent)` }}><FaShareNodes size={15} /></span>
      </div>
    </div>
  );
}

/** The part of a preset that picking it applies; everything else on the theme carries over. */
function pickPreset(t: Theme) {
  return Object.fromEntries(PRESET_KEYS.map((k) => [k, t[k]])) as Pick<Theme, (typeof PRESET_KEYS)[number]>;
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
  styleFor,
  hint,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
  styleFor?: (value: T) => React.CSSProperties;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      {hint && <p className="-mt-1 mb-2 text-xs text-neutral-500">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(([id, text]) => (
          <button
            key={id}
            type="button"
            aria-pressed={value === id}
            onClick={() => onChange(id)}
            style={styleFor?.(id)}
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

/** Crops to a centered square and scales down to 400px, so uploads stay small. */
/** Crops to a 4:5 portrait from the centre and scales to at most 900x1125 for the hero card. */
async function resizeCover(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const ratio = 4 / 5;
  const sw = Math.min(bitmap.width, bitmap.height * ratio);
  const sh = sw / ratio;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(Math.min(900, sw));
  canvas.height = Math.round(canvas.width / ratio);
  canvas
    .getContext("2d")!
    .drawImage(bitmap, (bitmap.width - sw) / 2, (bitmap.height - sh) / 2, sw, sh, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of [0.82, 0.7, 0.55]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (blob && blob.size < 880 * 1024) return blob;
  }
  throw new Error("encode failed");
}

function CoverPicker({ url, onChange }: { url: string | null; onChange: (url: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) return setError("Choose an image file");
    if (file.size > 25 * 1024 * 1024) return setError("Image must be under 25 MB");
    setBusy(true);
    try {
      const blob = await resizeCover(file);
      const form = new FormData();
      form.append("cover", new File([blob], "cover", { type: blob.type }));
      const result = await uploadCover(form);
      if (!result.ok) setError(result.error);
      else onChange(result.data);
    } catch {
      setError("Couldn't read that image. Try a PNG or JPG.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    const result = await removeCover();
    setBusy(false);
    if (!result.ok) return setError(result.error);
    onChange(null);
  }

  return (
    <div className="mt-6 flex items-center gap-5">
      <div className="relative h-24 w-[76px] shrink-0 overflow-hidden rounded-xl bg-neutral-200">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element -- user upload
          <img src={url} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-800">Cover photo</p>
        <p className="mt-0.5 text-xs text-neutral-500">The big photo at the top of your page. Portrait works best.</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn-secondary">
            <FaCamera /> {busy ? "Working…" : url ? "Change cover" : "Upload cover"}
          </button>
          {url && (
            <button type="button" disabled={busy} onClick={remove} className="btn-secondary">
              Remove
            </button>
          )}
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

async function resizeImage(file: File, size = 400): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(size, side);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode failed"))), "image/webp", 0.85),
  );
}

function AvatarPicker({
  url,
  fallback,
  onChange,
}: {
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
    if (file.size > 15 * 1024 * 1024) return setError("Image must be under 15 MB");

    setBusy(true);
    try {
      const blob = await resizeImage(file);
      const form = new FormData();
      form.append("avatar", new File([blob], "avatar", { type: blob.type }));
      const result = await uploadAvatar(form);
      if (!result.ok) setError(result.error);
      else onChange(result.data);
    } catch {
      setError("Couldn't read that image. Try a PNG or JPG.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    const result = await removeAvatar();
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
        accept="image/*"
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

const TABS = [
  ["background", "Background"],
  ["colours", "Colours"],
  ["layout", "Layout"],
  ["shapes", "Shapes"],
  ["text", "Text"],
  ["visibility", "Show / hide"],
] as const;

type TabId = (typeof TABS)[number][0];
type SetTheme = React.Dispatch<React.SetStateAction<Theme>>;

/** Every customization, grouped into tabs so the section stays scannable. */
function ThemeTabs({
  theme,
  setTheme,
  bgImageUrl,
  onBgImageChange,
}: {
  theme: Theme;
  setTheme: SetTheme;
  bgImageUrl: string | null;
  onBgImageChange: (url: string | null) => void;
}) {
  const [tab, setTab] = useState<TabId>("background");
  const set = <K extends keyof Theme>(key: K) => (value: Theme[K]) => setTheme((t) => ({ ...t, [key]: value }));
  const fontOptions = (bodyOnly: boolean) =>
    (Object.entries(FONTS) as [FontKey, (typeof FONTS)[FontKey]][])
      .filter(([, f]) => !bodyOnly || f.body)
      .map(([id, f]) => [id, f.label] as [FontKey, string]);

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-neutral-900">Customize</h3>
      <div role="tablist" aria-label="Customize" className="mt-3 flex gap-1 overflow-x-auto rounded-full bg-neutral-100 p-1">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition ${
              tab === id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-6 grid gap-6 sm:grid-cols-2">
        {tab === "background" && (
          <>
            <div className="sm:col-span-2">
              <Choice
                label="Style"
                value={theme.bgStyle}
                options={[["solid", "Solid"], ["gradient", "Gradient"], ["radial", "Glow"], ["mesh", "Mesh"], ["image", "Photo"]]}
                onChange={set("bgStyle")}
              />
            </div>
            <div className="flex gap-4">
              <ColorField label={theme.bgStyle === "solid" || theme.bgStyle === "image" ? "Colour" : "Main"} value={theme.bg} onChange={set("bg")} />
              {(theme.bgStyle === "gradient" || theme.bgStyle === "radial" || theme.bgStyle === "mesh") && (
                <ColorField label={theme.bgStyle === "gradient" ? "To" : "Glow"} value={theme.bg2} onChange={set("bg2")} />
              )}
            </div>
            {theme.bgStyle === "gradient" && (
              <Slider label="Direction" value={theme.gradientAngle} min={0} max={360} step={15} unit="°" onChange={set("gradientAngle")} />
            )}
            {theme.bgStyle === "image" && (
              <>
                <div className="sm:col-span-2">
                  <BackgroundPicker url={bgImageUrl} onChange={onBgImageChange} />
                </div>
                <Slider label="Blur" value={theme.bgBlur} min={0} max={40} step={1} unit="px" onChange={set("bgBlur")} />
                <Slider
                  label="Dim"
                  hint="Tints the photo with your main colour so text stays readable."
                  value={theme.bgDim}
                  min={0}
                  max={85}
                  step={5}
                  unit="%"
                  onChange={set("bgDim")}
                />
              </>
            )}
          </>
        )}

        {tab === "colours" && (
          <>
            <div className="flex flex-wrap gap-4">
              <ColorField label="Text" value={theme.text} onChange={set("text")} />
              <ColorField label="Links" value={theme.buttonBg} onChange={set("buttonBg")} />
              <ColorField label="Link text" value={theme.buttonText} onChange={set("buttonText")} />
            </div>
            <div className="flex flex-wrap gap-4">
              <AutoColorField label="Card" value={theme.cardColor} fallback={theme.text} onChange={set("cardColor")} />
              <AutoColorField label="Card text" value={theme.cardText} fallback={theme.bg} onChange={set("cardText")} />
              <AutoColorField
                label="Accent"
                hint="Verified tick and filled buttons"
                value={theme.accent}
                fallback={theme.buttonBg}
                onChange={set("accent")}
              />
            </div>
            {theme.cardColor !== "auto" && theme.cardText !== "auto" && contrast(theme.cardColor, theme.cardText) < 4.5 && (
              <p className="text-xs font-medium text-amber-700 sm:col-span-2">
                The card text will be hard to read on this card colour. Pick a lighter or darker one.
              </p>
            )}
          </>
        )}

        {tab === "layout" && (
          <>
            <Choice
              label="Links"
              value={theme.linkLayout}
              options={[["grid", "Picture grid"], ["list", "List"], ["chips", "Compact"]]}
              onChange={set("linkLayout")}
            />
            <Toggle
              label="Show link pictures"
              description="Each site's own preview image on its tile."
              checked={theme.showPreviews}
              onChange={set("showPreviews")}
            />
            <Choice label="Card text" value={theme.cardAlign} options={[["center", "Centered"], ["left", "Left"]]} onChange={set("cardAlign")} />
            <Choice
              label="Photo shape"
              value={theme.avatarShape}
              options={[["circle", "Circle"], ["rounded", "Rounded"], ["square", "Square"]]}
              onChange={set("avatarShape")}
            />
            <Choice
              label="Photo size"
              value={theme.avatarSize}
              options={[["s", "Small"], ["m", "Medium"], ["l", "Large"]]}
              onChange={set("avatarSize")}
            />
          </>
        )}

        {tab === "shapes" && (
          <>
            <Slider label="Corner roundness" value={theme.radius} min={0} max={40} step={1} unit="px" onChange={set("radius")} />
            <Choice
              label="Card finish"
              value={theme.cardFinish}
              options={[["gloss", "Gloss"], ["matte", "Matte"], ["glass", "Glass"], ["outline", "Outline"]]}
              onChange={set("cardFinish")}
            />
            <Choice
              label="Link style"
              value={theme.buttonStyle}
              options={[["fill", "Fill"], ["outline", "Outline"], ["shadow", "Hard shadow"]]}
              onChange={set("buttonStyle")}
            />
            <Choice
              label="Contact buttons"
              value={theme.pillStyle}
              options={[["outline", "Outline"], ["filled", "Filled"], ["soft", "Soft"]]}
              onChange={set("pillStyle")}
            />
            <Choice label="Shadows" value={theme.shadow} options={[["none", "None"], ["soft", "Soft"], ["strong", "Strong"]]} onChange={set("shadow")} />
          </>
        )}

        {tab === "text" && (
          <>
            <div className="sm:col-span-2">
              <Choice
                label="Font"
                value={theme.font}
                options={fontOptions(true)}
                onChange={set("font")}
                styleFor={(id) => ({ fontFamily: FONTS[id].variable })}
              />
            </div>
            <div className="sm:col-span-2">
              <Choice<FontKey | "same">
                label="Heading font"
                hint="Your name and link titles."
                value={theme.headingFont}
                options={[["same", "Same as text"], ...fontOptions(false)]}
                onChange={set("headingFont")}
                styleFor={(id) => (id === "same" ? {} : { fontFamily: FONTS[id].variable })}
              />
            </div>
            <Choice label="Text size" value={theme.textScale} options={[["s", "Small"], ["m", "Medium"], ["l", "Large"]]} onChange={set("textScale")} />
          </>
        )}

        {tab === "visibility" && (
          <>
            <Toggle label="@handle under your name" checked={theme.showHandle} onChange={set("showHandle")} />
            <Toggle label="Bottom dock" description="Call, Email, QR code and Share." checked={theme.showDock} onChange={set("showDock")} />
            <Toggle label="OneTap at the bottom" checked={theme.showFooter} onChange={set("showFooter")} />
            <Toggle label="Animate when the page opens" checked={theme.animations} onChange={set("animations")} />
          </>
        )}
      </div>
    </div>
  );
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="label flex items-baseline justify-between">
        {label}
        <span className="text-xs font-normal text-neutral-500 tabular-nums">
          {value}
          {unit}
        </span>
      </span>
      {hint && <span className="-mt-1 mb-2 block text-xs text-neutral-500">{hint}</span>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-neutral-900"
      />
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 text-left transition hover:bg-neutral-50"
    >
      <span>
        <span className="block text-sm font-medium text-neutral-800">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-neutral-500">{description}</span>}
      </span>
      <span
        aria-hidden
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-neutral-900" : "bg-neutral-300"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </span>
    </button>
  );
}

/** A colour that can be left on "Auto" (worked out from the theme) or set by hand. */
function AutoColorField({
  label,
  hint,
  value,
  fallback,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}) {
  const isAuto = value === "auto";
  return (
    <div className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
      <span>
        {label}
        {hint && <span className="block text-xs font-normal text-neutral-500">{hint}</span>}
      </span>
      <div className="flex items-center gap-2">
        <span className={`relative block h-10 w-14 overflow-hidden rounded-lg border border-neutral-300 ${isAuto ? "opacity-40" : ""}`}>
          <input
            type="color"
            aria-label={label}
            value={isAuto ? fallback : value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer"
          />
        </span>
        <button
          type="button"
          aria-pressed={isAuto}
          onClick={() => onChange(isAuto ? fallback : "auto")}
          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
            isAuto ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          Auto
        </button>
      </div>
    </div>
  );
}

/** Scales a photo so its longest side is at most 1600px, keeping it under the upload limit. */
async function resizeBackground(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of [0.8, 0.65, 0.5]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (blob && blob.size < 880 * 1024) return blob;
  }
  throw new Error("encode failed");
}

function BackgroundPicker({ url, onChange }: { url: string | null; onChange: (url: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) return setError("Choose an image file");
    if (file.size > 25 * 1024 * 1024) return setError("Image must be under 25 MB");
    setBusy(true);
    try {
      const blob = await resizeBackground(file);
      const form = new FormData();
      form.append("background", new File([blob], "background", { type: blob.type }));
      const result = await uploadBackground(form);
      if (!result.ok) setError(result.error);
      else onChange(result.data);
    } catch {
      setError("Couldn't read that image. Try a PNG or JPG.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    const result = await removeBackground();
    setBusy(false);
    if (!result.ok) return setError(result.error);
    onChange(null);
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-24 w-[76px] shrink-0 overflow-hidden rounded-xl bg-neutral-200">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element -- user upload
          <img src={url} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-800">Background photo</p>
        <p className="mt-0.5 text-xs text-neutral-500">Fills the whole page behind your card and links.</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn-secondary">
            <FaCamera /> {busy ? "Working…" : url ? "Change photo" : "Upload photo"}
          </button>
          {url && (
            <button type="button" disabled={busy} onClick={remove} className="btn-secondary">
              Remove
            </button>
          )}
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
