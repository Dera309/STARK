# Design System Strategy: The Sovereign Architectural Interface

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Vault."** 

Moving away from the cluttered, line-heavy interfaces of traditional banking, this system adopts an "Architectural Editorial" approach. We treat the user interface not as a series of boxes, but as a prestigious physical space. It balances the heavy, authoritative presence of deep navy tones with the precise, illuminating touch of gold accents. 

To achieve a "High-End" feel, we break the standard web template by utilizing **intentional asymmetry** and **tonal depth**. Rather than using borders to contain data, we use expansive white space and subtle shifts in surface color to guide the eye. This creates a sense of "Quiet Luxury"—where the interface feels expensive, secure, and custom-tailored to the elite user.

---

## 2. Colors: Depth Over Definition
Our palette is rooted in the `primary-container` (#0d1c32) for authority and `secondary` (#775a19) for prosperity.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. Structural definition must be achieved through:
*   **Background Shifts:** Distinguish a sidebar from a main feed by placing a `surface-container-low` (#f3f4f5) panel against a `surface` (#f8f9fa) background.
*   **Tonal Transitions:** Use vertical white space and color blocking to imply boundaries.

### Surface Hierarchy & Nesting
Think of the UI as layers of fine paper.
*   **Base:** `surface` (#f8f9fa)
*   **Sectioning:** `surface-container` (#edeeef)
*   **Interactive Cards:** `surface-container-lowest` (#ffffff) sitting atop a `surface-container-low` section creates a natural "pop" without a single line of CSS border.

### The "Glass & Gradient" Rule
To elevate the "STARK" brand, use Glassmorphism for floating navigation or modal overlays. 
*   **Formula:** `surface` at 70% opacity + `backdrop-filter: blur(20px)`.
*   **Signature Textures:** Apply a subtle linear gradient from `primary` (#000000) to `primary-container` (#0d1c32) on hero cards to give financial data a sense of weight and "soul."

---

## 3. Typography: The Sharp Edge of Data
We use a dual-font system to balance corporate authority with modern legibility.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision. Use `display-lg` (3.5rem) with tightened letter-spacing (-0.02em) for high-impact balance statements. This font communicates modern stability.
*   **Body & Labels (Inter):** The industry standard for clarity. Inter is used for all "hard" financial data (`body-md`, `label-md`). Its high x-height ensures that even at `body-sm` (0.75rem), transaction details remain hyper-legible.
*   **Hierarchy Note:** Use `secondary` (#775a19) sparingly for `title-sm` labels to highlight "Growth" or "Premium" features, creating an editorial focal point.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often "muddy." In this system, we use light and tone.

*   **The Layering Principle:** Place a `surface-container-highest` (#e1e3e4) element inside a `surface-container-low` (#f3f4f5) to indicate a nested, clickable area.
*   **Ambient Shadows:** If an element must float (like a FAB or a Modal), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(13, 28, 50, 0.06);`. Notice we use a tint of our Navy (`primary-container`), not black, to keep the shadow feeling natural and integrated.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., in high-contrast modes), use `outline-variant` (#c5c6cd) at 15% opacity. It should be felt, not seen.

---

## 5. Components: Precision Primitives

### Buttons (The "Jewel" Strategy)
*   **Primary:** Background: `primary` (#000000), Text: `on-primary` (#ffffff). Shape: `md` (0.375rem).
*   **Secondary (The Gold Standard):** Background: `secondary` (#775a19), Text: `on-secondary` (#ffffff). Use this only for "Wealth" related actions (Invest, Upgrade).
*   **Tertiary:** No background. Text: `primary`. Transition: Shift background to `surface-variant` on hover.

### Inputs & Fields
*   **Styling:** Forbid 100% borders. Use a `surface-container-high` (#e7e8e9) fill with a 2px `primary` bottom-border that animates out from the center on focus.
*   **Error States:** Use `error` (#ba1a1a) for the "Ghost Border" and `on-error-container` (#93000a) for the helper text.

### Cards & Financial Lists
*   **Strict Rule:** No dividers (`<hr>`). 
*   **Execution:** Group transactions by date. Each group sits on a `surface-container-lowest` card. Separate individual line items with 16px of vertical white space. Use `title-md` for the amount and `body-sm` with `on-surface-variant` (#44474d) for the merchant name.

### Specialized Component: The "Wealth Meter"
*   A custom progress bar using a gradient of `secondary_fixed_dim` (#e9c176) to `secondary` (#775a19) to visualize savings goals against a `surface-dim` background.

---

## 6. Do's and Don'ts

### Do
*   **DO** use `xl` (0.75rem) roundedness for large containers to soften the "Corporate" edge.
*   **DO** use `surface-bright` (#f8f9fa) to create high-contrast "moments" for critical alerts.
*   **DO** align financial decimals. Use tabular-nums in CSS for all price data.

### Don't
*   **DON'T** use pure black (#000000) for body text; use `on-surface` (#191c1d) to reduce eye strain.
*   **DON'T** use 1px solid dividers to separate list items. Use white space.
*   **DON'T** use "Standard Blue" for links. Use the `secondary` gold for a custom, branded feel.
*   **DON'T** over-round components. Avoid the `full` (9999px) radius except for small chips; it feels too "playful" for a high-trust banking environment. Use `md` and `lg` for most elements.