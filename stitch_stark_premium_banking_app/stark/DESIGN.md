---
name: Stark
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c6c6c6'
  on-secondary: '#2f3131'
  secondary-container: '#484949'
  on-secondary-container: '#b8b8b8'
  tertiary: '#ffffff'
  on-tertiary: '#3c2f00'
  tertiary-container: '#ffe088'
  on-tertiary-container: '#7b6100'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#ffe088'
  tertiary-fixed-dim: '#e9c349'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.02em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-mobile: 24px
  container-padding-desktop: 40px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is defined by an ethos of "Elite Precision." It targets a high-net-worth demographic that values both technological advancement and quiet luxury. The visual language merges the sleekness of high-end aerospace engineering with the exclusivity of private banking.

The aesthetic utilizes **Glassmorphism** and **Minimalism**. It relies on high-quality materials—frosted glass, brushed silver, and polished obsidian—rather than traditional flat colors. The emotional response should be one of absolute security, futuristic capability, and understated wealth. Layouts are spacious, allowing content to breathe, while interactions are calibrated to feel weighted and deliberate.

## Colors

The palette is strictly nocturnal, anchored by a "Pure Black" base to maximize the contrast of glass effects and OLED displays. 

- **Primary (White/Silver):** Used for critical data points and primary actions. Silver is applied to secondary text and iconography to create a metallic sheen.
- **Elite Accent (Gold):** Reserved exclusively for high-tier status indicators, premium membership features, and "success" states that warrant a sense of reward.
- **Neutrals (Charcoal):** Deep charcoal functions as the primary surface color for containers, providing a softer alternative to the pure black background.
- **Gradients:** Use subtle linear gradients from top-left to bottom-right (e.g., `rgba(255,255,255,0.1)` to `rgba(255,255,255,0)`) to simulate light hitting glass edges.

## Typography

This design system utilizes **Inter** for its neutral, systematic, and high-tech feel. To evoke a premium editorial sense, tracking (letter-spacing) is increased slightly for body and label text.

- **Headlines:** Should be tight and impactful. Use semi-bold weights to establish clear hierarchy against the dark background.
- **Labels:** Always use the `label-caps` style for section headers and small metadata to maintain a disciplined, architectural look.
- **Numerical Data:** Given the fintech context, ensure all balance displays use the `display-lg` or `headline-lg` styles with tabular lining figures if available, ensuring numbers align perfectly in lists.

## Layout & Spacing

The layout philosophy is built on a **Fluid Grid** with generous safe areas. 

- **Mobile:** Uses a 4-column grid with 24px outer margins. This wide margin emphasizes the "premium" feel by intentionally sacrificing screen real estate for aesthetic breathing room.
- **Vertical Rhythm:** Spacing follows an 8px base unit. Component-to-component spacing should lean towards `stack-md` or `stack-lg` to avoid a "cluttered" bank app appearance.
- **Alignment:** Content is primarily left-aligned to maintain a clean vertical axis, though primary balances and hero figures may be centered for dramatic effect.

## Elevation & Depth

Hierarchy is communicated through **Tonal Layers** and **Backdrop Blurs**. Shadows are not black; they are ultra-diffused glows that mimic light refraction through glass.

1.  **Level 0 (Base):** Pure Black (#000000).
2.  **Level 1 (Cards/Surfaces):** Deep Charcoal (#121212) with a 1px subtle silver stroke (10% opacity) to define edges.
3.  **Level 2 (Modals/Overlays):** Semi-transparent white (`rgba(255,255,255,0.05)`) with a 20px - 40px backdrop blur (Gaussian). 
4.  **Shadows:** Use a "Silver Glow" for elevated elements: `0px 10px 30px rgba(192, 192, 192, 0.05)`. This creates a soft, metallic lift rather than a heavy shadow.

## Shapes

The shape language is defined by oversized, luxurious curves. 

- **Primary Containers:** Use `rounded-xl` (24px on mobile) for all cards and main UI shells. 
- **Interactive Elements:** Buttons and input fields follow a **Pill-shaped** (rounded-full) geometry to provide a friendly yet futuristic contrast to the structured grid.
- **Inner Elements:** Small elements like chips or badges should have a slightly reduced radius (12px) to maintain nested visual harmony.

## Components

- **Glass Cards:** The centerpiece of the UI. Features a subtle gradient stroke, backdrop blur, and a faint white inner glow at the top edge to simulate thickness.
- **Action Buttons:** Primary buttons are Solid White with Black text. Secondary buttons are "Ghost" style with a silver border.
- **Futuristic Charts:** Use thin, glowing lines (Silver or Gold). Avoid solid fills; instead, use vertical gradients that fade into the background.
- **Elite Status Indicators:** Elements denoting VIP levels use a thin, 1px Gold border and the `label-caps` typography style.
- **Input Fields:** Minimalist. A single bottom border in Silver (30% opacity) that brightens to 100% Gold or White on focus, with floating labels.
- **Micro-interactions:** All transitions should use a slow, "physically weighted" cubic-bezier easing (e.g., `0.2, 0.8, 0.2, 1`) to feel sophisticated and smooth.