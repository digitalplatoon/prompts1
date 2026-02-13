

# Admin Prompt CRUD UI

## Overview
Build a full admin interface for creating, editing, and deleting prompts directly from the dashboard. This adds a new "Prompts" tab to the existing Admin page with a table of all prompts (including drafts/archived) and a dialog-based form for create/edit operations.

## What Will Be Built

### 1. New Component: `AdminPromptManager` (`src/components/AdminPromptManager.tsx`)
The main component that renders inside a new "Prompts" tab on the Admin page. Contains:

- **Prompt table** showing all prompts (not just published) with columns: Title, Category, Price, Status, Featured, Created date, and Actions (Edit/Delete)
- **Status filter** tabs: All, Draft, Published, Archived
- **Search** input to filter by title
- **"New Prompt" button** to open the create form

### 2. New Component: `AdminPromptForm` (`src/components/AdminPromptForm.tsx`)
A dialog-based form for creating and editing prompts with these fields:

- **Title** (text input)
- **Slug** (auto-generated from title, editable)
- **Short Description** (textarea)
- **Preview** (textarea - the public preview snippet)
- **Full Prompt** (rich textarea with monospace font for the actual prompt content)
- **Category** (dropdown select populated from `prompt_categories` table)
- **Price** (number input in dollars, stored as cents)
- **Tags** (tag input - type a tag and press Enter to add, click to remove)
- **Usage Instructions** (multi-line input, one per line)
- **Example Outputs** (multi-line input, one per line)
- **Status** (select: draft / published / archived)
- **Featured** (toggle switch)

### 3. Update: Admin Page (`src/pages/Admin.tsx`)
- Add a 6th tab "Prompts" with a Package icon to the existing TabsList
- Import and render `AdminPromptManager` in the new tab content

### 4. Update: App Router (`src/App.tsx`)
No changes needed - the admin route already exists and is protected by `AdminRoute`.

## Data Flow

- **Read all prompts**: Admin RLS policy already allows admins to SELECT all prompts (including drafts). The form will select `*` (including `full_prompt`) since admin has full access.
- **Create**: `supabase.from('prompts').insert(...)` - admin INSERT policy already exists
- **Update**: `supabase.from('prompts').update(...).eq('id', id)` - admin UPDATE policy already exists
- **Delete**: `supabase.from('prompts').delete().eq('id', id)` - admin DELETE policy already exists
- **Categories**: Fetched via existing `getCategories()` from `src/lib/db/prompts.ts`

No database migrations are needed -- all required RLS policies are already in place.

## Technical Details

### Slug Generation
Auto-generate slug from title using: lowercase, replace spaces with hyphens, remove special characters, deduplicate hyphens. The slug field remains editable for manual override.

### Tag Management
A controlled input where:
- Typing text and pressing Enter adds a tag (trimmed, lowercased)
- Each tag renders as a Badge with an X button to remove
- Duplicate tags are prevented

### Price Handling
- Display and input in dollars (e.g., `9.99`)
- Convert to/from `price_cents` (integer) when reading/writing to database
- Validation: must be a positive number

### Delete Confirmation
Uses an AlertDialog to confirm deletion, warning that this action cannot be undone.

### Form Validation
- Title: required, min 3 characters
- Slug: required, must be URL-safe
- Short Description: required
- Preview: required
- Full Prompt: required
- Category: required
- Price: required, must be > 0

### Files Changed
| File | Change |
|------|--------|
| `src/components/AdminPromptManager.tsx` | New - prompt table with CRUD actions |
| `src/components/AdminPromptForm.tsx` | New - create/edit dialog form |
| `src/pages/Admin.tsx` | Add "Prompts" tab, update grid to 6 columns |

