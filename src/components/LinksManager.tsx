"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { FaGripVertical, FaPlus, FaTrash } from "react-icons/fa6";
import { createLink, deleteLink, reorderLinks, updateLink } from "@/app/dashboard/actions";
import PhonePreview from "@/components/PhonePreview";
import type { Link, PageData } from "@/lib/types";

type Props = {
  initialLinks: Link[];
  /** Profile, theme and socials for the preview; links come from local state. */
  page: PageData;
};

export default function LinksManager({ initialLinks, page }: Props) {
  const [links, setLinks] = useState(initialLinks);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const previous = links;
    const from = links.findIndex((l) => l.id === active.id);
    const to = links.findIndex((l) => l.id === over.id);
    const next = arrayMove(links, from, to);
    setLinks(next);
    const result = await reorderLinks(next.map((l) => l.id));
    if (!result.ok) {
      setLinks(previous);
      setError(result.error);
    }
  }

  async function onUpdate(id: string, patch: { title?: string; url?: string; isActive?: boolean }) {
    setError(null);
    const previous = links;
    setLinks((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    const result = await updateLink(id, patch);
    if (result.ok) {
      setLinks((ls) => ls.map((l) => (l.id === id ? result.data : l)));
      return result.data;
    }
    setLinks(previous);
    setError(result.error);
    return null;
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this link? Its click history stays in your analytics.")) return;
    setError(null);
    const previous = links;
    setLinks((ls) => ls.filter((l) => l.id !== id));
    const result = await deleteLink(id);
    if (!result.ok) {
      setLinks(previous);
      setError(result.error);
    }
  }

  const preview: PageData = {
    ...page,
    links: links.filter((l) => l.isActive && l.title && l.url),
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section>
        <h1 className="text-2xl font-extrabold tracking-tight">Links</h1>
        <p className="mt-1 text-neutral-600">Add links, drag to reorder, and hide any you don&apos;t need right now.</p>

        <AddLinkForm
          onAdded={(link) => {
            setError(null);
            setLinks((ls) => [link, ...ls]);
          }}
        />

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {links.length === 0 ? (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-neutral-300 px-6 py-12 text-center">
            <p className="font-semibold">You don&apos;t have any links yet</p>
            <p className="mt-1 text-sm text-neutral-600">Add your first one above. It shows up on your page right away.</p>
          </div>
        ) : (
          <DndContext id="links" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <ul className="mt-6 space-y-3">
                {links.map((link) => (
                  <LinkCard key={link.id} link={link} onUpdate={onUpdate} onDelete={onDelete} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </section>

      <aside className="hidden lg:block">
        <PhonePreview data={preview} />
      </aside>
    </div>
  );
}

function AddLinkForm({ onAdded }: { onAdded: (link: Link) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createLink(title, url);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onAdded(result.data);
    setTitle("");
    setUrl("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-primary mt-6 w-full py-3.5 text-[15px]">
        <FaPlus /> Add link
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card mt-6 space-y-3 p-5">
      <div>
        <label htmlFor="new-title" className="label">Title</label>
        <input
          id="new-title"
          autoFocus
          required
          maxLength={100}
          placeholder="My latest video"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="new-url" className="label">URL</label>
        <input
          id="new-url"
          required
          inputMode="url"
          placeholder="youtube.com/watch?v=..."
          className="input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Adding…" : "Add"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

type CardProps = {
  link: Link;
  onUpdate: (id: string, patch: { title?: string; url?: string; isActive?: boolean }) => Promise<Link | null>;
  onDelete: (id: string) => void;
};

function LinkCard({ link, onUpdate, onDelete }: CardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: link.id });
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);

  async function save(field: "title" | "url") {
    const value = field === "title" ? title : url;
    if (value.trim() === link[field]) return;
    const saved = await onUpdate(link.id, { [field]: value });
    (field === "title" ? setTitle : setUrl)((saved ?? link)[field]);
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`card flex items-stretch gap-2 p-3 ${isDragging ? "relative z-10 shadow-xl" : ""} ${
        link.isActive ? "" : "opacity-60"
      }`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${link.title}`}
        className="flex cursor-grab touch-none items-center px-1.5 text-neutral-400 hover:text-neutral-700 active:cursor-grabbing"
      >
        <FaGripVertical />
      </button>

      <div className="min-w-0 flex-1 space-y-1">
        <input
          aria-label="Link title"
          maxLength={100}
          className="w-full rounded-md px-2 py-1 font-semibold outline-none hover:bg-neutral-100 focus:bg-neutral-100"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => save("title")}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        />
        <input
          aria-label="Link URL"
          inputMode="url"
          className="w-full rounded-md px-2 py-1 text-sm text-neutral-600 outline-none hover:bg-neutral-100 focus:bg-neutral-100"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={() => save("url")}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        />
      </div>

      <div className="flex flex-col items-end justify-between gap-2">
        <Toggle
          checked={link.isActive}
          label={link.isActive ? "Visible" : "Hidden"}
          onChange={(v) => onUpdate(link.id, { isActive: v })}
        />
        <button
          type="button"
          onClick={() => onDelete(link.id)}
          aria-label={`Delete ${link.title}`}
          className="rounded-full p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
        >
          <FaTrash size={14} />
        </button>
      </div>
    </li>
  );
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-emerald-500" : "bg-neutral-300"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}
