# Design System Document

## 1. Overview & Creative North Star: The Scholarly Monolith
This design system is built to transform a session management tool into a high-end editorial experience. We are moving away from the "gamified" aesthetic of typical tabletop tools and toward a **"Scholarly Monolith"**—an interface that feels like a heavy, iron-bound ledger found in a grand library.

The aesthetic is driven by **intentional asymmetry** and **tonal depth**. Rather than a standard grid, we use expansive margins and overlapping surfaces to create a sense of physical weight. The UI should never feel "flat" or "digital"; it should feel like layers of vellum and cold iron stacked with surgical precision.

---

## 2. Colors & Surface Architecture
The palette is rooted in the high-contrast tension between deep, cool charcoals and sharp, ink-like highlights.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Structural boundaries must be defined solely through background color shifts. A section should be distinguished by moving from `surface` (#121416) to `surface-container-low` (#1a1c1e). Boundaries are felt through tone, not drawn with lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to create "nested" depth:
* **Base Layer:** `surface` (#121416)
* **Secondary Content:** `surface-container-low` (#1a1c1e)
* **Interactive Cards/Modules:** `surface-container-highest` (#333537)
* **The "Glass & Gradient" Rule:** For floating elements (Modals, Popovers), use `surface-variant` (#333537) at 80% opacity with a `20px` backdrop-blur.

### Signature Textures
Main CTAs and Hero sections should utilize a subtle linear gradient transitioning from `primary` (#b5cad4) to `primary-container` (#20333b) at a 135-degree angle. This mimics the sheen of polished cobalt iron.

---

## 3. Typography: The Editorial Contrast
We pair the intellectual weight of a classic serif with the technical precision of a modern sans-serif.

* **The Hero (Newsreader):** Used for all `display` and `headline` roles. The high x-height and sharp serifs evoke the "Quill" feel. Headlines should use tighter letter-spacing (-0.02em) to appear authoritative.
* **The Engine (Manrope):** Used for `title`, `body`, and `label` roles. This provides the "Iron" stability. Use `body-md` (0.875rem) for the bulk of session notes to maintain a dense, scholarly information density.

**Hierarchy Usage:**
* **Display LG (3.5rem):** Reserved for Chapter titles or major campaign milestones.
* **Headline SM (1.5rem):** For NPC names or Location headers.
* **Label MD (0.75rem):** For metadata like "CR Rating" or "Spell Slot Level," always in Uppercase with 0.05em tracking.

---

## 4. Elevation & Depth
In this system, elevation is a matter of light and tone, not physical shadows.

* **The Layering Principle:** Stack tiers to create focus. A `surface-container-lowest` (#0c0e10) card sitting on a `surface-container` (#1e2022) background creates a "sunken" well effect, perfect for secondary log entries.
* **Ambient Shadows:** Floating elements (like a floating action button for "New Note") use a highly diffused shadow: `0 24px 48px -12px rgba(18, 20, 22, 0.5)`. The shadow color is a tinted version of the background, never pure black.
* **The Ghost Border Fallback:** If a divider is mandatory for accessibility, use the `outline-variant` (#43474a) at 15% opacity. High-contrast lines are considered "visual noise" and must be avoided.

---

## 5. Components & Primitive Styles

### Buttons
* **Primary:** Sharp 4px corners (`0.25rem`). Background: `primary` (#b5cad4). Text: `on-primary` (#20333b). No border.
* **Secondary (The Iron Variant):** Background: `surface-container-high`. Text: `primary`.
* **Tertiary:** Ghost style. `Manrope` Medium, Uppercase, 0.05em tracking.

### Input Fields
* **Style:** Avoid "box" inputs. Use a "Soft Well" style—background set to `surface-container-lowest` with a 4px bottom-weighted `surface-variant` accent.
* **Focus State:** The bottom accent shifts to `primary` (#b5cad4). No outer glow.

### Cards & Lists
* **The Rule of Space:** Forbid the use of divider lines. Use the **Spacing Scale `8` (1.75rem)** to separate list items.
* **Interactive Lists:** On hover, the background shifts from `surface` to `surface-container-low`.

### Specialized Components
* **The Ledger Card:** A tall, narrow container using `surface-container-highest` with `display-sm` Newsreader headers. Used for tracking Initiative or Party Gold.
* **The Ink-Bleed Progress Bar:** For HP or XP. The background is `surface-container-lowest` and the fill is a gradient of `primary` to `on-primary-container`, giving the impression of ink filling a groove in metal.

---

## 6. Do's and Don'ts

### Do
* **Do** embrace negative space. Large gutters (using Spacing `16` or `20`) make the tool feel like an expensive manuscript rather than a cluttered app.
* **Do** use asymmetrical layouts. Place a header on the left and utility text on the far right with a wide void between them.
* **Do** use `Newsreader` for any text that is "In-World" lore, and `Manrope` for all "System" mechanics.

### Don't
* **Don't** use standard rounding. Anything over `4px` (except for `full` pill-shapes for Chips) breaks the "Precision of the Quill" aesthetic.
* **Don't** use pure black (#000000). The deepest dark should be `surface-container-lowest` (#0c0e10) to maintain the cool, cobalt-iron tone.
* **Don't** use icons as the primary focus. Icons should be "Light Feathery Silver" (`tertiary` #c4c7c9) and secondary to the typography.