

# Pre-Deployment Audit Report: 1Prompts

## EXECUTIVE SUMMARY

- **Engineering Health Score:** 72/100
- **Production Readiness:** Needs Work
- **One-Paragraph Assessment:** The project is a well-structured React SPA marketplace with solid foundations -- proper RLS policies, content sanitization, code splitting, and a clean data access layer. However, several critical issues threaten production readiness: missing production domain in CORS allowlists on 4 of 7 edge functions (payments will fail from 1prompts.com), no timeouts on external API calls in edge functions, a stale sitemap with legacy numeric IDs instead of actual prompt slugs, and missing React Error Boundaries. The security posture is strong overall with proper admin role checks, DOMPurify sanitization, and rate limiting, but edge function hardening needs attention before launch.

---

## TOP 10 CRITICAL RISKS (Ranked by Impact)

| # | Risk | Severity | File | Impact |
|---|------|----------|------|--------|
| 1 | Production domain `1prompts.com` missing from CORS in 4 edge functions | **Critical** | `create-prompt-checkout`, `verify-prompt-payment`, `customer-portal`, `send-purchase-confirmation` | **All payments will fail** when accessed from the production domain |
| 2 | No timeouts on external API calls (Stripe, Resend, inter-function calls) | **High** | All 7 edge functions | Functions can hang indefinitely, exhausting resources |
| 3 | Sitemap contains legacy numeric IDs (`/prompt/1` through `/prompt/8`) | **High** | `public/sitemap.xml:78-125` | Google indexing wrong URLs; real 64 prompts not in sitemap |
| 4 | No React Error Boundary anywhere in the app | **High** | `src/App.tsx` | Unhandled component errors crash the entire app with a white screen |
| 5 | `PaymentSuccess.tsx` references stale `prompts` from local data file | **Medium** | `src/pages/PaymentSuccess.tsx:10,47` | Purchase details may show wrong data or nothing after payment |
| 6 | `Admin.tsx` imports stale `prompts` from local data file | **Medium** | `src/pages/Admin.tsx:19` | Admin dashboard may show incorrect prompt info |
| 7 | `csp-headers` edge function still has wildcard CORS `"*"` | **Medium** | `supabase/functions/csp-headers/index.ts:4` | Inconsistent with other functions' security posture |
| 8 | Newsletter confirmation email says "© 2024" | **Low** | `supabase/functions/newsletter-subscribe/index.ts:199` | Brand inconsistency |
| 9 | Purchase confirmation email says "PromptVault" not "1Prompts" | **Medium** | `supabase/functions/send-purchase-confirmation/index.ts:62,142` | Brand confusion for customers |
| 10 | `send-purchase-confirmation` has no auth check | **Medium** | `supabase/functions/send-purchase-confirmation/index.ts` | Unauthenticated callers can trigger emails |

---

## DETAILED FINDINGS BY SECTION

---

### Section 1: REPOSITORY STRUCTURE & ARCHITECTURE

**Total Issues Found:** 3 | **Critical:** 0 | **High:** 0 | **Medium:** 2 | **Low:** 1

Architecture is clean: pages in `/pages`, components in `/components`, hooks in `/hooks`, DB layer in `/lib/db`, edge functions properly namespaced. Code splitting is implemented for all 22 pages.

**Issue 1.1: Stale Local Data File Still Referenced**
- **Severity:** Medium
- **Location:** `src/data/prompts.ts`, `src/pages/PaymentSuccess.tsx:10,47`, `src/pages/Admin.tsx:19`
- **Evidence:**
  ```typescript
  // PaymentSuccess.tsx:47
  const prompt = prompts.find(p => p.id === promptId);
  ```
- **Impact:** After migrating to DB-backed prompts, these references use stale hardcoded data. PaymentSuccess won't find DB prompts, showing blank purchase details.
- **Fix:** Replace local data lookups with DB queries (e.g., `usePromptByLegacyId` or a direct Supabase query).

**Issue 1.2: `src/data/prompts.ts` is Dead Code**
- **Severity:** Low
- **Location:** `src/data/prompts.ts` (223 lines)
- **Impact:** 223 lines of unused legacy data that can confuse developers. Only referenced by PaymentSuccess and Admin, which should use DB instead.
- **Fix:** Remove file after fixing Issue 1.1.

**Issue 1.3: Missing Shared CORS Utility for Edge Functions**
- **Severity:** Medium
- **Location:** All 7 edge functions
- **Evidence:** Each function duplicates the `allowedOrigins` array and `getCorsHeaders` function, with inconsistent domain lists.
- **Impact:** When adding new production domains, each function must be updated individually -- error-prone.
- **Fix:** Create a shared CORS utility or at minimum ensure all functions have identical origin lists.

---

### Section 2: PERFORMANCE OPTIMIZATION

**Total Issues Found:** 3 | **Critical:** 0 | **High:** 0 | **Medium:** 2 | **Low:** 1

**Issue 2.1: Font Import via CSS @import Blocks Rendering**
- **Severity:** Medium
- **Location:** `src/index.css:5`
- **Evidence:**
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
  ```
- **Impact:** CSS @import is render-blocking. Should use `<link rel="preload">` in index.html for faster FCP.
- **Fix:** Move to `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preload" as="style">` in index.html.

**Issue 2.2: Client-Side Pagination Fetches 100 Prompts**
- **Severity:** Medium
- **Location:** `src/pages/Browse.tsx:61`
- **Evidence:**
  ```typescript
  limit: 100, // Fetch more for client-side pagination
  ```
- **Impact:** Fetches all prompts when only 9 are shown per page. With 64+ prompts this transfers unnecessary data. Will worsen as catalog grows.
- **Fix:** Implement server-side pagination using offset-based queries matching `ITEMS_PER_PAGE`.

**Issue 2.3: `getPromptCountsByCategory` Fetches All Prompts to Count**
- **Severity:** Low
- **Location:** `src/lib/db/prompts.ts:317-335`
- **Evidence:**
  ```typescript
  const { data } = await supabase
    .from("prompts")
    .select("category_id")
    .eq("status", "published");
  // Then counts client-side in a loop
  ```
- **Impact:** Downloads all prompt rows just to count them. Should use a grouped count query or DB function.
- **Fix:** Use `.select("category_id", { count: "exact" })` grouped by category, or create a DB view.

---

### Section 3: SECURITY HARDENING

**Total Issues Found:** 7 | **Critical:** 1 | **High:** 1 | **Medium:** 4 | **Low:** 1

**Issue 3.1: Production Domain Missing from 4 Edge Function CORS**
- **Severity:** Critical (Stop-Ship)
- **Location:** `supabase/functions/create-prompt-checkout/index.ts:6-10`, `verify-prompt-payment/index.ts:6-10`, `customer-portal/index.ts:6-10`, `send-purchase-confirmation/index.ts:7-11`
- **Evidence:**
  ```typescript
  // These 4 functions are MISSING the production domains:
  const allowedOrigins = [
    'https://2837ef4f-55c7-4cf3-94a1-b420d86aacbf.lovableproject.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  // Missing: 'https://1prompts.com', 'https://prompts1.lovable.app'
  ```
- **Impact:** When users visit `1prompts.com` and try to purchase, the CORS preflight will fail. **All payment flows are broken on the production domain.**
- **Fix:** Add `'https://1prompts.com'` and `'https://prompts1.lovable.app'` to all 4 functions' `allowedOrigins` arrays.

**Issue 3.2: No Timeouts on External API Calls in Edge Functions**
- **Severity:** High
- **Location:** All edge functions making external calls (Stripe API, Resend API, inter-function fetch)
- **Evidence:**
  ```typescript
  // verify-prompt-payment/index.ts:134 - no timeout
  const emailResponse = await fetch(
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-purchase-confirmation`,
    { method: "POST", ... }
  );
  ```
- **Impact:** If Stripe or Resend hangs, the function runs until Deno's hard timeout (~150s), consuming resources and leaving users in limbo.
- **Fix:** Add `AbortController` with 10-second timeout to all `fetch` calls, and rely on Stripe SDK's built-in timeout where applicable.

**Issue 3.3: `send-purchase-confirmation` Has No Authentication**
- **Severity:** Medium
- **Location:** `supabase/functions/send-purchase-confirmation/index.ts:34-42`
- **Evidence:** The function accepts email/promptTitle/price directly from the request body with no auth check. `config.toml` sets `verify_jwt = false`.
- **Impact:** Anyone who knows the endpoint URL can trigger purchase confirmation emails to arbitrary email addresses (spam vector).
- **Fix:** Add JWT verification and validate the caller (either require admin role, or only allow calls from `verify-prompt-payment` using a shared secret).

**Issue 3.4: `csp-headers` Function Uses Wildcard CORS**
- **Severity:** Medium
- **Location:** `supabase/functions/csp-headers/index.ts:3-6`
- **Evidence:**
  ```typescript
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
  };
  ```
- **Impact:** Inconsistent with the security posture of other functions. While this function only returns config (no data mutations), it's a policy violation.
- **Fix:** Apply the same `allowedOrigins` pattern used in other functions.

**Issue 3.5: No Input Sanitization on Email in `send-purchase-confirmation`**
- **Severity:** Medium
- **Location:** `supabase/functions/send-purchase-confirmation/index.ts:100`
- **Evidence:**
  ```html
  <td style="...">${promptTitle}</td>
  ```
  `promptTitle` is injected directly into HTML without sanitization (unlike `send-submission-notification` which properly escapes).
- **Impact:** XSS in email clients if a malicious prompt title contains HTML.
- **Fix:** Apply the same HTML entity encoding used in `send-submission-notification`.

**Issue 3.6: Mobile "Get Started" Button Missing `?tab=signup`**
- **Severity:** Low
- **Location:** `src/components/Navbar.tsx:198`
- **Evidence:**
  ```tsx
  <Link to="/auth" onClick={() => setIsOpen(false)}>
    <Button className="btn-gradient w-full">Get Started</Button>
  </Link>
  ```
- **Impact:** Mobile users clicking "Get Started" see the login form instead of signup. Desktop correctly links to `/auth?tab=signup` (line 118).
- **Fix:** Change to `<Link to="/auth?tab=signup">`.

**Issue 3.7: `Resend` Client Instantiated at Module Level**
- **Severity:** Medium
- **Location:** `supabase/functions/send-purchase-confirmation/index.ts:4`, `send-submission-notification/index.ts:5`
- **Evidence:**
  ```typescript
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
  ```
- **Impact:** If `RESEND_API_KEY` is not set at cold start, `resend` is initialized with `undefined` and every subsequent invocation fails silently until the function cold-starts again.
- **Fix:** Move initialization inside the handler, after checking the env var exists.

---

### Section 4: SEO OPTIMIZATION

**Total Issues Found:** 3 | **Critical:** 0 | **High:** 1 | **Medium:** 2 | **Low:** 0

**Issue 4.1: Sitemap Contains Legacy Numeric IDs, Missing All 64 DB Prompts**
- **Severity:** High
- **Location:** `public/sitemap.xml:78-125`
- **Evidence:**
  ```xml
  <loc>https://1prompts.com/prompt/1</loc>
  <loc>https://1prompts.com/prompt/2</loc>
  <!-- ... through /prompt/8 -->
  ```
- **Impact:** Google indexes 8 legacy URLs instead of the 64 actual prompts. Those legacy IDs resolve via LEGACY_ID_TO_SLUG mapping to only the original 8 prompts, but 56 prompts are invisible to search engines.
- **Fix:** Generate sitemap dynamically from DB, or manually list all 64 prompt slugs. The `scripts/generate-sitemap.ts` was updated to use slugs but the actual `sitemap.xml` was never regenerated.

**Issue 4.2: Sitemap `lastmod` Dates Are Stale (2025-12-24)**
- **Severity:** Medium
- **Location:** `public/sitemap.xml` (all entries)
- **Impact:** Google may deprioritize crawling since dates haven't changed. Should reflect actual content modification dates.
- **Fix:** Update all dates to current (2026-03-08) and ideally generate dynamically.

**Issue 4.3: Category Pages Not In Sitemap**
- **Severity:** Medium
- **Location:** `public/sitemap.xml`
- **Impact:** Individual category browsing URLs like `/browse?category=chatgpt` are not indexed, losing SEO for category-specific searches.
- **Fix:** Add `/browse?category={slug}` entries for each of the 8 categories.

---

### Section 5: CODE QUALITY & MAINTAINABILITY

**Total Issues Found:** 3 | **Critical:** 0 | **High:** 1 | **Medium:** 1 | **Low:** 1

**Issue 5.1: No React Error Boundary**
- **Severity:** High
- **Location:** `src/App.tsx`
- **Evidence:** No `ErrorBoundary` component exists anywhere in the codebase (confirmed via search).
- **Impact:** Any unhandled rendering error (e.g., null reference in a component) crashes the entire app with a white screen. No recovery mechanism or user-friendly error message.
- **Fix:** Add a top-level `ErrorBoundary` component wrapping `<Routes>` in `App.tsx`. Show a user-friendly fallback with a "reload" button.

**Issue 5.2: Brand Inconsistency in Email Templates**
- **Severity:** Medium
- **Location:** `supabase/functions/send-purchase-confirmation/index.ts:62,126,142`
- **Evidence:**
  ```typescript
  from: "PromptVault <onboarding@resend.dev>",
  // ...
  // Line 142:
  © ${new Date().getFullYear()} PromptVault. All rights reserved.
  ```
- **Impact:** Customers receive emails from "PromptVault" instead of "1Prompts", creating brand confusion and reducing trust.
- **Fix:** Replace all "PromptVault" references with "1Prompts" and update the sender domain.

**Issue 5.3: Missing `aria-label` on Mobile Menu Toggle**
- **Severity:** Low
- **Location:** `src/components/Navbar.tsx:128-133`
- **Evidence:**
  ```tsx
  <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-foreground">
    {isOpen ? <X /> : <Menu />}
  </button>
  ```
- **Impact:** Screen readers cannot identify the button's purpose.
- **Fix:** Add `aria-label={isOpen ? "Close menu" : "Open menu"}`.

---

### Section 6: BUSINESS LOGIC & FUNCTIONALITY

**Total Issues Found:** 2 | **Critical:** 0 | **High:** 0 | **Medium:** 2 | **Low:** 0

**Issue 6.1: PaymentSuccess Uses Stale Local Data for Purchase Details**
- **Severity:** Medium
- **Location:** `src/pages/PaymentSuccess.tsx:10,47-53`
- **Evidence:**
  ```typescript
  import { prompts } from '@/data/prompts';
  // ...
  const prompt = prompts.find(p => p.id === promptId);
  ```
- **Impact:** After DB migration, `promptId` is a UUID but local data uses string IDs "1"-"8". The lookup returns `undefined`, so purchase details (title, price) are never displayed after a successful payment.
- **Fix:** Query the prompt from DB using `supabase.from('prompts').select('title, price_cents').eq('id', promptId).single()` or use the Stripe session metadata.

**Issue 6.2: Newsletter Copyright Year Hardcoded to 2024**
- **Severity:** Medium
- **Location:** `supabase/functions/newsletter-subscribe/index.ts:199`
- **Evidence:**
  ```html
  © 2024 1Prompts. All rights reserved.
  ```
- **Impact:** Shows outdated year in welcome emails.
- **Fix:** Use `${new Date().getFullYear()}` dynamically.

---

## IMPLEMENTATION PRIORITY

**Phase 1 - Stop-Ship (Fix before any production traffic):**
1. Add `1prompts.com` and `prompts1.lovable.app` to CORS in all 4 edge functions missing them
2. Fix mobile navbar "Get Started" link to include `?tab=signup`

**Phase 2 - High Priority (Fix within 1 week):**
3. Add timeouts to all external API calls in edge functions
4. Regenerate `sitemap.xml` with actual prompt slugs and current dates
5. Add React Error Boundary
6. Fix PaymentSuccess to query DB instead of local data
7. Secure `send-purchase-confirmation` with auth check

**Phase 3 - Medium Priority (Fix within 2 weeks):**
8. Fix brand references ("PromptVault" -> "1Prompts") in email templates
9. Fix copyright year in newsletter email
10. Add input sanitization to purchase confirmation email
11. Add category URLs to sitemap
12. Move Resend initialization inside handlers
13. Remove stale `src/data/prompts.ts`

**Phase 4 - Low Priority (Polish):**
14. Add `aria-label` to mobile menu toggle
15. Move font import to `<link>` in index.html
16. Implement server-side pagination in Browse
17. Add wildcard CORS fix to csp-headers function

