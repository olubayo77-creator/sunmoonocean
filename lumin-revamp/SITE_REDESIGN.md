# Lumin Lending Site Revamp — Complete Design Spec

## Goal
Transform luminlendingheloc.com into a high-converting, Figure.com-style experience. Ruthless simplicity. One clear action. Minimal cognitive load.

---

## 1. HERO SECTION (Above the Fold)

### Layout
- Full-width, centered content
- Generous padding (120px top, 80px bottom)
- Light background (#FFFFFF or very light gray #F8F9FA)
- Single column, max-width 720px centered

### Copy

**Headline (H1)**
```
Unlock your home equity in 5 days
```
*Note: Was "Unlock yourhome's equity.In minutes." — fixed spacing and clarity*

**Subheadline**
```
Check your rate in 5 minutes with no impact to your credit score.
```

**Social Proof Bar (below subheadline)**
```
⭐ 4.97 · 1,200+ reviews  ·  A+ BBB Rating  ·  $22B+ unlocked
```
*Inline, subtle, builds trust without clutter*

### Rate Check Form (Inline — Critical!)

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
│ Home Value      │ │ Mortgage Balance│ │  [Check My Rate →]  │
│ $500,000        │ │ $300,000        │ │                     │
└─────────────────┘ └─────────────────┘ └─────────────────────┘
                    ↑ Primary CTA — dark navy or black
```

**Form Fields:**
- Home Value (currency input, placeholder: "$500,000")
- Mortgage Balance (currency input, placeholder: "$300,000")
- Submit button: "Check My Rate →"

**Behavior:**
- On submit → scroll to or open rate check flow
- Keep user on same page (modal or inline expansion)
- Do NOT redirect to external URL immediately

---

## 2. HOW IT WORKS SECTION

### Layout
- 4 columns on desktop, 2x2 on tablet, stack on mobile
- Icon + number + 3-word title + 1-line description
- Light gray background (#F5F5F5) or white

### Copy

**Section Title:** "How it works"

**Steps:**

| Step | Icon | Title | Description |
|------|------|-------|-------------|
| 01 | 📋 or custom SVG | Check your rate | Soft credit pull. No impact. |
| 02 | 🔐 or custom SVG | Connect & verify | Link your bank. E-sign online. |
| 03 | ✍️ or custom SVG | Notarize remotely | Video call. No office visit. |
| 04 | 💰 or custom SVG | Get funded | Money in as few as 5 days. |

**Visual Style:**
- Large numbers (01, 02, 03, 04) — light gray, 48px
- Icons: 32px, navy/black color
- Titles: 18px, semibold
- Descriptions: 14px, gray (#666)

---

## 3. WHAT YOU CAN DO SECTION

### Layout
- 5-column grid on desktop
- Each item: icon + label
- No descriptions — just visual categories

### Copy

**Section Title:** "Use your equity for"

**Categories:**
- 🏠 Home improvement
- 💳 Debt consolidation
- 🏢 Small business
- 🎓 Education
- 🚗 Major purchases

**Visual Style:**
- Circular icon backgrounds (light tint)
- Labels below, 14px
- Subtle hover state

---

## 4. SOCIAL PROOF / TESTIMONIALS

### Layout
- Horizontal carousel (auto-rotate, manual arrows)
- One quote visible at a time
- Centered, max-width 600px

### Copy

**Section Title:** "What homeowners say"

**Quotes (rotate these 5):**

1. ⭐⭐⭐⭐⭐ "Had funds before my credit union called me back." — Marcus T., Denver · Renovation

2. ⭐⭐⭐⭐⭐ "Consolidated four cards into one payment. Cut monthly outflow in half." — Priya K., Austin · Consolidation

3. ⭐⭐⭐⭐⭐ "Every question answered same day. Digital notarization was impressive." — David & Rose L., Tampa · Remodel

4. ⭐⭐⭐⭐⭐ "Applied Sunday night. Money in my account Thursday morning." — Jennifer M., Phoenix · Debt consolidation

5. ⭐⭐⭐⭐⭐ "No appraisal needed. No paperwork chase. Just... done." — Robert K., Seattle · Home improvement

**Visual Style:**
- Large stars (24px, gold/orange)
- Quote in 20px, medium weight
- Name/location in 14px gray
- Use case tag (pill/badge style)

---

## 5. FINAL CTA SECTION

### Layout
- Full-width, slightly different background (light tint or same white)
- Centered content
- Same form as hero OR simple button if form already shown

### Copy

**Headline:** "Ready to unlock your equity?"

**Subheadline:** "Join 253,000+ homeowners who chose the faster way."

**CTA:** [Check My Rate — 5 Minutes, No Credit Impact]

---

## 6. FOOTER

### Copy (Minimal)

```
Lumin Lending LLC

[About] [Contact] [FAQ] [Privacy] [Terms] [NMLS #XXXXXX]

© 2026 Lumin Lending. Equal Opportunity Lender.
```

**Required Legal:**
- NMLS ID
- Equal Housing Lender logo
- State licensing links

---

## 7. NAVIGATION (Sticky Header)

### Layout
- Fixed top, white background, subtle shadow on scroll
- Logo left, minimal links center/right

### Copy

**Left:** Lumin Lending (logo text or SVG)

**Center (optional, hidden on mobile):**
- How it Works
- Reviews
- FAQ

**Right:** [Check My Rate]

**Mobile:** Hamburger menu, same links + CTA inside

---

## 8. ANNOUNCEMENT BAR (Optional)

### Copy
```
New HELOC rates live today. Close in as few as 5 days. [Check Rates →]
```

**Style:**
- Full-width, top of page
- Dark background (navy #1a1a2e or black)
- White text
- Dismissible (X button)

---

## VISUAL DESIGN SYSTEM

### Colors
| Role | Color | Hex |
|------|-------|-----|
| Primary (CTAs) | Deep Navy | #0f172a or #1a1a2e |
| Primary Hover | Darker Navy | #020617 |
| Text Primary | Near Black | #111827 |
| Text Secondary | Gray | #6b7280 |
| Background | White | #ffffff |
| Background Alt | Light Gray | #f8f9fa |
| Accent (stars) | Gold | #f59e0b |
| Success/Green | Emerald | #10b981 |

### Typography
| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 Hero | System/Sans | 48px | 700 |
| H2 Section | System/Sans | 32px | 600 |
| Body | System/Sans | 16px | 400 |
| Small | System/Sans | 14px | 400 |
| Caption | System/Sans | 12px | 400 |

*Use system font stack for speed: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif*

### Spacing
- Section padding: 80px vertical (desktop), 48px (mobile)
- Container max-width: 1200px
- Content max-width: 720px (for readable lines)
- Grid gap: 24px

### Buttons
```css
/* Primary CTA */
background: #0f172a;
color: white;
padding: 16px 32px;
border-radius: 6px;
font-weight: 500;
font-size: 16px;
transition: background 0.2s;

/* Hover */
background: #020617;

/* With arrow */
content: " →";
```

### Form Inputs
```css
border: 1px solid #d1d5db;
border-radius: 6px;
padding: 12px 16px;
font-size: 16px;
width: 100%;

/* Focus */
border-color: #0f172a;
outline: 2px solid rgba(15, 23, 42, 0.1);
```

---

## CRITICAL CONVERSION PRINCIPLES

1. **One Primary Action:** Every section drives to "Check My Rate"
2. **Reduce Clicks:** Inline form on hero, not a separate page
3. **Speed Signals:** Repeat "5 minutes" and "5 days" everywhere
4. **Trust Early:** Stars and BBB above the fold
5. **No Distractions:** Remove calculator from hero path
6. **Mobile First:** 60%+ traffic is mobile — test there

---

## WHAT TO REMOVE (Current Site)

- ❌ "Calculators" section from above fold
- ❌ 6 stat boxes (consolidate to 1 line)
- ❌ Long FAQ on homepage (link to page)
- ❌ "30+ yrs Lending Expertise" (weak signal)
- ❌ Multiple competing CTAs
- ❌ "The Lumin HELOC" feature block (redundant)

---

## PAGE STRUCTURE (Final)

```
[Announcement Bar — optional]
[Sticky Nav]
[Hero — Headline + Form + Social Proof]
[How It Works — 4 steps]
[What You Can Do — 5 use cases]
[Testimonials — carousel]
[Final CTA]
[Footer]
```

**Total sections: 6** (vs current ~10)
**Estimated scroll depth: 4-5 screens** (vs current 8+)
**Primary CTAs: 2** (vs current 5+)

---

## IMPLEMENTATION NOTES FOR CLAUDE

1. Use semantic HTML (section, nav, main, footer)
2. Ensure form is accessible (labels, aria)
3. Lazy load testimonial carousel
4. Mobile: Stack everything, full-width buttons
5. Test form validation and error states
6. Add analytics events on form start, submit
7. Keep page load