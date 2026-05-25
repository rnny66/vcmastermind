# The VC Coach — Style Guide

---

## Color Palette

All colors are defined as CSS variables in `styles.css `:root`. Always use these — never hardcode hex values.

### Core Colors

| Name | Variable | Hex | Use |
|------|----------|-----|-----|
| Cream | `--color-cream` | `#F7F5F0` | Page background, light text on dark |
| Charcoal | `--color-charcoal` | `#2D3A38` | Primary body text, headings |
| Primary (Teal) | `--color-primary` | `#1c4e46` | Brand color — nav, buttons, icons, borders |
| Primary Light | `--color-primary-light` | `#2a6b60` | Teal hover state |
| Primary Soft | `--color-primary-soft` | `rgba(28,78,70,0.08)` | Subtle teal tints |
| Accent (Orange) | `--color-accent` | `#ff8a00` | CTAs, emphasis, section labels, highlights |
| Accent Light | `--color-accent-light` | `#ffaa40` | Orange hover state |
| Taupe | `--color-taupe` | `#6B7A77` | Secondary/body text, muted elements |
| Stone | `--color-stone` | `#E8E4DC` | Card backgrounds, subtle fills |
| Sage | `--color-sage` | `#E9EFED` | Alternating section backgrounds |

### Section Background Rotation

Sections alternate between backgrounds to create rhythm:

```
Hero         → --color-cream (with subtle radial gradient overlay)
What It Is   → --color-sage
Who It's For → --color-stone
What You Get → --color-cream
Why It Works → --color-cream
Selection    → --color-cream
Facilitators → --color-cream
Pricing      → --color-sage
CTA          → --color-sage
Footer       → --color-primary
```

### Color Rules

- Never use colors outside the palette
- Orange (`--color-accent`) is for emphasis and CTAs — not decorative fills
- Taupe (`--color-taupe`) is for secondary/supporting text, never primary headings
- On dark (primary) backgrounds: use `--color-cream` for text, `rgba(247,245,240,0.6–0.85)` for muted text

---

## Typography

### Fonts

```css
--font-display: 'Cormorant Garamond', Georgia, serif;  /* Headings, pull quotes, numbers */
--font-body:    'Outfit', sans-serif;                   /* Body text, nav, labels, buttons */
```

Loaded from Google Fonts. Always specify the fallback stack.

### Type Scale

| Role | Size | Weight | Font | Notes |
|------|------|--------|------|-------|
| Hero H1 | `clamp(2.8rem, 5vw, 4.2rem)` | 400 | Display | Italic `<em>` in accent color |
| Section H2 | `clamp(2.5rem, 4vw, 3.5rem)` | 400 | Display | |
| Section H2 (small) | `clamp(2rem, 3vw, 2.5rem)` | 400 | Display | Tighter sections |
| Card H3 | `1.3rem – 1.5rem` | 500 | Display | |
| Body Large | `1.1rem – 1.15rem` | 300 | Body | Hero description, intro paragraphs |
| Body | `1rem` | 300 | Body | Default paragraph text |
| Small | `0.9rem – 0.95rem` | 300–400 | Body | List items, supporting text |
| Labels (eyebrow) | `0.75rem` | 500 | Body | Uppercase, `0.2em` letter-spacing, accent color |
| Nav links | `0.85rem` | 400 | Body | Uppercase, `0.08em` letter-spacing |
| Buttons | `0.85rem – 0.9rem` | 500–600 | Body | Uppercase, `0.1em` letter-spacing |
| Offering numbers | `2.5rem` | 400 | Display | Accent color, 60% opacity |

### Typography Rules

- Display font for all headings (`h1`, `h2`, `h3`), pull quotes, and decorative numbers
- Body font for everything else: paragraphs, labels, buttons, nav
- Heading weight is almost always `400` — the elegance comes from the serif face, not bold weight
- Use `<em>` with italic + accent color for key words in headings
- Section eyebrow labels: always uppercase, `0.2em` letter-spacing, accent color
- Line height: `1.6–1.8` for body text, `1.15–1.2` for headings

---

## Spacing Scale

```
0.5rem  =  8px   Micro (icon gaps, small padding)
0.75rem = 12px   XS
1rem    = 16px   Small
1.5rem  = 24px   Medium
2rem    = 32px   Large
2.5rem  = 40px   XL
3rem    = 48px   2XL
4rem    = 64px   3XL
5rem    = 80px   4XL
6rem    = 96px   5XL
8rem    = 128px  Section padding (standard)
10rem   = 160px  Section padding (CTA)
```

---

## Layout

### Container

```css
.container {
    max-width: 1320px;
    margin: 0 auto;
    padding: 0 2rem;
}
```

### Common Grid Patterns

```css
/* Two-column content (text + visual) */
grid-template-columns: 1fr 1fr;
gap: 4rem–6rem;

/* Two-column (heavier right side) */
grid-template-columns: 1fr 1.5fr;
gap: 6rem;

/* Three-column criteria/features */
grid-template-columns: repeat(3, 1fr);
gap: 2rem;

/* Two-column offerings */
grid-template-columns: repeat(2, 1fr);
gap: 2.5rem;

/* Featured card (full width) */
grid-column: span 2;
grid-template-columns: 1fr 1fr;  /* inner layout */
```

### Responsive Breakpoints

```css
@media (max-width: 1024px) { /* Tablet — collapse to single column grids */ }
@media (max-width: 768px)  { /* Mobile — hide desktop nav, mobile menu, stack everything */ }
```

---

## Buttons & CTAs

### Primary CTA Button

```html
<a href="#" class="hero-cta">
    <span>Button Text</span>
    <svg><!-- arrow icon --></svg>
</a>
```

```css
/* Style: teal bg, cream text, uppercase, slide-in orange hover */
background: var(--color-primary);
color: var(--color-cream);
padding: 1.25rem 2.5rem;
font-size: 0.85rem; font-weight: 500;
letter-spacing: 0.1em; text-transform: uppercase;
/* ::before pseudo-element slides in from left with accent color */
```

### Pricing CTA (on dark bg)

```css
background: var(--color-cream);
color: var(--color-primary);
border: 2px solid var(--color-cream);
/* hover: accent background */
```

### General CTA Button

```html
<a href="#" class="cta-button">Button Text <svg>...</svg></a>
```

```css
/* Like hero-cta but simpler hover (no slide effect) */
background: var(--color-primary);
/* hover: background → accent, color → charcoal */
```

### Rules

- All CTA buttons: uppercase, tracked (`0.08–0.1em`), no border-radius (or `2px` max)
- Arrow icon on right — translate on hover with `transform: translateX(5px)`
- Primary hover: orange fill (`--color-accent`), text switches to charcoal
- Never use rounded buttons — sharp edges are on-brand

---

## Cards

### Standard Card

```css
.card {
    padding: 3rem;
    background: var(--color-cream);
    border: 1px solid rgba(26, 26, 26, 0.08);
    transition: all 0.4s ease;
}

.card:hover {
    border-color: var(--color-primary);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}
```

### Offset Border Decoration

The layered frame effect used on hero details, pricing card, facilitator images, and testimonials:

```css
.element {
    position: relative;
}

.element::before {
    content: '';
    position: absolute;
    top: -15px;
    right: -15px;       /* or top-left: top: -10px; left: -10px */
    width: 100%;
    height: 100%;
    border: 1px solid var(--color-primary);
    z-index: -1;
}
```

### Featured Card (Full Width, Dark)

```css
background: var(--color-primary);
color: var(--color-cream);
grid-column: span 2;
```

Text colors on dark cards:
- Headings: `var(--color-cream)`
- Body: `rgba(247, 245, 240, 0.7)`
- List items: `rgba(247, 245, 240, 0.85)`
- Dividers: `rgba(247, 245, 240, 0.15)`

---

## Section Anatomy

Every section follows this structure:

```html
<section class="[section-name]" id="[section-name]">
    <div class="container">
        <!-- optional header -->
        <div class="[section-name]-header fade-in">
            <span class="section-label">Eyebrow Text</span>
            <h2 class="[section-name]-title">Section Heading</h2>
            <p class="[section-name]-subtitle">Optional subtitle</p>
        </div>
        <!-- content -->
    </div>
</section>
```

### Section Label (Eyebrow)

```css
.section-label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-accent);    /* orange by default */
    margin-bottom: 1.5rem;
    display: block;
}
```

On the Pricing section, the label uses `--color-primary` (teal) instead of accent.

---

## Icons

All icons are inline SVG using Heroicons stroke style:

```html
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="..." />
</svg>
```

Standard sizes:
- `24px × 24px` — body/list icons
- `48px × 48px` — feature/criteria card icons
- `20px × 20px` — button icons

Color is inherited via `currentColor` — set `color` on the parent or the SVG directly.

---

## Animations

### Page Load

```css
@keyframes fadeDown { from { opacity:0; transform:translateY(-20px) } to { opacity:1; transform:translateY(0) } }
@keyframes fadeUp   { from { opacity:0; transform:translateY(40px)  } to { opacity:1; transform:translateY(0) } }
```

Nav uses `fadeDown 0.8s ease-out`. Hero text uses `fadeUp 1s ease-out 0.2s both`. Hero visual: `0.4s` delay.

### Scroll Animations

Add `.fade-in` to any element that should animate on scroll:

```css
.fade-in { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
.fade-in.visible { opacity: 1; transform: translateY(0); }
```

The IntersectionObserver in each page's inline script adds `.visible` at `threshold: 0.1` with `-50px` bottom margin.

### Transition Timings

```
0.3s ease    → Fast (hover color/text changes)
0.4s ease    → Standard (border, shadow, transform on cards)
0.8–1s       → Entrance animations
```

### Status Dot (Pulsing Green)

```css
.status-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #2ecc40;
    animation: pulse-dot 2s ease-in-out infinite;
}
```

---

## Noise Texture Overlay

Used on hero and alternating sections for subtle depth:

```css
.section::before {
    content: '';
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,...fractalNoise...");
    opacity: 0.02–0.03;
    pointer-events: none;
}
```

---

## Navigation

- Fixed, `z-index: 1000`, frosted glass: `backdrop-filter: blur(10px)`, `background: rgba(247,245,240,0.95)`
- Logo: image-based (`img/logo.png`, `height: 40px`)
- Nav links: uppercase, tracked, taupe color, hover to charcoal
- CTA link `.nav-cta`: teal bg, cream text, hover to accent — `border-radius: 2px`
- Mobile: nav links hidden at ≤768px, hamburger toggle shown, full-screen overlay menu

---

## Footer

- Background: `--color-primary` (teal)
- Text: `rgba(247, 245, 240, 0.6)` — link hover goes to full cream
- Three-column layout: logo | nav links | connect links
- Bottom border + copyright line

---

## What NOT to Do

- Don't use colors outside the palette (no grays, no default browser colors)
- Don't use px for font sizes — use rem
- Don't use rounded corners on buttons (sharp edges are on-brand; `2px` max)
- Don't add `font-weight: 700` (bold) to display headings — `400` is intentional
- Don't skip the offset `::before` decoration on key cards — it's a signature pattern
- Don't use `background: transparent` on hover elements that need CSS hover to work
- Don't inline styles for colors — use `var(--color-*)` even in inline styles
- Don't nest CSS selectors more than 3 levels deep
- Don't omit `alt` attributes on images
- Don't add section padding below `5rem` on mobile — breathing room is part of the brand
