---
version: 1
slug: "src-components-profilepage-tsx"
primary_target: "src/components/ProfilePage.tsx"
related_targets: ["src/app/[username]/page.tsx"]
---

# Public profile page

Scope: the page a visitor sees after tapping a OneTap card (`/[username]`), plus the same component inside the dashboard phone preview. Mode: Persuade. The visitor decides within seconds whether to save the contact, message the owner or open a link.

Audience and job: a stranger standing in front of the card owner, phone in hand. Action: save the contact, WhatsApp, call, share or open a link, all equally reachable. Constraints: owner themes (colours, button style and shape, font) must keep driving the page. There are no stats or follower counts, so none are shown. The verified tick appears only for owner-approved pages. Cover photos are optional.

## Direction contract

THESIS: the page as a stack of physical cards, the digital twin of the NFC card just tapped. It refuses the category default of a centred avatar over a column of identical pill buttons.

OWN-WORLD: a tall photo card with 32px corners and the name set large over a dark scrim. Beneath it an inverse "ink" panel uses the theme's text colour as its surface: ringed avatar, bio, circular outline social buttons. Link tiles follow the theme's button colours, each with a domain line and an arrow disc. A dark floating dock holds the actions. On desktop the cover photo blurs behind as the backdrop.

STORY: who this is (photo and name), what they do (bio), how to reach them (dock), and where to go next (tiles).

FIRST VIEWPORT: the hero card fills about 60% of the height, with the @handle chip, name and tick at its bottom left. The ink panel overlaps the hero's bottom edge by 28px. The dock is pinned 16px above the bottom: Save contact as a labelled primary pill, then WhatsApp, Call and Share discs.

FORM: user-pinned reference (stacked rounded cards, ink profile panel, floating pill dock). Position 1 of 1, pinned by the brief. seed: none (unavailable)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: on load the hero photo settles (scale 1.06 to 1, unblur) while the ink panel and tiles rise into place in a single orchestrated sequence. Pressing the dock gives tactile feedback. Reduced motion shows everything static.
