# The VC Coach — Emerging Manager Mastermind

## Project Overview

Static HTML/CSS/JS landing site for "The VC Coach — Emerging Manager Mastermind" program. Deployed via GitHub Pages with a custom domain (CNAME).

**Live site:** see `CNAME` file for domain  
**Stack:** Vanilla HTML + CSS + JavaScript — no frameworks, no build tools  
**Style guide:** [STYLE-GUIDE.md](STYLE-GUIDE.md)

---

## File Structure

```
/
├── index.html          ← Main mastermind landing page
├── index-new.html      ← Draft/alternate version
├── newsletter.html     ← Newsletter page
├── styles.css          ← Shared stylesheet (all pages)
├── img/                ← Images (logo.png, al.png, etc.)
├── CNAME               ← GitHub Pages custom domain
├── IMAGE-OPTIMIZATION.md
└── STYLE-GUIDE.md      ← Design system reference
```

---

## Brand & Core Values

- **Trust & Confidentiality** — Safe space for honest dialogue
- **Expertise Without Hierarchy** — Peer-driven, facilitated learning
- **Clarity Over Complexity** — Direct, actionable, no jargon
- **Human-Centered** — Recognizing the personal side of professional growth
- **Curated Quality** — Small intentional groups over mass networking

---

## Brand Voice

- **Direct & Clear** — Avoid jargon, say what you mean
- **Confident but Not Arrogant** — Expertise without hierarchy
- **Human & Relatable** — Speak to the person, not the title
- **No BS** — Honest about limitations and selection criteria

---

## Tech Conventions

### CSS Variables
All colors and fonts are defined as CSS custom properties in `:root` inside `styles.css`. Always use `var(--color-*)` — never hardcode hex values in new code.

### Container
```css
max-width: 1320px;
margin: 0 auto;
padding: 0 2rem;
```

### Section Padding
```css
padding: 8rem 0;   /* Desktop standard */
padding: 10rem 0;  /* CTA section */
padding: 5rem 0;   /* Mobile (inside @media max-width: 768px) */
```

### Responsive Breakpoints
```css
@media (max-width: 1024px)   /* Tablet */
@media (max-width: 768px)    /* Mobile */
```

### Animation Timings
```
Fast:       0.3s ease
Standard:   0.4s ease
Entrance:   0.8s–1s ease-out
Easing:     ease-out for entrances, ease for general transitions
```

### Scroll Animations
Elements with `.fade-in` are animated via IntersectionObserver in the inline `<script>` at the bottom of each HTML file. Add `.fade-in` to sections or cards that should animate on scroll; the observer adds `.visible` when they enter the viewport.

---

## HTML Conventions

- Use semantic elements: `<section>`, `<nav>`, `<footer>`, `<article>`
- Each section has an `id` matching its nav anchor (e.g., `id="what-it-is"`)
- Section structure: `<section class="[name]" id="[name]"> <div class="container"> ... </div> </section>`
- Icons are inline SVG (Heroicons stroke style, `stroke-width="2"`)
- Section labels (eyebrow text): `<span class="section-label">Label</span>`
- Numbered cards use `<div class="offering-number">01</div>` pattern

---

## CSS Conventions

- Use CSS variables for all brand colors and fonts
- No px for font sizes — use rem
- Don't nest selectors more than 3 levels deep
- Card hover pattern: `border: 1px solid transparent` at rest → `border-color: var(--color-primary)` on hover
- Offset border decoration: `::before` pseudo-element shifted `-10px` or `-15px` (top-right) creates the layered frame effect
- CTA button hover: sliding `::before` overlay with `left: -100%` → `left: 0` transition

---

## Do / Don't

### ✅ Do
- Use `var(--color-*)` and `var(--font-*)` CSS variables
- Maintain the 1320px container max-width
- Test responsive at 1024px and 768px breakpoints
- Ensure accessibility: contrast ratios, focus states, alt text on images
- Keep inline `<script>` at the bottom of the `<body>`

### ❌ Don't
- Hardcode hex colors — use variables
- Use px for font sizes
- Add `!important` except when intentionally overriding utility-style rules (see `.nav-cta`)
- Skip mobile testing
- Add hover/focus states only for desktop — mobile tap targets need adequate size too
- Forget `alt` text on images

---

## Skills Available

### n8n Skills (global `~/.claude/skills/`)
These are for other projects with n8n workflows — not used in this static site.

| Skill | Use When |
|-------|----------|
| `/n8n-code-javascript` | Writing JS in n8n Code nodes |
| `/n8n-code-python` | Writing Python in n8n Code nodes |
| `/n8n-expression-syntax` | Fixing n8n expression errors |
| `/n8n-mcp-tools-expert` | Using n8n MCP tools |
| `/n8n-node-configuration` | Configuring n8n nodes |
| `/n8n-validation-expert` | Interpreting n8n validation errors |
| `/n8n-workflow-patterns` | Designing n8n workflow architecture |

---

## Related Projects (Same Client)

The VC Coach client has multiple projects. See `PROJECT_OTHER/` for reference files from:
- **OAuth App** — Next.js 16 + Supabase + Google OAuth + n8n (production on Vercel)
- **Lovable Prototype** — Tailwind/shadcn/ui design prototype

The brand colors, fonts, and values are shared. This repo is the authoritative source for this site's styles — the other projects use different tech stacks and their CSS conventions don't apply here.
