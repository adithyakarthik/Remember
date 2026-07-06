# 📍 Remember

Ever spotted a great piece of furniture, a lamp, a rug — something you'd want
to buy *later* — in a shop while you were out, and then completely forgotten
where it was? **Remember** fixes that.

When you see something worth coming back for, you snap a photo, tag the shop's
location (one tap uses your phone's GPS), file it under a heading like
*Furniture* with a few tags, and jot a note. Later you just open the app,
search or browse by heading, and it hands you back the photo, the shop, and a
one-tap link straight into Google Maps to navigate there. You can also share
any find to WhatsApp (or anywhere) with one button.

It's a **mobile-first web app (PWA)** — add it to your Android or iOS home
screen and it behaves like a native app: the camera, GPS, and share sheet all
work, with no app store needed.

## What you can do

| | |
|---|---|
| 📷 **Photograph an item** | Take one or more photos right from the app (opens the camera on your phone). |
| 📍 **Geo-tag the shop** | One tap uses your current GPS location; or search an address; or drop in coordinates by hand. |
| 🗂️ **File it your way** | Give it a heading (*Furniture*, *Lighting*, *Sarees*…) and free-form tags you invent for yourself. |
| 🔎 **Find it again** | Search across titles, tags, shop names and addresses, or filter by heading. |
| 🗺️ **Navigate back** | Every find has an "Open in Google Maps" link to the exact spot. |
| 📤 **Share** | Send a find to WhatsApp or anywhere via your phone's native share sheet. |

Your data is private to your account — each person only ever sees their own
finds.

## Tech stack

**Next.js** (App Router) + **TypeScript**, **Prisma** ORM on **Postgres**,
Tailwind CSS. Email-code login (no passwords) with an on-screen dev fallback,
free keyless geocoding via **OpenStreetMap Nominatim**, and photo storage on
**Vercel Blob** (with a local-disk fallback for development). No Google Maps
API key required — map links use plain Google Maps URLs.

## Deploy it (no terminal needed)

1. **Get a free database.** Sign up at [neon.tech](https://neon.tech), create a
   project, and copy the **connection string** (starts with `postgresql://`).
2. **Deploy to Vercel.** Go to [vercel.com/new](https://vercel.com/new), import
   this repository, and set these environment variables:
   - `DATABASE_URL` — the Neon connection string from step 1.
   - (Optional) `RESEND_API_KEY` + `RESEND_FROM_EMAIL` — from
     [resend.com](https://resend.com) to email real login codes. Without them,
     the login code is shown on-screen (fine for personal use).
   - (Optional) `BLOB_READ_WRITE_TOKEN` — enable **Blob** under Storage in your
     Vercel project to store photos there. Without it, photos are written to
     disk (fine locally, but not on Vercel's read-only filesystem — set this
     before uploading photos in production).
3. Click **Deploy**. Database tables are created automatically on deploy. Open
   your live URL, sign in with your email, and start tagging.

## Run it locally

You need [Node.js](https://nodejs.org) and a Postgres database (local, or a
free one from [neon.tech](https://neon.tech)).

```bash
cp .env.example .env      # then set DATABASE_URL
npm install
npm run setup             # create the database tables
npm run dev               # http://localhost:3001
```

On the login page, enter your email and click **Send login code** — since no
email provider is configured yet, the 6-digit code appears right on the next
screen. Enter it to sign in.

## Install it on your phone

Open your deployed URL in the phone's browser and choose **Add to Home
Screen**. It installs as an app icon and launches full-screen — from there the
camera, GPS, and share sheet all work like a native app.

## Project structure

```
src/
  app/
    page.tsx              Your finds — list, search, heading filter (home)
    new/                  Create a find
    find/[id]/            Find detail (photos, map link, share, delete)
    find/[id]/edit/       Edit a find
    actions.ts            Create/update/delete server actions
    geocode-actions.ts    Forward/reverse geocoding server actions
    FindForm.tsx          Shared create/edit form (camera input + resize)
    login/                Email-code sign in
    manifest.ts, icon.tsx, apple-icon.tsx   PWA install metadata
  components/
    LocationPicker.tsx    "Use my location" / address search / lat-lng
    ShareButton.tsx       Native share sheet → WhatsApp fallback
    ConfirmSubmitForm.tsx Confirm-before-submit (delete)
  lib/
    db.ts                 Prisma client
    finds.ts              Shared find queries (distinct headings)
    geocode.ts            OpenStreetMap Nominatim forward/reverse geocoding
    storage.ts            Photo storage (Vercel Blob / local disk)
    image-resize.ts       Client-side photo downscale before upload
    auth/                 Email-OTP login, Postgres sessions
  proxy.ts                Redirects signed-out users to /login
prisma/schema.prisma      Database structure (User, Session, OtpCode, Find, FindPhoto)
```
