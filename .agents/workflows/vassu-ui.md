---
description: Vassu InfoTech Neo-Minimalism UI Design System (Apple Music Style)
---
# Vassu InfoTech Proprietary UI Guidelines

When asked to "use the Vassu UI", "design like Apple Music", or "follow Vassu InfoTech's design system", ALWAYS strictly adhere to the following CSS and React architectural patterns to maintain a unified, premium, Neo-Minimalism dark interface.

## 1. Core Color Palette
Use global CSS variables configured as:
- **Backgrounds**: 
  - `--bg-dark: #000000` (Pitch black base, true minimalism)
  - `--bg-card: #1c1c1e` (Dark zinc/grey for elevated panels)
  - `--bg-card-hover: #2c2c2e`
- **Text**: 
  - `--text-main: #ffffff` (Pure white for high contrast headings/content)
  - `--text-muted: #8e8e93` (Classic Apple subtle grey, strictly use for subtitles, labels, and secondary details)
- **Accents**: 
  - `--primary: #fa243c` (Vibrant pinkish-red default accent, similar to Apple Music / premium tech brands)
  - Colors for success/danger should be vivid but slightly muted opacities for their backgrounds: `rgba(255, 36, 60, 0.2)`

## 2. Typography Rules
- **Font**: Use `'Inter', -apple-system, BlinkMacSystemFont`. No default serif fonts.
- **Letter Spacing**: Add `letter-spacing: -0.01em` or `-0.02em` on headings to create a dense, premium look.
- **Micro-sizing**: Primary text size is standard, but labels and table headers should be very tiny (`0.7rem` to `0.85rem`), uppercase, with wide letter spacing (`letter-spacing: 0.05em`) and strictly `--text-muted` color.

## 3. Structural & Component Rules (The "Apple Music" Vibe)
- **Zero Borders**: NEVER use bright or solid CSS borders around main panels. Use `border: none` or an extremely subtle 5% white border (`border: 1px solid rgba(255, 255, 255, 0.05)`). Rely on the color block differences (`#000000` vs `#1c1c1e`) to define the structure.
- **Breathing Space**: Add high padding (`24px`, `32px`, `40px`). Let elements breathe. Avoid cramping.
- **Glassmorphism**: Use translucent blurs heavily for headers and floating elements: `background: rgba(0,0,0,0.65); backdrop-filter: blur(20px);`.
- **Buttons**: Pill-shaped defaults. `border-radius: 9999px;` no borders, text-centered. Only primary buttons get background color, secondary buttons get `rgba(255, 255, 255, 0.1)`.
- **Inputs**: Inputs should not look like boxes with outlines. Use soft pill or slightly rounded rectangle backgrounds (`rgba(255, 255, 255, 0.08)`) with `border: none`.

Do NOT deviate from this styling, do NOT add random bright colored borders or backgrounds unless specifically requested. True Neo-minimalism lies in pitch blacks, high-contrast whites, and one single aggressive accent color.
