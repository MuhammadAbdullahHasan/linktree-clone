---
name: OneTap
description: The public profile behind a OneTap NFC card, laid out as a stack of physical cards and coloured by each owner's theme.
colors:
  paper-ground: "#f4f1ea"
  paper-ink: "#1d1b16"
  cover-ground: "#111111"
  cover-name: "#ffffff"
typography:
  display:
    fontFamily: "var(--font-inter), system-ui, sans-serif"
    fontSize: "clamp(2rem, 9vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.03
    letterSpacing: "-0.02em"
  display-long:
    fontFamily: "var(--font-inter), system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 7vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: "var(--font-inter), system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "var(--font-inter), system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.375
  handle:
    fontFamily: "var(--font-inter), system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
  caption:
    fontFamily: "var(--font-inter), system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  label:
    fontFamily: "var(--font-inter), system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
rounded:
  card: "32px"
  tile-square: "10px"
  tile-rounded: "22px"
  pill: "9999px"
spacing:
  page-gutter: "12px"
  stack-gap: "10px"
  panel-padding: "20px"
  hero-padding: "24px"
  panel-overlap: "28px"
components:
  hero-card-cover:
    backgroundColor: "{colors.cover-ground}"
    textColor: "{colors.cover-name}"
    rounded: "{rounded.card}"
    padding: "0 24px 48px"
    height: "min(56svh, 520px)"
  hero-card-name:
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.card}"
    padding: "0 24px 48px"
    height: "min(34svh, 300px)"
  ink-panel:
    backgroundColor: "{colors.paper-ink}"
    textColor: "{colors.paper-ground}"
    rounded: "{rounded.card}"
    padding: "{spacing.panel-padding}"
  link-tile:
    backgroundColor: "{colors.paper-ink}"
    textColor: "{colors.paper-ground}"
    typography: "{typography.title}"
    rounded: "{rounded.tile-rounded}"
    padding: "12px 12px 12px 20px"
    height: "68px"
  arrow-disc:
    rounded: "{rounded.pill}"
    size: "40px"
  social-disc:
    rounded: "{rounded.pill}"
    size: "44px"
  dock:
    backgroundColor: "{colors.paper-ink}"
    textColor: "{colors.paper-ground}"
    rounded: "{rounded.pill}"
    padding: "6px"
  dock-save:
    backgroundColor: "{colors.paper-ground}"
    textColor: "{colors.paper-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 20px 0 16px"
    height: "48px"
  dock-disc:
    rounded: "{rounded.pill}"
    size: "48px"
---

# Design System: OneTap

## Overview

**Creative North Star: "The Card in Your Hand"**

The public profile page is the digital twin of the NFC card that was just tapped: a single 480px column of rounded, physical-feeling cards stacked from top to bottom. A photo card (or, without a cover, a short name card) says who this is; an inverse "ink" panel overlaps its bottom edge with the bio and social discs; theme-coloured link tiles follow; and an always-dark pill dock floats at the bottom holding Save contact, WhatsApp, Call and Share. Every colour, the font and the tile shape come from the owner's theme, so the system is a set of relationships between theme roles, not a fixed palette.

The density is phone-first and calm: one column, generous 32px corners, 10px gaps between stacked pieces, nothing that needs scrolling to find the contact actions. Motion is a single load sequence (the photo settles, the panel and tiles rise in order, the dock arrives last) and then the page holds still.

This system covers the public profile page only (`ProfilePage`, `ActionDock`, the `.profile` block in `globals.css`). The dashboard and marketing pages keep their older, separate look (violet accent, `btn`/`card`/`input` utilities) and are not governed by this file.

**Key Characteristics:**
- Stacked rounded cards, one column, max 480px wide.
- The ink panel inverts the theme: theme text colour becomes its surface.
- Link tiles carry the owner's chosen shape and style (fill, outline or hard shadow).
- The contact dock is always the darkest element on the page, whatever the theme.
- One orchestrated load sequence; static under reduced motion.

## Colors

There is no house palette: four theme roles (ground, ink, tile, tile ink) drive everything, and the defaults below are the Paper preset plus the two fixed values of the cover hero.

### Primary
- **Paper Ink** (theme `text`, default #1d1b16): the owner's text colour. It sets the name and handle on a no-cover hero, becomes the surface of the ink panel, and is one of the two colours the dock chooses between.

### Neutral
- **Paper Ground** (theme `bg`, default #f4f1ea): the page background (solid, or a 165deg linear gradient from `bg` to `bg2`). It becomes the text colour of the ink panel.
- **Cover Ground** (#111111): the hero card's fill behind a cover photo while it loads.
- **Cover Name** (#ffffff): name and handle over a cover photo, always on the black bottom scrim (0.68 to 0 alpha across the lower 68%).

Tile colours are the owner's `buttonBg` / `buttonText`; they are not system tokens.

### Named Rules
**The Inverse Ink Rule.** The panel takes the theme's text colour as its surface and the ground colour as its ink. If filled tiles are already that ink colour (similar within an RGB distance of 48), the panel switches to the ground tinted 10% toward the ink with a 1px inset hairline, so panel and tiles never merge into one slab.

**The Darkest Dock Rule.** The dock compares ink and ground by WCAG luminance and always takes the darker one as its surface (at 92% opacity with backdrop blur) and the lighter as its content. On a dark theme it uses the ground; on a light theme, the ink.

**The Derived Tint Rule.** Secondary tints are mixed from the theme in OKLCH (`color-mix(in oklab, …)`), never introduced as new hues: bio text is panel ink 82% toward the panel surface, ring outlines are ink at 40-70%, arrow discs are the tile's current colour at 13%.

## Typography

**Display / Body Font:** the owner's theme font, one family for the whole page: Inter ("Modern", default), Nunito ("Friendly"), Lora ("Elegant") or JetBrains Mono ("Technical"), all loaded via `next/font`.

**Character:** a single family carries every role; hierarchy comes from size and weight (600 for names and titles, 500 for the handle, 400 for body), never from a second face.

### Hierarchy
- **Display** (600, clamp(2rem, 9vw, 2.75rem), 1.03, -0.02em): the owner's name at the bottom-left of the hero, balanced and allowed to break after dots and underscores.
- **Display long** (600, clamp(1.6rem, 7vw, 2.25rem), 1.08): the same name when it runs past 16 characters.
- **Handle** (500, 15px, 75% opacity): the @username line under a display name.
- **Title** (600, 15px, tight): link tile titles.
- **Body** (400, 15px, snug): the bio in the ink panel, preserving the owner's line breaks.
- **Caption** (400, 13px, 65% opacity): the domain line under each tile title, truncated.
- **Label** (600, 14px): the dock's Save contact pill.

### Named Rules
**The One Family Rule.** The owner's chosen font sets every line on the page, including the dock and the OneTap footer mark. Do not introduce a second display face.

## Layout

A single centred column, max 480px, with 12px side gutters (12px top on mobile, 32px from `sm` up). Pieces stack in fixed order: hero, ink panel (overlapping the hero by 28px, `-mt-7`, with z-index above it), a 12px gap, then link tiles 10px apart. The footer mark sits 40px below the tiles. The dock is sticky to the viewport bottom with 16px (or the safe-area inset, if larger) beneath it and 16px side padding.

The hero is 56% of the small viewport height up to 520px (minimum 360px) with a cover, and 34svh up to 300px (minimum 250px) as a name card without one. Its text block sits on the bottom edge with 24px side padding and 48px bottom padding when the panel overlaps (24px when there is no panel).

From `sm` up, a cover photo is also drawn as a fixed full-viewport backdrop: scaled 110%, blurred, 60% opacity, under a 55% wash of the page background. The column itself does not widen.

The dashboard's live preview renders the same component in a compact mode: 10px gutters, fixed hero heights (310px cover, 220px name card) and 28px/22px names.

## Elevation & Depth

Depth is physical and sparse: cards overlap rather than float. The ink panel's lift comes from overlapping the hero, not from a shadow. Shadows appear on filled tiles (a soft two-layer drop), on the dock (a deep ambient shadow, since it floats over content), and on hard-shadow tiles only when the owner picks that style.

### Shadow Vocabulary
- **Tile rest** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.06), 0 8px 24px -12px rgb(0 0 0 / 0.25)`): filled link tiles.
- **Owner hard shadow** (`box-shadow: 4px 4px 0 <theme text>` with a 2px solid border in the theme text colour): only for the owner-selected "Hard shadow" tile style.
- **Dock float** (`box-shadow: inset 0 0 0 1px <light> 22%, 0 22px 48px -12px rgb(0 0 0 / 0.6), 0 4px 10px rgb(0 0 0 / 0.18)`): the contact dock; the inset hairline separates it from dark tiles scrolling behind.
- **Ring** (`box-shadow: inset 0 0 0 1.5px <ink> 40-70%`): avatar rings and social discs. A ring, not elevation.

### Named Rules
**The Owner's Shadow Rule.** The hard offset shadow is a theme option the owner chooses, and it is honoured exactly when chosen. The system never applies it by default or to any other element.

## Shapes

Soft, card-like geometry. The hero and ink panel always use 32px corners. Link tiles take the owner's shape: square (10px), rounded (22px) or pill (fully round). Everything circular is truly circular: avatars, arrow discs, social discs, dock buttons and the dock itself. Outline tiles use a 1.5px border in the tile colour; rings use inset 1.5px shadows so they don't shift layout.

## Components

### Hero Card
Who this is, in one card.
- **With cover:** the photo fills a 32px-cornered card, with a black bottom scrim and the white name, verified tick (sized 0.72em, inline) and handle at the bottom left. The photo settles in on load.
- **Without cover:** the card is transparent over the page background (so gradients stay continuous and contrast holds), with the name in theme ink. An avatar, if present, sits above the name at 88px inside a 3px gap and a 45% ink ring. With no avatar either, a 220px bold initial at 15% opacity bleeds off the top-right corner.

### Ink Panel
- **Surface:** inverse ink (see The Inverse Ink Rule), 32px corners, 20px padding.
- **Contents:** with a cover, a 64px ringed avatar beside the bio; social links as 44px circular outline discs (18px icons) 10px apart. WhatsApp is omitted here when the dock carries it.
- **Presence:** shown only when there is a bio or at least one social link.

### Link Tiles
- **Shape and style:** owner-driven (see Shapes, Elevation). Minimum 68px tall, 20px left padding, 12px right.
- **Contents:** title over a truncated domain caption, then a 40px arrow disc tinted 13% of the tile's current colour.
- **States:** hover lifts 1px and brightens 4% (0.25s, cubic-bezier(0.16, 1, 0.3, 1)), the arrow nudges 2px right; press scales to 0.985.

### Contact Dock (signature)
- **Style:** a floating pill with 6px padding and 4px gaps, darkest-colour surface at 92% with `backdrop-blur-xl` (see The Darkest Dock Rule).
- **Save contact:** a 48px labelled pill in the light colour with dark text and a 16px icon; only when the page has a phone number.
- **Discs:** 48px circles for WhatsApp, Call and Share; hover fills with 14% current colour, press scales to 0.9.
- **Share:** native share sheet, falling back to copying the link, with a check icon and a polite live announcement.

### Focus
Focus rings are a 2px solid outline offset 3px in the theme ink; inside the ink panel and the dock they flip to that surface's ink so they stay visible. Text selection uses the tile colours.

### Motion
On load (only when reduced motion is not requested): the hero photo settles from 108% scale and 12px blur over 1.2s; the panel and each tile rise 16px from 30% opacity over 0.8s, staggered 55ms apart after 140ms; the dock rises 24px from 96% scale after 0.4s. All use cubic-bezier(0.16, 1, 0.3, 1).

## Do's and Don'ts

### Do:
- **Do** derive every colour on the page from the four theme roles, mixing tints in OKLCH.
- **Do** keep the hero and ink panel at 32px corners regardless of the owner's tile shape.
- **Do** keep the dock the darkest element on the page, chosen by luminance, never by which theme role it is.
- **Do** make the no-cover hero transparent over the page background so the name keeps its contrast on gradient themes.
- **Do** keep the OneTap mark to the small footer link (12px, 60% opacity); the owner's identity leads.

### Don't:
- **Don't** fall back to a centred avatar above a column of identical pill buttons; the stacked-card layout replaces it.
- **Don't** apply the hard offset shadow anywhere except tiles whose owner picked the "Hard shadow" style.
- **Don't** add a second typeface or any label above the name; the hero carries only the name, the tick and the handle.
- **Don't** let the ink panel and filled tiles merge; apply The Inverse Ink Rule's tinted fallback.
- **Don't** carry the dashboard's violet accent or its `btn`/`card` utilities onto the profile page.
