# Claude Instructions: Revamp Lumin Lending Site

## Overview
Transform luminlendingheloc.com to match Figure.com's conversion-focused simplicity. The current site has too many sections, competing CTAs, and friction. This redesign fixes that.

---

## Files Delivered

1. **SITE_REDESIGN.md** — Complete design spec with copy, layout, and principles
2. **index.html** — Fully coded, production-ready HTML/CSS/JS
3. **CLAUDE_INSTRUCTIONS.md** — This file

---

## What Changed (Summary)

| Before | After |
|--------|-------|
| 10+ sections | 6 sections |
| Multiple competing CTAs | 2 clear CTAs (hero + footer) |
| "Calculators" section | Removed (leakage point) |
| Long FAQ on homepage | Collapsed to link |
| 6 stat boxes in hero | 1 line of social proof |
| "yourhome's" typo | Fixed: "your home's" |
| External link for rate check | Inline form (keeps user on page) |
| Block quote testimonials | Carousel with <15 word quotes |
| Generic "Modern technology" | Specific 4-step process |

---

## Key Conversion Principles Applied

1. **One Primary Action**: Every section drives to "Check My Rate"
2. **Reduce Clicks**: Inline form on hero, not a separate page
3. **Speed Signals**: "5 minutes" and "5 days" repeated
4. **Trust Early**: Stars and BBB above the fold
5. **No Distractions**: Removed calculator, long FAQ, extra stats
6. **Mobile First**: Responsive grid, full-width buttons on mobile

---

## Technical Implementation Notes

### HTML Structure
```html
[Announcement Bar]    <!-- Optional, dismissible -->
[Sticky Nav]          <!-- Logo, minimal links, CTA -->
[Hero]                <!-- Headline + Inline Form + Social Proof -->
[How It Works]        <!-- 4 steps, icon + number + 3 words -->
[Use Cases]           <!-- 5 categories, emoji icons -->
[Testimonials]        <!-- Carousel, 5 quotes, auto-rotate -->
[Final CTA]           <!-- One last push -->
[FAQ Link]            <!-- Collapsed, links to full page -->
[Footer]              <!-- Minimal, legal, links -->
```

### CSS
- Uses CSS custom properties (variables) for easy theming
- System font stack for speed
- Mobile-first responsive breakpoints
- No external dependencies

### JavaScript
- Simple testimonial carousel (auto-rotates every 5s)
- Dot navigation for manual control
- Can be enhanced with smooth transitions

---

## Customization Needed

### Before Deploying:

1. **Update Form Action**
   ```html
   <!-- Current: -->
   <form action="/account/heloc/register" method="GET">
   
   <!-- Update to your actual rate check endpoint -->
   ```

2. **Add NMLS Number**
   ```html
   <!-- In footer -->
   <a href="/licensing">NMLS #XXXXXX</a>
   ```

3. **Replace Emoji Icons** (optional)
   - Current: 🏠 💳 🏢 🎓 🚗
   - Better: Custom SVG icons or icon font

4. **Add Analytics Events**
   ```javascript
   // Track form starts
   form.addEventListener('submit', () => {
       gtag('event', 'rate_check_started');
   });
   ```

5. **Testimonial Rotation**
   - Currently cycles through 5 hardcoded quotes
   - Can be replaced with dynamic CMS content

6. **Announcement Bar**
   - Optional — remove if not needed
   - Can be made dismissible with cookie/localStorage

---

## A/B Test Ideas

Once live, test these variations:

| Test | Hypothesis |
|------|------------|
| "Unlock your home equity" vs "Get cash from your home" | Which resonates more? |
| Inline form vs. "Get Started" button | Does form reduce or increase friction? |
| 5 testimonials vs. 3 | Optimal carousel length? |
| Announcement bar vs. none | Does urgency help or distract? |
| "5 days" vs. "1 week" | Specificity vs. relatability |

---

## Performance Checklist

- [ ] Page load < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Mobile responsive (test on actual devices)
- [ ] Form validation working
- [ ] Analytics events firing
- [ ] Legal disclosures visible
- [ ] SSL certificate active
- [ ] Rate check flow tested end-to-end

---

## Questions?

Refer to SITE_REDESIGN.md for:
- Full copy specifications
- Color system
- Typography scale
- Spacing values
- Component details

Refer to index.html for:
- Working code
- Responsive behavior
- Interactive elements

---

## One-Line Summary

**Before**: Busy, confusing, many paths  
**After**: Simple, focused, one clear action  
**Result**: Higher conversion, happier users
