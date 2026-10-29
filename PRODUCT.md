# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Visitors:** people who tap a OneTap NFC card, or scan its QR code, and land on the card owner's profile page on their phone. Usually a stranger meeting the owner in person, deciding in seconds whether to save the contact, message them or open a link.
- **Page owners:** OneTap card customers, both businesses and individuals. They sign up with an invite code and edit their page from the dashboard.

## Product Purpose

The public profile page behind every OneTap NFC card. It turns one tap into a saved contact, a WhatsApp chat or a visit to the owner's links. The page owner's identity has to come across as credible and professional.

## Positioning

The digital half of a physical OneTap card. The page is designed for the moment right after a tap, in person and on a phone. It is not a general creator link-in-bio.

## Operating Context

- Visitors open pages on mobile phones, often straight from an NFC tap or a QR scan, sometimes inside in-app browsers.
- Most users are in Pakistan. Numbers are typed in local format (03xx) and WhatsApp is the main messaging channel.
- Owners manage pages in the dashboard (Links, Appearance, Analytics, Settings) with a live phone preview.

## Capabilities and Constraints

- Each page has: avatar, display name, bio, social icons, ordered link buttons, and a Save contact action. On Android, Save contact opens the Contacts app; on iPhone it shows the vCard sheet.
- Per-owner themes: presets plus custom background (solid or gradient), text colour, button colour and style (fill, outline or hard shadow), shape and font. Every redesign must keep these themes working.
- Links go through /go/<id> for click analytics. Views are counted with a beacon.
- Stack: Next.js 15, Tailwind v4, SQLite/Turso. Deployed on Vercel in bom1.
- Owners can upload an optional cover photo, which becomes the page's hero.
- The verified tick appears only on pages the site owner approves, using a flag in the database. There is no self-serve verification.

## Brand Commitments

- Product name: **OneTap**. It replaces the placeholder "Linkfolio" everywhere.

## Evidence on Hand

- Live owner page: onetapcards.official, with the OneTap logo avatar and the bio "Connect • Share • Grow with onetap".
- There are no testimonials, user counts or follower stats. Don't invent any.

## Product Principles

1. Built for the seconds after a tap: everything a visitor needs is visible and reachable on one phone screen.
2. Saving the contact, messaging and opening links matter equally; none should bury the others.
3. The owner's identity leads and OneTap stays in the background.
4. Every owner's theme must still look professional, whichever colours they pick.
