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

THESIS: the page as one premium object, a glossy profile card over a bento of silver link tiles and a floating round-button dock. It refuses the category default of a centred avatar over a column of identical pill buttons.

OWN-WORLD: monochrome metal by default (the "Chrome" preset), and any owner theme renders the same structure. A dark "ink" profile card with a top-lit sheen, a centred 112px avatar in a thick light ring, name with an optional verified tick, @handle, the bio as a tagline, and two outline pills (Save contact, WhatsApp). Link tiles sit in two columns with a metallic sheen, each showing the stored copy of the site's own preview image or a large platform icon. An odd last tile spans the full width with its image on the right and an "Open" pill. The dock is a black pill of round buttons with Save contact highlighted.

STORY: who this is (ringed avatar and name), how to reach them (pills and dock), and where to go next (picture tiles).

FIRST VIEWPORT: on a 390px phone, the profile card takes about the top half, the first row of tiles follows, and the dock is pinned 16px above the bottom.

FORM: user-pinned reference (dark profile card, outline pills, silver bento tiles, round-button dock). Position 1 of 1, pinned by the user's reference image. No concept-seed roll was run, because a pinned direction beats the roll. seed: none (pinned by user reference, no roll run)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: the card and tiles rise into place in sequence on load and the dock floats in. Reduced motion shows everything static.
