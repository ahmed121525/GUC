# Girl Up Conquistadors (GUC)

A bold, futuristic NGO website built with React + TypeScript + Vite, designed for deployment on GitHub + Vercel.

## Included pages

- Home
- About Us
- Join Us
- Events Calendar
- Donate
- Archive
- Custom 404

## Configure the site

Edit `src/config.ts` for the NGO name, contact details, location, social links, donation UPI, and bank details. The default values intentionally say `configure-before-launch` so the demo cannot masquerade as real financial/contact data.

Edit `src/data/events.ts` to add, remove, or change calendar events. The calendar UI does not need to be touched.

Edit `src/data/archive.ts` for local demo archive metadata. The production upload path should use Supabase Storage + a metadata table.

## Join Us email delivery on Vercel

The browser posts to `/api/join`.

Set these Vercel environment variables:

- `CONTACT_EMAIL`: the inbox that should receive applications
- `RESEND_API_KEY`: Resend API key
- `EMAIL_FROM`: sender on your verified Resend domain

No secret is exposed to the browser.

For local API testing, run through `vercel dev` rather than only `vite`, because the serverless function lives in `/api`.

## Archive uploads on Vercel + GitHub

Do not save user uploads into the Git repository or local Vercel filesystem. Those are deployment/build infrastructure, not durable user media storage.

Recommended production architecture:

1. Create a Supabase project.
2. Create a Storage bucket named `guc-archive`.
3. Create a metadata table with fields such as `id`, `year`, `month`, `event_name`, `storage_path`, `public_url`, `caption`, and `created_at`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel.
5. Protect the upload UI with authenticated admin access before making it public. The included uploader is deliberately dependency-light and demonstrates direct Storage upload.
6. Keep event/image metadata separate from the React components so the archive UI remains maintainable.

The existing uploader performs client-side type and size checks and uploads to `archive/YYYY/MM/...` inside the `guc-archive` bucket.

## Images

The demo uses remote Unsplash image URLs for archive placeholders. Replace them with Supabase Storage public URLs in production. Use modern formats and responsive sizing when the final image set is known.

## Deployment

```bash
npm install
npm run build
```

Then push to GitHub and import the repository into Vercel. Vercel will build the Vite app and serve `/api/join` as a serverless function.

## Mobile / accessibility checklist

The site includes:

- horizontal overflow prevention
- semantic navigation + mobile menu
- keyboard-friendly buttons/modals
- reduced-motion support
- clickable `mailto:` and `tel:` links
- custom page titles + descriptions
- custom 404
- calendar empty states and modal details
- form validation/loading/success/error states
- mobile layouts and touch-sized controls

## Visual performance update
- Replaced the heavy Bowlby display face with Barlow Condensed for a slimmer blocky display style.
- Reworked the desktop cursor to use a single requestAnimationFrame-driven transform with no trailing spring interpolation.
- Reduced particle count, device-pixel-ratio, and particle redraw cadence; coarse/reduced-motion devices receive fewer or no particles.
- Consolidated pointer movement state so parallax variables and cursor state share one listener.
- Added a cursor-positioned hover-reveal backdrop to the home hero using CSS gradients instead of image/video assets.
- Forced the Join Us consent checkbox into a stable two-column inline layout.
- Added CSS containment to dense card sections to limit paint/layout work.
