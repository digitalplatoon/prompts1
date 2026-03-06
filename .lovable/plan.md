

# Fix Guide Implementation Plan

## Audit: What's Already Done vs. What Needs Fixing

After comparing the uploaded Fix Guide against the actual codebase, here's what's already implemented and what still needs work:

| # | Fix | Status | Action Needed |
|---|-----|--------|---------------|
| 1 | `/submit` page (404) | **Already exists** at `/submit-prompt` | Fix footer link from `/submit` to `/submit-prompt` |
| 2 | Categories duplicate cards | **Bug confirmed** | Categories.tsx renders both inline card content AND a `<CategoryCard>` component per category — producing duplicates |
| 3 | OG tags + JSON-LD | **Already implemented** | SEO component already has OG, Twitter, canonical, and structured data. No changes needed. |
| 4 | Seed 64 real prompts | **Needs doing** | Database currently has few prompts. Need to insert seed data via database tool. |
| 5 | Stripe Buy Now flow | **Already implemented** | `create-prompt-checkout`, `verify-prompt-payment` edge functions exist. Purchase flow works. No changes needed. |
| 6 | Pricing in nav + auth tab fix | **Partially done** | Pricing NOT in navbar. Auth page doesn't read `?tab=signup`. Copyright says 2024. |
| 7 | Skeleton loading UI | **Already implemented** | Browse, Categories, PromptDetail all use Skeleton components. No changes needed. |
| 8 | Sitemap slugs + copyright + polish | **Partially done** | Sitemap still uses legacy IDs. Copyright says 2024. |

## Actual Changes Required

### 1. Fix Footer `/submit` Link
**File:** `src/components/Footer.tsx` line 11
- Change `path: '/submit'` to `path: '/submit-prompt'`

### 2. Fix Categories Duplicate Card Bug
**File:** `src/pages/Categories.tsx`
- The bug: lines 46-57 render card content (icon, name, count) inline AND then render `<CategoryCard>` which duplicates the icon/name/explore button
- Fix: Remove the inline rendering and use only `<CategoryCard>` with `promptCount` prop, OR remove `<CategoryCard>` and keep the inline version with an explore link
- Recommended: Keep only `<CategoryCard>`, pass `promptCount` and add description display

### 3. Add Pricing to Navbar + Auth Tab Fix + Copyright Update
**File:** `src/components/Navbar.tsx`
- Add `{ name: 'Pricing', path: '/pricing' }` to `navLinks` array (between Browse and About)
- Change "Get Started" button link from `/auth` to `/auth?tab=signup`
- Add Blog and Submit Prompt to mobile menu navLinks

**File:** `src/pages/Auth.tsx`
- Read `tab` search param from URL; if `tab=signup`, default `isLogin` to `false`

**File:** `src/components/Footer.tsx`
- Change "© 2024" to "© 2026" on line 157

### 4. Fix Sitemap Generator
**File:** `scripts/generate-sitemap.ts`
- Update prompt entries to use slugs instead of numeric IDs (or ideally fetch from DB, but since this is a static script, update the hardcoded data)

### 5. Fix robots.txt
**File:** `public/robots.txt`
- Change `Disallow: /*?*` to specific param blocks
- Add `Allow: /browse?category=`

### 6. Seed 64 Prompts into Database
- Use the database insert tool to add ~64 prompts across all 8 categories with realistic data (titles, descriptions, previews, prices, ratings, tags)
- This requires first fetching existing category IDs from the database

### 7. Fix Singular/Plural Grammar
**File:** `src/components/CategoryCard.tsx` line 29
- Change `{promptCount} prompts` to `{promptCount} {promptCount === 1 ? 'prompt' : 'prompts'}`

**File:** `src/pages/Categories.tsx` line 54
- Same singular/plural fix for prompt count display

## Files Changed Summary

| File | Change |
|------|--------|
| `src/components/Footer.tsx` | Fix `/submit` link, update copyright to 2026 |
| `src/pages/Categories.tsx` | Remove duplicate card rendering |
| `src/components/Navbar.tsx` | Add Pricing to nav, fix Get Started link |
| `src/pages/Auth.tsx` | Read `?tab=signup` param |
| `src/components/CategoryCard.tsx` | Fix singular/plural grammar |
| `scripts/generate-sitemap.ts` | Update to use slugs |
| `public/robots.txt` | Refine disallow rules |
| Database | Insert ~64 seed prompts |

## What's NOT Needed (Already Done)
- OG tags, Twitter cards, JSON-LD structured data (SEO component is comprehensive)
- Stripe payment flow (fully wired with checkout + verification)
- Skeleton loading UI (already using Skeleton components throughout)
- Related prompts on detail page (already implemented)
- Copy preview button with feedback (already implemented)
- Unsubscribe page (already exists)
- Canonical tags (already in SEO component)

