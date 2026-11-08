# StrataLab brand — quick reference for Claude Code

Full guide with previews: `StrataLab-Brand-Guide.html` (open in a browser). This file is the part you need while coding.

## Name and voice
- **StrataLab**, one word, capital S and L. Domain written lowercase: `stratalab.app`.
- Tagline: **Deep time, close up.** Alternates: *Read the layers.* / *The ground keeps records.* / *Every contact is a date.*
- Status-line text: lowercase, present tense, monospaced, trailing `_` — `reading the section_`, `fetching the last hour of quakes_`, `correlating beds across the fault_`, `cached 14:02 UTC · USGS_`.
- Tone: plain textbook register, observational, never alarmist (no "danger/threat/risk"). Numbers carry units and a timestamp.

## The mark
A rounded tile of five coloured beds cut by a normal fault; the hanging wall (right) has dropped half a bed so every contact steps.
- viewBox `0 0 128 128`, radius 28, inner outline 3 px Basement; beds 24 units; fault `(46,128)→(82,0)`, stroke 5; throw 12.
- Minimum 16 px. Clear space ½ mark height. Never flip, rotate, recolour, add shadow/gradient.
- Files: `app/favicon.svg` (replaces the Valence molecule in `public/favicon.svg`), `app/favicon.ico`, `app/apple-touch-icon-180.png`, `app/icon-maskable-192.png`, `app/icon-maskable-512.png`, `app/header-lockup-light.svg` / `-dark.svg` (32 px tall in the shell).

## Colour (hex · oklch)
| Token | Hex | Role |
|---|---|---|
| Basement | `#1B1816` | dark paper, outlines, fault line |
| Slate | `#2E2A2B` | ink on light, primary button (light) |
| Chalk | `#FAF6EE` | paper (light), ink on dark |
| Magma | `#C4432B` | **accent**: links, active nav, progress, focus ring, dike, "Lab" |
| Magma bright | `#E0634B` | accent on dark |
| Sandstone | `#DDA247` | bed 1 · chart-1 |
| Shale | `#8E8FB7` | bed 2 · chart-2 |
| Limestone | `#F0E1AE` | bed 3 · fill only, never text |
| Mudstone | `#E59C86` | bed 4 · chart-4 |
| Greensand | `#9DB97A` | bed 5 · chart-3 |
| Shale deep | `#5E5F86` | slickenlines, chart-5 |

Bed order is fixed, top to bottom: Sandstone → Shale → Limestone → Mudstone → Greensand (then repeats). Magma is never a bed.

`tokens/stratalab-brand.css` holds complete `:root` and `.dark` blocks in oklch with shadcn variable names (plus `--brand` and raw `--strata-*`). Paste over the neutral blocks in `src/index.css`. `tokens/stratalab-tokens.json` has the same data for scripts.

## Type
- Display: **Zilla Slab 700** (600 for h3 and below) — `npm i @fontsource/zilla-slab`, import 600 + 700; `--font-heading: 'Zilla Slab', ui-serif, Georgia, serif`.
- Body: **Inter** (already in the app).
- Data: **JetBrains Mono 500** — `npm i @fontsource-variable/jetbrains-mono`; `--font-mono: 'JetBrains Mono Variable', ui-monospace, monospace`. Uppercase labels: 0.12–0.14 em tracking.
All three are SIL OFL.

## Illustration style
Filled block diagrams, cabinet projection (depth up-right, factor 0.62/−0.36), flat lithology fills with hatching on front faces (Limestone brick, Sandstone dots, Shale dashes, Greensand ticks, Mudstone solid), side faces mixed 22 % toward Basement, top faces mixed 42 % toward Chalk, outlines 1.6 units Basement at 90 %, fault trace 2.6, half-arrows on both walls, intrusions in Magma. Exposed fault planes: Shale mixed 50 % to Chalk with Shale-deep slickenlines down-dip. Keep the sense of slip correct.
Files: `illustration/stratalab-hero-block-{light,dark,transparent,labelled-light,labelled-dark}.svg` (+ 2x PNG), `illustration/stratalab-strata-strip.svg` (banner device).

## Social
`social/` has PNG + SVG for: GitHub social preview 1280×640, OG 1200×630, X/Bluesky header 1500×500, Reddit banner 1920×384, YouTube banner 2560×1440, avatars 1024 (dark / chalk / transparent).

## Wiring checklist
1. `public/favicon.svg` ← `app/favicon.svg`; add `favicon.ico`, `apple-touch-icon-180.png`, maskable icons to `public/`; reference in `index.html` + manifest; add `og:image` → `social/og-image-1200x630.png`.
2. Tokens into `src/index.css`.
3. Fonts via fontsource; `@theme inline` heading/mono tokens.
4. Header lockup SVG in the shell; swap on `.dark`.
5. Labelled block diagram on the About page beside the credits.

Hard rules from CLAUDE.md still apply to every asset: no course numbers, institution or campus names, or location data.

Brand kit v1.0 · November 2026 · prepared by Erin Lukens (Panda), Firetail Fab, with Claude (Anthropic).
