# DesignSkills — Marketing Ad Design Playbook

Reference for the **Design Strategist** and design-tree agents. Apply these rules when planning concepts and when specifying layout, colors, typography, and layers for social/static ads (1080-based frames).

---

## 0. User-provided content only (STRICT — highest priority)

**Only include elements that the user supplied in the brief form** (or uploaded assets). Do not invent extra marketing content.

### Include only when present in the brief

| Brief field / asset | Allowed in design |
|---------------------|-------------------|
| Product image | Hero product layer |
| Title | Headline (exact copy) |
| Tagline | Tagline layer (exact copy) |
| Sale / offer price | Price / was–now text |
| Discount | Badge or offer text |
| Star rating | Rating node |
| Logo | Logo layer |
| Merchant info | Merchant line (exact copy) |
| Product page URL | Do not show raw URL unless user asked; use for research only |
| Reference ad | Style reference only — do not copy third-party logos or claims |
| Audience / category / language | Inform layout and tone — not new copy blocks |

### Do NOT add without permission

Unless the user explicitly requests it in **Custom design direction**, do **not** add:

- Invented headlines, subheads, or rewritten product titles
- Fake reviews, star counts, “#1 seller”, “bestseller”, awards, or social proof
- Scarcity / urgency lines (“24h only”, “Selling fast”) unless in brief or custom direction
- Extra CTAs, secondary buttons, or legal/disclaimer lines the user did not provide
- Made-up prices, discounts, or percentages
- Competitor names, certifications, or claims not in the brief

**Decorative layout is allowed** (backgrounds, gradients, shapes, shadows) as long as it does not introduce **new factual copy** the user did not supply.

### Custom design direction

The field **Custom design direction** is the **only** place where the user may authorize extra elements (e.g. “add a limited-time badge”, “include free-shipping callout”, “use urgency CTA”). Treat that text as an explicit allow-list for additions beyond the form fields.

### When the agent wants to add something

If you believe an extra element would improve the ad (badge, urgency, social proof, alternate headline), **ask the user first** in the orchestrator chat — e.g. “Should I add a limited-time badge?” — and **wait for confirmation**. Never add it silently on the first generation pass.

### Copy fidelity

- Use the user’s **exact** title, tagline, prices, discount, rating, and merchant text — no paraphrasing or “improved” marketing rewrites.
- If a field is empty, **omit** that layer; do not fill with placeholder marketing copy (except a generic CTA label like “Shop Now” only when a CTA button exists but label was left blank by the model — pipeline may normalize that).

---

## 1. What makes an ad “work”

An effective performance ad is read in **under 1.5 seconds** on mobile:

| Order | Viewer sees | Design job |
|-------|-------------|------------|
| 1 | Hook (headline or offer) | Stop scroll — contrast, size, placement |
| 2 | Product / proof | Trust + desire — hero size, no crop |
| 3 | Reason to act (CTA / price) | Clear next step — one button, one phrase |

**One primary goal per ad:** sell product, announce discount, or build brand — not all three equally.

---

## 2. Layout archetypes (reference library — pick what fits this product)

Use these as **inspiration**, not a fixed menu. For each campaign, choose **4 approaches that fit the product, audience, and brief** — avoid repeating the same four layouts (e.g. hero-center + split + minimal + promo) on every job.

### A. Hero center
- Product **42–55%** of frame, vertically centered or slightly below optical center.
- Headline **top third**; CTA **bottom 12–18%**.
- Best for: single SKU, pack shots, beauty, electronics.

### B. Split (product | copy)
- **50/50 or 55/45** vertical or horizontal split.
- Product on one side (often right for LTR), copy block on other.
- Best for: fashion, lifestyle, specs + image.

### C. Minimal premium
- **40%+ negative space**; small logo; restrained palette (2 colors + white).
- Product **30–40%**; large serif or condensed headline.
- Best for: luxury, D2C premium, new launches.

### D. Promo / offer-first
- **Badge or price** largest secondary element (top-right or top-left).
- Urgency CTA: “Shop now”, “Limited time”.
- High saturation accent on neutral base.
- Best for: FMCG, flash sales, seasonal.

### E. Story vertical (9:16)
- **Stack:** headline → product → benefit line → CTA (thumb zone bottom).
- Avoid floating elements in bottom **250px** (UI overlays).

### F. Editorial
- Oversized **display type** (partial bleed OK).
- Product **lower third**; asymmetric grid.

---

## 3. Grid, safe zones, and positioning

- **8px grid** for all `x`, `y`, `width`, `height`.
- **Safe margin:** ~5.9% of min(width, height) — e.g. **64px on 1080×1080**.
- **Optical center** is slightly above geometric center — place product 2–5% higher than math center for “grounded” feel.
- **Rule of thirds:** place product on intersection; headline on opposing third.
- **Z-pattern (LTR):** logo top-left → headline → product → CTA bottom-right. Good for landscape.
- **F-pattern:** headline full width top, product center-left, CTA bottom. Good for feed skimming.

**Do not:**
- Overlap headline bounding box with product bounding box (min **24px** gap).
- Place CTA under system UI safe areas on Stories/Reels.
- Crop product with `objectFit: cover` — always **`contain`** for user product assets.

---

## 4. Layer stack (zIndex)

Back to front — assign explicit `zIndex`:

| zIndex | Layer | Notes |
|--------|--------|--------|
| 0–2 | Canvas + background shapes | Gradients, soft blobs, color fields |
| 3–8 | Decorative | Lines, patterns, secondary shapes |
| 9 | Product shadow | Soft ellipse, 8–15% black, offset +12px Y |
| 10–12 | **Product hero** | Largest raster; `objectFit: contain` |
| 13–18 | Supporting rasters | Badges as image if complex |
| 20–25 | **Text** | Headline, tagline, price |
| 26–28 | **CTA button** | Highest-contrast interactive shape |
| 30+ | **Logo** | Small; corner; never compete with CTA |

**Tip:** Separate photographic product from text — never bake offer text into product crop.

---

## 5. Color theory for ads

### 60-30-10 rule
- **60%** dominant (background / large shape)
- **30%** secondary (product area surround, panels)
- **10%** accent (CTA, badge, key word)

### Palette types
| Type | Use | Example |
|------|-----|---------|
| **Complementary** | High energy, sale | Blue + orange |
| **Analogous** | Harmony, beauty, food | Terracotta + ochre + cream |
| **Triadic** | Playful, youth | Blue + yellow + red (one muted) |
| **Monochrome + accent** | Premium | Charcoal + white + gold CTA |

### Contrast & readability
- Body text on solid: **≥ 4.5:1** contrast ratio.
- Large headline (≥24px bold): **≥ 3:1**.
- CTA button: fill vs label **≥ 4.5:1**; button vs background **≥ 3:1**.
- Avoid **red/green only** for critical info (color-blind users).

### Category moods (starting points)
- **FMCG / grocery:** warm reds, yellows, white; high saturation.
- **Beauty:** blush, mauve, cream, gold accents.
- **Tech:** navy, charcoal, electric blue or neon accent.
- **Food:** appetizing warm tones; green only for “fresh/organic”.
- **Finance:** blue, grey, white; sparing accent.

### Background vs product
- Busy product packaging → **simple flat or soft gradient** background.
- Plain product shot → background may carry brand texture or lifestyle color field.
- Always validate **logo-to-background contrast** separately from product contrast.
- If logo is white/light, place it on a dark chip/pill/panel or darker corner patch; never on near-white background.
- If logo is dark, avoid dark corners; use a light backing patch behind logo.
- Ensure logo area keeps at least **3:1** contrast against immediate background.

---

## 6. Typography

### Hierarchy (max 3 levels visible)
1. **Headline** — 40–56px @ 1080 width (scale down for 4:5 / up for 9:16 width).
2. **Subline / tagline** — 55–65% of headline size.
3. **CTA** — 16–22px bold or button with 18–24px label.

### Font pairing (use exact families in trees)
- **Impact / promo:** `Barlow Condensed` bold — headlines, CTA.
- **Readable body:** `Inter` — taglines, legal, secondary.
- Do not mix more than **2 families** per ad.

### Copy rules
- Headline **≤ 40 characters** (feed); **≤ 6 words** ideal.
- CTA **2–4 words**: “Shop now”, “Get offer”, “See details”.
- Avoid ALL CAPS beyond 3–4 words.
- **No double quotes** inside JSON text fields.

---

## 7. Product hero treatment

- Product occupies **40–55%** of frame area (width × height box, not file pixels).
- **`objectFit: contain`** always; transparent PNG preferred.
- Optional **soft shadow** ellipse under product (zIndex 9).
- Trim transparent padding on assets when possible.
- **Angle:** slight rotation only if brand allows (±5°); default upright.
- Show **full product** — never cut off lid, sole, or cap.

---

## 8. CTA design

- **One primary CTA** per ad.
- Min size **200×48px** @ 1080; full-width pill OK on Stories.
- Position: **bottom center** or **bottom-right** inside safe zone.
- Shape: rounded rect `borderRadius` 8–24px or pill (height/2).
- Color: accent from 10% palette; white or black text for contrast.
- Surround with **whitespace** — no competing badges touching CTA.

---

## 9. Logo, badges, price

| Element | Placement | Size guide |
|---------|-----------|------------|
| Logo | Top-left or top-right | ≤ 140×80px |
| Offer badge | Top-right or near headline | 15–20% frame width — **only if user provided discount/offer** |
| Price / was-now | Near product or badge | **Only if user provided sale/offer price** |
| Rating | Near headline or product | **Only if user provided star rating** |
| Merchant info | Small tertiary line | **Only if user provided merchant info** |
| Legal / disclaimer | Bottom edge, 10–12px | **Only if user provided text or custom direction requests it** |

### Logo contrast (required)
- Analyze logo artwork luminance **and** placement background luminance separately.
- **White/light logo on dark backgrounds** — never place a dark logo directly on navy/black without a light pill, plate, or frosted patch behind it.
- **Dark logo on light backgrounds** — avoid white logo on white/cream panels.
- Minimum **3:1 contrast** between logo and its immediate background (4.5:1 preferred).
- When in doubt, add a rounded rect `logo_backing` at 88–94% opacity white behind the logo mark only.

---

## 10. Visual attraction “tricks”

1. **Vignette / edge darkening** — draws eye to center (subtle shape, low opacity).
2. **Directional lighting** — gradient background lighter behind product.
3. **Framing shapes** — arch, circle, or angled panel behind hero.
4. **Color pop** — desaturate background 10–20%, keep product full saturation.
5. **Social proof** — only if user provided rating or custom direction requests it (never invent “#1” or reviews).
6. **Scarcity** — only if user or custom direction explicitly requests urgency copy.
7. **Motion-ready** (video later) — keep key elements in center 80% for crop.

---

## 11. Platform format notes

| Format | Ratio | Design shift |
|--------|-------|----------------|
| Feed square | 1:1 | Balanced center hero |
| Feed portrait | 4:5 | More vertical stack; taller headline |
| Story / Reels | 9:16 | Stack top→bottom; CTA in lower third above thumb |
| Landscape | 16:9 | Split layout; headline left, product right |

Always set frame `width`/`height` to target format before placing nodes.

---

## 12. Strategy output checklist (Design Strategist)

For each of **4 concepts**, specify in JSON (tailored to this brief — not a copy-paste quartet):

- `layoutApproach` — specific layout description for this product (may borrow from §2 but must differ job-to-job)
- `colorMood` — palette type + 2–3 hex hints
- `messagingAngle` — tied to analysis (pain, aspiration, offer, social proof)
- `keyElements` — ordered layer list with roles
- `expectedPerformance` — high = proven pattern; experimental = bold layout

**Summary markdown** must explain *why* these four differ and *who* each speaks to.

---

## 13. Design tree handoff (for Design Creator)

When enriching layout plans into trees:

- **8–14 children** — no full-frame single image.
- Integer pixels only; **roles** on every node.
- Product `id: "product"`, `src: "assets/product.png"`.
- Headline `role: "headline"`, `textAlign: "center"` unless split layout.
- Shapes for backgrounds — `gradientFrom` / `gradientTo` preferred over busy patterns.
- Verify **no text-product overlap** and **no text-on-text overlap** before output.
- Every `button` node must have visible CTA text — never output empty CTA shapes.
- Do not place full-height decorative stripes through the product bbox.

---

## 14. Common mistakes to avoid

- Too many fonts, colors, or messages.
- Headline same size as tagline (no hierarchy).
- CTA same color as background.
- Product too small (<35% frame) or cropped.
- Decorative shapes behind text with insufficient contrast.
- Logo larger than CTA.
- Inventing copy, badges, or social proof not in the user brief (see §0).
- Copy pasted from packaging onto layout when user already supplied a title/tagline.

---

*End of DesignSkills playbook — apply on every strategy and design generation run.*
