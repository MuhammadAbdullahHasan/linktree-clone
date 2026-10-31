---
name: OneTap
description: The public profile behind a OneTap NFC card, built as one glossy profile card over a bento of metallic link tiles and a floating dock of round buttons, coloured by each owner's theme.
colors:
  chrome-ink: "#0d0d0f"
  chrome-silver: "#d4d4d7"
  chrome-light: "#c9c9cc"
  chrome-shade: "#3a3a3d"
  sheet-white: "#ffffff"
typography:
  name:
    fontFamily: "var(--font-inter), system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  name-long:
    fontFamily: "var(--font-inter), system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.01em"
  tile-title-wide:
    fontFamily: "var(--font-inter), system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.25
  tile-title:
    fontFamily: "var(--font-inter), system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "var(--font-inter), system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "var(--font-inter), system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
  handle:
    fontFamily: "var(--font-inter), system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  caption:
    fontFamily: "var(--font-inter), system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
rounded:
  tile-square: "14px"
  tile-rounded: "28px"
  tile-pill: "34px"
  card: "34px"
  sheet: "30px"
  full: "9999px"
spacing:
  gutter: "12px"
  gap: "10px"
  card-x: "20px"
  card-top: "32px"
  card-bottom: "24px"
  tile-inset: "8px"
  dock-inset: "8px"
  dock-lift: "16px"
components:
  profile-card:
    backgroundColor: "{colors.chrome-ink}"
    textColor: "{colors.chrome-silver}"
    rounded: "{rounded.card}"
    padding: "32px 20px 24px"
  contact-pill:
    textColor: "{colors.chrome-silver}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "48px"
  social-disc:
    textColor: "{colors.chrome-silver}"
    rounded: "{rounded.full}"
    size: "40px"
  link-tile:
    backgroundColor: "{colors.chrome-silver}"
    textColor: "{colors.chrome-ink}"
    typography: "{typography.tile-title}"
    rounded: "{rounded.tile-rounded}"
    padding: "{spacing.tile-inset}"
  link-tile-wide:
    backgroundColor: "{colors.chrome-silver}"
    textColor: "{colors.chrome-ink}"
    typography: "{typography.tile-title-wide}"
    rounded: "{rounded.tile-rounded}"
    padding: "{spacing.tile-inset}"
    height: "152px"
  open-pill:
    backgroundColor: "{colors.chrome-ink}"
    textColor: "{colors.chrome-silver}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  dock:
    backgroundColor: "{colors.chrome-ink}"
    textColor: "{colors.chrome-light}"
    rounded: "{rounded.full}"
    padding: "{spacing.dock-inset}"
  dock-disc:
    textColor: "{colors.chrome-light}"
    rounded: "{rounded.full}"
    size: "52px"
  dock-disc-highlight:
    backgroundColor: "{colors.chrome-light}"
    textColor: "{colors.chrome-ink}"
    rounded: "{rounded.full}"
    size: "52px"
  qr-sheet:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.chrome-ink}"
    rounded: "{rounded.sheet}"
    padding: "28px 24px 24px"
    width: "min(88vw, 340px)"
---

# Design System: OneTap

## Overview

**Creative North Star: "The Card in Your Hand"**

The page is one premium object: a dark, top-lit profile card that answers who this is and how to reach them, a two-column bento of metallic picture tiles that answers where to go next, and a black pill of round buttons floating near the thumb. It is built for the seconds after an NFC tap, on a phone, and it refuses the category default of a centred avatar over a column of identical pill buttons.

The default look is the **Chrome** preset: monochrome metal, a silver-to-graphite gradient ground, near-black ink, silver tiles. Chrome is a default, not a requirement. Every owner theme (background solid or gradient, text colour, button colour, fill / outline / hard-shadow style, square / rounded / pill shape, font) renders the same structure, and the colour helpers in `src/lib/themes.ts` (`luminance`, `similarColors`, `contrast`, `bestOn`) choose card ink, dock polarity and footer colour so any theme stays legible. The dock has its own setting (`dockStyle`), edited in its own Bottom dock section: **Match theme** (the default) sits it on the theme's darker colour with icons in the first theme colour that reaches 4.5:1 on it (else white or near-black); **Silver** is brushed-metal discs with silver icons on a near-black dock, matching the Chrome tiles; and **Custom** uses the owner's dock, icon and first-button colours (`dockColors` in `src/lib/themes.ts`). The editor warns when custom icons fall under 3:1. Presets never change the dock.

Density is tight and tactile: 12px gutters, 10px gaps, generous corner radii, depth from sheens and soft drop shadows rather than borders.

This system governs the public profile page only: `ProfilePage`, `ActionDock`, `ContactActions` and the `.profile` block at the end of `globals.css`, including the same component inside the dashboard's phone preview. The dashboard and marketing pages keep their older, separate look (warm off-white ground, violet `#5b3df5` accent, the `btn` / `card` / `input` utilities in `globals.css`) and are not governed by this file.

**Key Characteristics:**
- One dark profile card, one tile grid, one floating dock; nothing else on the page except the OneTap wordmark footer.
- One control per action across card, dock and tiles.
- Owner theme drives every colour, radius and font; the helpers guarantee contrast.
- Picture tiles show the linked site's own preview image whole, or a large platform icon.
- Load sequence: card and tiles rise in order, the dock floats in; reduced motion is fully static.

## Colors

Monochrome metal by default; every value below is the Chrome preset's default for a per-owner theme role, never a fixed brand colour.

### Primary
- **Chrome Ink** (chrome-ink): theme `text` and `buttonText`. The profile card surface, tile text, the "Open" pill fill, the dock body and the QR code modules. The darkest thing on the page.

### Neutral
- **Chrome Silver** (chrome-silver): theme `buttonBg`. Filled link tiles (as a sheen gradient), and in Chrome the card's ink, chosen by `bestOn` because it is the theme colour that reads best on the dark card.
- **Chrome Light** (chrome-light): theme `bg`, top of the page gradient. Also the dock's light colour: the highlighted disc fill and the quiet discs' icon colour.
- **Chrome Shade** (chrome-shade): theme `bg2`, bottom of the 165deg page gradient; the footer wordmark's colour is chosen against it.
- **Sheet White** (sheet-white): the QR sheet and the light QR modules, fixed regardless of theme so the code always scans. Also the card ink when a cover photo sits behind the card.

### Named Rules
**The Derived Ink Rule.** No surface hard-codes its text colour. Card ink is the theme colour that best contrasts the card (`bestOn`), accepted only at 4.5:1 or better, else white or `#0d0d0f`. The footer uses `bestOn` against the colour the page actually ends on. The dock is always the darker of `text` and `bg`, whichever way round the theme is.

**The No-Merge Rule.** When filled tiles are already the ink colour (`similarColors(buttonBg, text)`), the card switches to a page-colour surface tinted 12% toward ink, so card and tiles never fuse into one slab.

## Typography

**Display Font:** owner's choice; default Inter (Modern). Alternatives: Nunito (Friendly), Lora (Elegant), JetBrains Mono (Technical).
**Body Font:** the same family; the page uses one family throughout.

**Character:** one family, weights 400 / 500 / 600 only, small sizes. Hierarchy comes from weight and opacity (handle at 60%, bio at 75%, caption at 75%) rather than size jumps.

### Hierarchy
- **Name** (600, 22px, 1.25, -0.01em): the display name on the card, balanced, wraps after dots and underscores. Names over 18 characters drop to **Name Long** (19px, 1.375). The verified tick sits inline at 0.85em, owner-approved pages only.
- **Tile Title Wide** (600, 17px, 1.25): the title of a full-width last tile.
- **Tile Title** (600, 14px, 1.25): tile titles, clamped to two lines.
- **Body** (400, 14px, 1.625): the bio, as a tagline capped at 30ch, centred, balanced, line breaks preserved.
- **Label** (500, 14px): contact pill labels; 13px in frames narrower than 300px. The "Open" pill is 13px / 600.
- **Handle** (400, 13px, 60% opacity): @handle under the name.
- **Caption** (400, 12px, 75% opacity): the tile's domain ("instagram.com"), or "Email" / "Call" for mail and phone links. The footer wordmark is 12px / 600 with wide tracking.

### Named Rules
**The Owner's Font Rule.** Every text element inherits the owner's chosen family; never set a family on an individual element of the profile page.

## Layout

A single centred column, max 440px wide, 12px side gutters (10px in the dashboard preview), 12px top padding on phones and 32px from the small breakpoint (640px). The card comes first, then the tile grid 10px below it, then the footer 40px below the tiles, then the sticky dock.

Tiles sit in a two-column grid with 10px gaps. When the count is odd, the last tile spans both columns. On a 390px phone the card fills about the top half of the first viewport and the first row of tiles follows.

The dock is sticky to the bottom, centred, at least 16px above the bottom edge (respecting the safe-area inset), with 12px of breathing room above it.

When an owner has a cover photo and the viewport is 640px or wider, a blurred, saturated copy fills the page behind the column at 60% opacity under a 55% wash of the theme background.

### Named Rules
**The Odd Tile Rule.** An odd last tile spans both columns: image on the right at 42% width (4:3), title, caption and an "Open" pill on the left, at least 152px tall. Never leave a lone half-width tile.

## Elevation & Depth

Depth is lit metal: inset top highlights for sheen, a faint inset ring for an edge, and long soft drop shadows with negative spread so objects float without halos. No borders on the default surfaces.

### Shadow Vocabulary
- **Card lift** (`inset 0 1px 0 rgb(255 255 255 / 0.18), inset 0 0 0 1px color-mix(in oklab, <card ink> 10%, transparent), 0 24px 50px -28px rgb(0 0 0 / 0.7)`): the profile card.
- **Tile sheen** (`inset 0 1px 0 rgb(255 255 255 / 0.45), inset 0 0 0 1px rgb(255 255 255 / 0.12), 0 14px 30px -18px rgb(0 0 0 / 0.55)`): filled link tiles.
- **Dock float** (`inset 0 0 0 1px color-mix(in oklab, <light> 18%, transparent), 0 22px 48px -12px rgb(0 0 0 / 0.6), 0 4px 10px rgb(0 0 0 / 0.18)`): the dock, over a 92% dark fill with a strong backdrop blur.
- **Disc pop** (`0 4px 14px -4px rgb(0 0 0 / 0.5)`): the highlighted dock disc.
- **Avatar ring** (`0 10px 28px -10px rgb(0 0 0 / 0.6)`): under the avatar's ring.

### Named Rules
**The Top-Lit Rule.** Filled surfaces carry a vertical or 160deg gradient that starts lighter (mixed about 30% toward white) and ends slightly darker (about 10% toward black), plus a 1px inset white highlight on the top edge. That is the metal.

## Shapes

Generous, soft rectangles and full circles. The card is 34px-rounded. Tile radius follows the owner's button shape: square 14px, rounded 28px, pill 34px. Images inside a tile are inset 8px and rounded to the tile radius minus 8 (minimum 8px). Pills, social discs, dock discs, the avatar and the dock itself are fully round. The QR sheet is 30px-rounded.

## Components

### Profile Card (signature)
The page's dark ink object, top-lit.
- **Surface:** theme `text` as a vertical gradient (68% toward white at the top, to the base at 55%, to 10% toward black at the bottom). With a cover photo: `#0d0d0f` with the photo filling the card under a black scrim (25% to 55% to 85%), and white ink.
- **Content, centred:** a 112px avatar in a 5px ring of card ink at 92%; the initial on the card colour when there is no avatar. Then name with optional verified tick, @handle, bio, contact pills, social discs.
- **Padding:** 32px top, 20px sides, 24px bottom.

### Contact Pills
Two outline pills, side by side: **Save contact** and **WhatsApp**. Save contact appears only when the page has a phone number; WhatsApp falls back to Email when there is no number but there is an address. A single pill spans the full width.
- **Style:** transparent, 1.5px inset outline in card ink at 55%, 48px tall, fully round. Icons (15-16px) show only when the frame is at least 300px wide.
- **States:** hover tints the fill with 10% of the current colour; press scales to 0.97.

### Social Discs
40px outline circles (1.5px card ink at 35%) with a 16px brand icon, centred in a wrapping row under the pills. Same hover and press as the pills (press 0.95).

### Link Tiles
Picture tiles in the owner's button style.
- **Fill (default):** button colour with the Tile Sheen and Top-Lit gradient, button-text ink.
- **Outline:** transparent with a 1.5px inset ring of the button colour, page-text ink.
- **Hard shadow:** button colour, 2px border and a 4px 4px 0 offset shadow in page text. Owner-selected theme style only; never a default.
- **Media:** the stored copy of the site's preview image in a 16:9 frame, shown whole (`object-contain`) over a blurred, 125%-scaled cover copy of itself, never cropped. Tiles without a usable preview show the platform's icon large (56px, 48px on the wide tile), picked from the URL by `platformForUrl`, with the globe for unknown sites.
- **Text:** title (two lines max) and caption below the media.
- **States:** hover lifts 1px and brightens 4%; press scales to 0.985 (0.25s, `cubic-bezier(0.16, 1, 0.3, 1)`).

### Wide Tile and Open Pill
The odd last tile (see The Odd Tile Rule). Its "Open" pill is fully round, 13px / 600, filled with button-text on button colour (inverse of the tile); for outline themes, button colour with page-background text.

### Action Dock (signature)
A black pill of round 52px buttons, 8px apart and 8px inset, floating at the bottom: **Call**, **Email**, **QR code**, **Share**, each only when available (Call needs a phone, Email an address). The first item is highlighted: filled with the light colour, dark icon, Disc Pop shadow. The rest are quiet: light at 13% with an 18% inset top highlight. Icons 17-18px. Press scales to 0.9. Share uses the native share sheet, else copies the link and briefly shows a tick (announced to screen readers).

### QR Sheet
A modal dialog: white, 30px corners, `min(88vw, 340px)` wide, centred over a 55% black, lightly blurred backdrop. The owner's name (17px / 600), "Scan to open this page" (13px, 65%), and a QR code of the page URL up to 240px, generated locally, near-black on white. A 40px round close button top-right; clicking the backdrop closes it.

### Footer
The OneTap wordmark as text, 12px / 600, wide tracking, centred, coloured by `bestOn` against the page's final colour.

### Focus
2px outline, 3px offset, in the page ink. On the card and the dock the outline switches to the colour opposite their surface (`--pf-focus`).

### Motion
Card and tiles rise into place (from 16px below at 30% opacity, 0.8s, `cubic-bezier(0.16, 1, 0.3, 1)`, staggered 55ms each after 140ms). The dock floats in (from 24px below at 96% scale, 0.7s, after 0.4s). A cover photo settles from 108% scale and 12px blur over 1.2s. All of it runs only under `prefers-reduced-motion: no-preference`; otherwise everything is static.

### Named Rules
**The One Control Rule.** Each action has exactly one control. The card pills carry Save contact and WhatsApp. The dock carries only Call, Email, QR code and Share. WhatsApp (when there is a number) and Email are removed from the card's social icons, and a wa.me link tile to the same number is hidden.

## Do's and Don'ts

### Do:
- **Do** keep the page to three objects: profile card, two-column tile grid, floating dock.
- **Do** derive every text colour on the card, dock and footer through `bestOn` / `contrast` / `luminance`, and keep card ink at 4.5:1 or better.
- **Do** keep one control per action: Save contact and WhatsApp on the card, Call / Email / QR / Share in the dock, highlight on the first dock item.
- **Do** show preview images whole over their own blurred copy, and fall back to a large platform icon when there is no usable preview.
- **Do** span an odd last tile across both columns with its image on the right and an "Open" pill.
- **Do** let tile radius follow the owner's button shape (14 / 28 / 34px) and keep the card at 34px.
- **Do** gate every load animation behind `prefers-reduced-motion: no-preference`.

### Don't:
- **Don't** stack the links as a single column of identical pill buttons.
- **Don't** repeat an action: no WhatsApp or Email social icon alongside the pill and dock, no wa.me tile to the page's own number, no Save contact in the dock.
- **Don't** crop a preview image to fill its frame; those images carry their own text.
- **Don't** let card and filled tiles share a colour; switch the card surface instead.
- **Don't** show stats, follower counts or a verified tick the site owner hasn't approved.
- **Don't** bring the dashboard's violet accent or its `btn` / `card` / `input` utilities onto the profile page, or this page's card, tile and dock language into the dashboard.
- **Don't** use the hard offset shadow outside the owner-selected "Hard shadow" button style.
