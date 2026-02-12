# TWNG — Lovable Design Implementation Guide (v2)

> **Optimized for Lovable's AI workflow**
> Based on [Lovable Prompting Best Practices](https://docs.lovable.dev/tips-tricks/best-practice)

---

## ⚠️ Before You Start

### 1. Create a GitHub Branch
Before making ANY changes, create a dev branch:
```
In Lovable → Settings → GitHub → Create new branch "design-system"
```
This protects your production code. All changes go to the branch first.

### 2. Understand Lovable's Golden Rules

| Do ✅ | Don't ❌ |
|-------|---------|
| One task per prompt | Multiple unrelated changes |
| Use Plan Mode first | Implement directly |
| Add guardrails (what NOT to touch) | Assume AI knows your structure |
| Describe outcomes, not code | Copy-paste code blocks |
| Test after each prompt | Chain 5 prompts before testing |
| Ask "why" before asking to fix | Jump to fixes |

---

## How to Use This Guide

Each prompt follows this structure:

```
🎯 GOAL: [What you want to achieve]

📍 CONTEXT: [Which page/file this affects]

🛡️ GUARDRAILS: [What NOT to touch]

✨ EXPECTED RESULT: [How to verify success]
```

**Workflow for each prompt:**
1. **Copy the prompt** to Lovable
2. **Use Plan Mode** — click "Plan" not "Implement"
3. **Review the plan** — make sure it's not touching other things
4. **Implement** only if plan looks safe
5. **Test immediately** in preview
6. **Commit to GitHub** if working

---

## Phase 1: Design Tokens (Foundation)

### Prompt 1.1: Add Brand Colors

```
🎯 GOAL: Add TWNG brand colors to the Tailwind config

📍 CONTEXT: This is a design token setup. No visual changes yet.

🛡️ GUARDRAILS:
- DO NOT modify any existing colors
- DO NOT change any components or pages
- ONLY add new color definitions to tailwind.config

✨ EXPECTED RESULT: I can use classes like "bg-amber" and "text-visibility-private" after this change, but the app looks exactly the same as before.

Add these colors under extend.colors:

amber:
  DEFAULT: '#F59E0B'
  dark: '#D97706'
  light: '#FCD34D'
  50: '#FFFBEB'

twng-gray:
  900: '#1F2937'
  700: '#374151'
  500: '#6B7280'
  300: '#D1D5DB'
  100: '#F3F4F6'

visibility:
  private: '#6B7280'
  link: '#3B82F6'
  public: '#10B981'
```

**✓ Test:** App loads normally. Open DevTools → no errors.

---

### Prompt 1.2: Add Spacing & Radius Tokens

```
🎯 GOAL: Add TWNG spacing and border-radius tokens

📍 CONTEXT: Continuing design token setup in tailwind.config

🛡️ GUARDRAILS:
- DO NOT modify existing spacing or radius values
- DO NOT touch any components
- ONLY add new values

✨ EXPECTED RESULT: New utility classes available, no visual changes.

Add to extend.borderRadius:
  'twng': '8px'
  'twng-lg': '12px'

Add to extend.spacing:
  'twng-xs': '4px'
  'twng-sm': '8px'
  'twng-md': '16px'
  'twng-lg': '24px'
```

**✓ Test:** App loads normally. Existing UI unchanged.

---

## Phase 2: Create Components (Isolated)

> **Important:** All new components go in `/components/twng/` folder.
> We're ADDING, not replacing existing components.

---

### Prompt 2.1: Create TwngButton

```
🎯 GOAL: Create a new button component for TWNG brand styling

📍 CONTEXT: New file at /components/twng/TwngButton.tsx

🛡️ GUARDRAILS:
- Create NEW file only
- DO NOT modify any existing Button components
- DO NOT import this into any pages yet

✨ EXPECTED RESULT: A reusable button with 3 variants (primary, secondary, ghost) that I can import later.

Requirements:
- Primary: amber background, white text, hover darkens
- Secondary: white background, gray border, hover gray background
- Ghost: transparent, amber text, underline on hover
- Sizes: sm, md (default), lg
- Include disabled state
- Use the new Tailwind tokens (bg-amber, rounded-twng, etc.)

Export as named export: export function TwngButton
```

**✓ Test:** No errors. Component created but not used anywhere yet.

---

### Prompt 2.2: Create TwngCard

```
🎯 GOAL: Create a card wrapper component

📍 CONTEXT: New file at /components/twng/TwngCard.tsx

🛡️ GUARDRAILS:
- Create NEW file only
- DO NOT touch existing Card components
- DO NOT use this anywhere yet

✨ EXPECTED RESULT: A card component with optional hover effect.

Requirements:
- White background
- Subtle border (gray-200)
- Rounded corners (rounded-twng-lg)
- Optional: hoverable prop adds shadow on hover
- Accepts children and className
```

**✓ Test:** File created, no errors.

---

### Prompt 2.3: Create GuitarCard

```
🎯 GOAL: Create a guitar display card for collection grid

📍 CONTEXT: New file at /components/twng/GuitarCard.tsx

🛡️ GUARDRAILS:
- Create NEW file only
- DO NOT modify the existing collection page
- This component should use TwngCard internally

✨ EXPECTED RESULT: A card that shows guitar image, brand, model, year, and visibility icon.

Requirements:
- Square image area at top (show 🎸 emoji if no image)
- Brand + Model as title (truncate if long)
- Year below in smaller gray text
- Visibility icon in corner: 🔒 (private), 🔗 (link), 🌐 (public)
- Clickable (onClick prop)
- Uses TwngCard with hoverable={true}

Props:
- imageUrl?: string
- brand: string
- model: string
- year?: number
- visibility: 'private' | 'link' | 'public'
- onClick?: () => void
```

**✓ Test:** File created. Import in a test page to verify it renders.

---

### Prompt 2.4: Create VisibilitySelector

```
🎯 GOAL: Create a visibility picker with 3 options

📍 CONTEXT: New file at /components/twng/VisibilitySelector.tsx

🛡️ GUARDRAILS:
- Create NEW file only
- DO NOT add to any pages yet

✨ EXPECTED RESULT: A component showing 3 clickable options for visibility.

Requirements:
Three options displayed as cards:
1. Private (🔒) - "Only you can see it"
2. Link (🔗) - "Anyone with the link can view"
3. Public (🌐) - "Visible in TWNG community"

Selected state: amber border, light amber background
Unselected: gray border, white background

Props:
- value: 'private' | 'link' | 'public'
- onChange: (value) => void
```

**✓ Test:** Import somewhere to verify selection works.

---

### Prompt 2.5: Create EmptyState

```
🎯 GOAL: Create a reusable empty state component

📍 CONTEXT: New file at /components/twng/EmptyState.tsx

🛡️ GUARDRAILS:
- Create NEW file only
- Uses TwngButton for the action

✨ EXPECTED RESULT: Centered message with icon, title, description, and optional action button.

Props:
- icon?: React.ReactNode (default: 🎸)
- title: string
- description?: string
- action?: { label: string, onClick: () => void }

Layout: centered, generous padding, clean whitespace
```

---

## Phase 3: Screen Migration (One at a Time!)

> **Critical:** Only change ONE screen per prompt.
> Test thoroughly before moving to the next.

---

### Prompt 3.1: Empty Collection State

```
🎯 GOAL: Update the empty state when user has no guitars

📍 CONTEXT: The collection/my-guitars page when there are 0 guitars

🛡️ GUARDRAILS:
- ONLY change the empty state component/section
- DO NOT touch the page header
- DO NOT touch the navigation
- DO NOT change any other part of this page
- DO NOT affect the state when user HAS guitars

✨ EXPECTED RESULT: When I have no guitars, I see a nice empty state with the 🎸 icon and "Add Your First Guitar" button.

Use the EmptyState component with:
- title: "Your collection is waiting"
- description: "Add your first guitar — unlimited, free forever."
- action: { label: "+ Add Your First Guitar", onClick: navigate to add page }
```

**✓ Test:**
1. Clear your test guitars (or use new account)
2. Verify empty state shows correctly
3. Verify button navigates to add page
4. Add a guitar and verify the collection grid still works

---

### Prompt 3.2: Guitar Grid Cards

```
🎯 GOAL: Update guitar cards in the collection grid

📍 CONTEXT: The collection page when user HAS guitars

🛡️ GUARDRAILS:
- ONLY change the individual guitar card rendering
- DO NOT touch page header
- DO NOT touch navigation
- DO NOT touch add button
- DO NOT touch filters/sorting if they exist
- DO NOT change empty state (already done)

✨ EXPECTED RESULT: Each guitar in the grid uses the new GuitarCard component.

Replace current guitar cards with GuitarCard component.
Pass: imageUrl, brand, model, year, visibility, onClick (navigate to detail).
```

**✓ Test:**
1. View collection with multiple guitars
2. Verify all info displays correctly
3. Verify click navigates to guitar detail
4. Verify on mobile (responsive)

---

### Prompt 3.3: Add Guitar - Method Selection

```
🎯 GOAL: Restyle the "choose add method" screen

📍 CONTEXT: The screen where user picks Magic Add vs Manual

🛡️ GUARDRAILS:
- ONLY change this specific screen
- DO NOT touch what happens after selection
- Keep existing navigation/routing logic

✨ EXPECTED RESULT: Two nice cards for choosing Magic Add or Manual entry.

Two cards side by side (stack on mobile):

Card 1 - Magic Add:
- Icon: 📸
- Title: "Magic Add"
- Description: "Take a photo — we'll identify it"
- Badge: "✨ Recommended" (amber colored)

Card 2 - Manual:
- Icon: ✏️
- Title: "Add Manually"
- Description: "Enter details yourself"

Selected card has amber border.
Use TwngCard components.
```

**✓ Test:** Both options work and navigate correctly.

---

### Prompt 3.4: Visibility Selection Step

```
🎯 GOAL: Add visibility selection screen before saving guitar

📍 CONTEXT: After user enters guitar details, before final save

🛡️ GUARDRAILS:
- This may be a NEW screen/step in the add flow
- DO NOT change the form that collects guitar details
- DO NOT change the final save logic

✨ EXPECTED RESULT: User sees "Who can see this guitar?" with 3 options before saving.

Screen content:
- Header: "Who can see this guitar?"
- Subheader: "You can change this anytime."
- VisibilitySelector component (full variant)
- Save button: "Save to My Collection" (TwngButton primary)

When user selects Public and clicks save:
- Show confirmation: "Make this guitar public? It will be visible to everyone."
- Buttons: "Cancel" / "Make Public"
```

**✓ Test:** Complete full add flow, verify visibility is saved correctly.

---

### Prompt 3.5: Success Screen

```
🎯 GOAL: Create success screen after guitar is saved

📍 CONTEXT: Shown immediately after save completes

🛡️ GUARDRAILS:
- DO NOT change the save logic itself
- This is display only after successful save

✨ EXPECTED RESULT: Clean success message with next action options.

Layout (centered):
- Green checkmark icon (large)
- "Done! Your [brand] [model] is saved."
- Visibility status: "🔒 Private — only you can see it"

Three buttons (vertical stack):
1. "+ Add another guitar" (secondary)
2. "Go to My Collection" (secondary)
3. "Add story to this guitar →" (text link)
```

**✓ Test:** Complete add flow and verify success screen shows correct guitar info.

---

## Phase 4: Polish (After Everything Works)

### Prompt 4.1: Audit Existing Buttons

```
🎯 GOAL: List all buttons that don't use TWNG styling

📍 CONTEXT: Whole app audit

🛡️ GUARDRAILS:
- DO NOT make any changes
- ONLY provide a list

✨ EXPECTED RESULT: A list of files and buttons that need updating.

Please scan the codebase and list:
- File path
- Button text/purpose
- Current styling approach

Format as a table. Do not change anything.
```

*Review the list, then update buttons one page at a time.*

---

### Prompt 4.2: Update [Page Name] Buttons

```
🎯 GOAL: Update buttons on [specific page] to use TwngButton

📍 CONTEXT: [exact page path]

🛡️ GUARDRAILS:
- ONLY change buttons on this specific page
- DO NOT touch other pages
- Keep all existing onClick handlers

✨ EXPECTED RESULT: Buttons on this page use TwngButton with correct variants.
```

*Repeat for each page.*

---

## 🐛 Troubleshooting

### If Something Breaks

1. **Don't panic** — Use Lovable's version history to revert
2. **Ask why first:**
   ```
   Something is broken on the collection page - the cards aren't showing.
   Can you investigate what might have caused this?
   Don't make changes yet, just explain what you find.
   ```
3. **Then ask for targeted fix:**
   ```
   Please fix the GuitarCard import issue you identified.
   Only fix this specific issue.
   Do not change anything else.
   ```

### If AI Keeps Breaking Things

Add stronger guardrails:
```
IMPORTANT: This is a surgical change.
Touch ONLY the file /components/twng/GuitarCard.tsx
DO NOT modify ANY other files.
If you think other files need changes, STOP and tell me first.
```

### If a Feature Doesn't Work After "Fix"

Lovable sometimes says it fixed something but didn't. Verify:
```
The visibility selector still doesn't save correctly.
Please add a console.log in the onChange handler
so I can verify it's being called.
Show me the exact code change you're making.
```

---

## 📋 Progress Checklist

### Phase 1: Tokens
- [ ] 1.1 Brand colors added
- [ ] 1.2 Spacing & radius added
- [ ] App still works normally

### Phase 2: Components
- [ ] 2.1 TwngButton created
- [ ] 2.2 TwngCard created
- [ ] 2.3 GuitarCard created
- [ ] 2.4 VisibilitySelector created
- [ ] 2.5 EmptyState created
- [ ] All components render without errors

### Phase 3: Screens
- [ ] 3.1 Empty collection state
- [ ] 3.2 Guitar grid cards
- [ ] 3.3 Add method selection
- [ ] 3.4 Visibility selection step
- [ ] 3.5 Success screen
- [ ] Full add flow works end-to-end

### Phase 4: Polish
- [ ] 4.1 Button audit complete
- [ ] 4.2 All buttons updated
- [ ] Visual QA pass
- [ ] Mobile responsive check

### Final
- [ ] Merge branch to main
- [ ] Delete old unused components

---

## 🔑 Key Reminders

1. **Plan Mode is your friend** — Always plan before implementing
2. **One thing at a time** — Resist the urge to do "just one more thing"
3. **Test after every prompt** — Don't chain prompts without testing
4. **Guardrails save credits** — Be explicit about what NOT to touch
5. **Ask before fixing** — Understand the problem first
6. **Commit often** — Small commits are easier to revert

---

*Built for TWNG. Optimized for Lovable.*
