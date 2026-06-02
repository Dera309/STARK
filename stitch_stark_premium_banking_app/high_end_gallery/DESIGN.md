---
name: High-End Gallery
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4d4635'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#7f7663'
  outline-variant: '#d0c5af'
  surface-tint: '#735c00'
  primary: '#735c00'
  on-primary: '#ffffff'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#e9c349'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#5d5f5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#b2b3b3'
  on-tertiary-container: '#434546'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
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
  container-padding-desktop: 64px
  gutter: 24px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system for the STARK premium banking app is built upon the "High-End Gallery" aesthetic—a philosophy that treats financial data as curated art. The brand personality is one of quiet confidence, exclusivity, and absolute precision. It is designed for high-net-worth individuals who value clarity over clutter and sophistication over spectacle.

The style is a fusion of **Ultra-Minimalism** and **Modern Luxury**. It utilizes expansive white space (the "gallery wall") to allow the typography and gold accents to command attention. The user experience should evoke the feeling of walking through a private exhibition: serene, spacious, and meticulously organized. Visual noise is eliminated in favor of hairline-thin strokes and soft, atmospheric depth.

## Colors

The palette is restricted to a prestigious, high-contrast selection that ensures every element feels intentional.

- **Surface (Primary):** Pure White (#FFFFFF) is used for the main background and elevated cards to maximize light reflection and "air."
- **Surface (Secondary):** Soft Alabaster (#F8F8F8) provides subtle grounding for recessed areas, such as background tracks or secondary content blocks.
- **Typography:** Deep Onyx (#131313) is used for all text to ensure maximum legibility and a sharp, ink-on-paper feel.
- **Accents:** STARK Gold (#D4AF37) is reserved strictly for primary actions, success states, and critical highlights. It is the "gold leaf" on the gallery frame—used sparingly to maintain its premium status.

## Typography

This design system employs a sophisticated typographic pairing to balance heritage and modernity. 

**Libre Caslon Text** is used for headlines and currency displays, providing a traditional, authoritative, and literary tone. Its high-contrast strokes evoke the feeling of premium financial documents.

**Hanken Grotesk** serves as the functional workhorse for body text and labels. Its sharp, contemporary geometry ensures clarity in data-dense areas while remaining warm and professional.

**Key Rule:** Use uppercase with increased letter spacing for all labels and small headers to create an architectural, structured appearance.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop (centering content for a focused, "curated" view) and a fluid model on mobile. 

- **Breathing Room:** The design system prioritizes "white space as a feature." Margins are generous (minimum 24px on mobile) to prevent the UI from feeling cramped.
- **Rhythm:** All spacing is based on an 8px base unit. Vertical stacks use large gaps (48px+) between major sections to clearly delineate content without the need for heavy dividers.
- **Alignment:** Content is primarily left-aligned to mirror editorial layouts, though currency and primary CTA buttons may be centered for dramatic emphasis.

## Elevation & Depth

Depth is conveyed through a combination of **Natural Sunlight Shadows** and **Hairline Borders**.

1.  **Hairline Borders:** Surfaces use a 0.5px or 1px border in a very light grey (or 10% opacity Onyx) to define boundaries without adding visual weight.
2.  **Ambient Depth:** Elevated elements like cards use "expansive" shadows—very large blur radii (30px-60px) with extremely low opacity (2-4%). The goal is a subtle lift that mimics a soft light source from directly above.
3.  **Flat Hierarchy:** Background elements sit on Alabaster (#F8F8F8), while interactive modules sit on pure White (#FFFFFF) with an ambient shadow to signal "interactability."

## Shapes

The shape language is a study in soft precision. 

- **Buttons & Chips:** Use a full pill-shape (maximal rounding). This creates a tactile, approachable contrast to the sharp typography.
- **Cards & Containers:** Use `rounded-xl` (1.5rem / 24px) to ensure edges feel organic and "smooth-to-the-touch." 
- **Icons:** Use thin, 1.5pt strokes with slightly rounded caps to match the Hanken Grotesk weight.

## Components

- **Buttons:** Primary buttons are pill-shaped, filled with STARK Gold (#D4AF37) with Onyx text. Secondary buttons are outlined with a 1px Onyx hairline.
- **Input Fields:** Floating labels in Hanken Grotesk. The field itself is a simple hairline bottom-border that glows Gold when focused. No heavy box containers.
- **Cards:** White surfaces with a hairline border and a large, soft ambient shadow. Content inside cards should have generous internal padding (min 24px).
- **Chips/Tags:** Small pill-shaped elements in Soft Alabaster with centered uppercase labels.
- **Lists:** Clean rows separated by a full-width hairline divider. No icons on the left unless essential for identification; chevron-right indicators should be thin and subtle.
- **Navigation:** A minimal bottom bar on mobile with thin-stroke icons. On desktop, a spacious top-aligned navigation with significant tracking between items.