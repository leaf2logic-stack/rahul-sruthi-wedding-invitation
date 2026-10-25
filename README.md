<<<<<<< HEAD
# Rahul & Ananya — React Wedding Invitation

A responsive, animated wedding invitation built with React + Vite. Features a split-curtain opening, scroll reveal, couple story, wedding details, 12-image gallery with lightbox, venue/map links, optional background music, and mobile navigation.

## Run locally

1. Install Node.js (18+ recommended).
2. In this folder run:
   ```bash
   npm install
   npm run dev
   ```
3. Open the local URL printed by Vite.

## Add your 15 images

Copy your image files into `public/images/` and keep the exact names:

- `img1.png`
- `img2.png`
- ...
- `img15.png`

The intro and hero use `img1.png`; the couple cards use `img2.png` and `img3.png`; the gallery uses `img4.png` through `img15.png`. Replace the dummy names, date, time and location in `src/main.jsx` before publishing.

## Optional music

Create `public/music/` and place a royalty-free audio file named `soft-wedding-music.mp3` inside it. The music button will toggle playback. Browser autoplay is intentionally not used; visitors choose to turn sound on.

## Update the wedding details

At the top of `src/main.jsx`, edit the `wedding` object. The current date and names are dummy demo content. The map link points to a Google Maps search for Kulanada Devi Temple, Kerala.

## Build for deployment

```bash
npm run build
```
The production site is generated in `dist/` and can be deployed to Vercel, Netlify, or any static hosting provider.
=======
# wedding-invitation
Premium digital wedding invitation website
>>>>>>> e775a755cf800d21c2d1ded6bade1a3329dff617
