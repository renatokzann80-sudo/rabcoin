# rabCOIN

A playful English-language static website. Run `node serve.cjs` and open http://127.0.0.1:4173. The public directory is `dist`; there are no build dependencies.

## Visuals and interaction

The hero uses a real WebGL fragment shader over the original rooftop artwork, with pointer-driven depth displacement, drifting light, rain, particles, and an interactive neon pulse. This is a textured animated scene, not a fully modeled 3D city. A static image remains visible if WebGL is unavailable. Rendering pauses outside the viewport and when the document is hidden. Pixel density is capped on mobile. Reduced-motion preferences are respected; the navigation includes a pause/resume control.

The floating icon navigation adapts to a bottom dock on mobile. Social logos remain in the hero without invented account links. Configure official URLs in `dist/config.js`.

The three-chapter gallery has keyboard-accessible dialogs, previous/next controls, arrow-key navigation, and Escape dismissal. The story is fictional brand lore.

## Artwork

The original white rabbit was supplied by the user. The rooftop hero and the following original gallery artworks were generated with the built-in image generation tool using that mascot as the identity reference:

- `dist/assets/arcade.png`: the rabbit jumping out of a neon arcade cabinet.
- `dist/assets/hoverboard.png`: the rabbit surfing a glowing hoverboard through a futuristic street.
- `dist/assets/rooftop-party.png`: the rabbit DJing for friendly robots on a rooftop.
- `dist/assets/rabverse-rooftop.png`: the original rooftop artwork, now used only as the hero background.

Prompt set: preserve the supplied fluffy white rabbit, pink ears, happy cyan LED visor, black techwear and cyan/violet accents; change the pose and camera dramatically for each scene; use premium cinematic 3D materials and fur, playful expressions, neon environments, landscape 3:2 framing, no UI, text or watermarks. Arcade scene: leap through a shattered digital game screen. Hoverboard scene: low camera angle, speed trails and wet-street reflections. Party scene: DJ decks, friendly robot audience and a neon skyline.

The web search found commercially sold cyberpunk rabbit art; those third-party artworks were not embedded. Earlier city photographs are retained as unused local assets and no longer appear on the website.

Fonts: Syne and Space Grotesk via Google Fonts, with local fallbacks.

Git upload and deployment await user approval.

