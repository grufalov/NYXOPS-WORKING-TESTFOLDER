# Dashboard Page - Complete File Structure and Dependencies

## **1. PRIMARY COMPONENT**
```
src/views/Dashboard.jsx                    # Main dashboard page component
```
**Purpose:** Root dashboard container with KPI section, quote bar, and two-column layout

---

## **2. IMPORT TREE STRUCTURE**

```
Dashboard.jsx
├── React hooks (useState, useEffect)          # React core
├── Icons
│   ├── FolderOpen                            # From lucide-react
│   ├── Briefcase                             # From lucide-react  
│   └── AlertTriangle                         # From lucide-react
├── Database
│   └── supabaseClient.js                     # Supabase client configuration
├── Utilities
│   └── utils/errorBus.js                     # Centralized error handling
├── Components
│   ├── components/ErrorInline.jsx            # Error display component
│   └── components/QuoteBar.jsx               # Inspirational quote display
│       └── hooks/useStableQuote.js           # Quote rotation hook
│           └── constants/quotes.js           # Quote data
└── Dashboard Sub-Components
    ├── dashboard/MorningChecklistCard.jsx    # Morning checklist widget
    │   ├── Icons: ListChecks, RotateCcw, ChevronUp, ChevronDown, Plus, Edit3
    │   ├── supabaseClient.js
    │   ├── utils/errorBus.js
    │   └── components/ErrorInline.jsx
    ├── dashboard/TaskListFull.jsx            # Task management widget
    │   ├── Icons: CheckSquare, Plus, Trash2, Edit3, Check, X
    │   ├── supabaseClient.js
    │   ├── utils/errorBus.js
    │   └── components/ErrorInline.jsx
    └── dashboard/QuickNotesCardEnhanced.jsx  # Enhanced notes widget
        ├── Icons: StickyNote, Eye, EyeOff, Bold, Italic, Strikethrough, Code, List, ListOrdered, Heading, Save, Maximize2, Minimize2, Type, Palette
        ├── supabaseClient.js
        ├── utils/errorBus.js
        └── utils/notesNormalize.js           # Text normalization utilities
```

---

## **3. INLINE COMPONENTS**
**Defined within Dashboard.jsx:**
```
KPICard                                       # KPI metrics cards (Open Cases, Active Projects, Roles at Risk)
```

---

## **4. STYLING & THEME FILES**

### **Global Styles**
```
src/index.css                                # Main stylesheet with Tailwind imports and custom styles
├── @tailwind base, components, utilities
├── @import styles/tokens.css
├── @import styles/theme-map.css
└── Custom slider/progress styles
```

### **Theme System**
```
src/styles/tokens.css                        # CSS custom properties for light/dark themes
├── :root (light theme variables)
├── .dark (dark theme variables) 
└── Global base styles

src/styles/theme-map.css                     # Tailwind class remapping to theme variables
├── Background utilities (.bg-app, .bg-card, etc.)
├── Text utilities (.text-muted, .text-accent, etc.)
├── Border utilities (.border-subtle, etc.)
├── Ring/Focus utilities (ring-offset-white override)
└── Shadow utilities

src/styles/print.css                         # Print-specific styles (affects modals/reports)
```

---

## **5. UTILITY FILES**

```
src/utils/errorBus.js                        # Centralized error handling system
├── ErrorBus class
├── Error storage and subscription system
└── Error notification management

src/utils/notesNormalize.js                  # Text processing utilities
└── normalizeToMarkdown() function

src/hooks/useStableQuote.js                  # Custom hook for quote management
├── Daily quote rotation logic
├── Session storage management
└── Quote persistence

src/constants/quotes.js                      # Quote data array
├── QUOTES array (30+ motivational quotes)
└── getRotatingQuote() function

src/supabaseClient.js                        # Database client
└── Supabase client initialization
```

---

## **6. DETAILED COMPONENT BREAKDOWN**

### **Dashboard.jsx Components:**
- **Main Container:** Full-screen layout with background
- **KPI Section:** 3-column grid (Open Cases, Active Projects, Roles at Risk)
- **KPICard (inline):** Individual metric cards with loading/error states
- **Left Column:** KPIs + QuoteBar + QuickNotesCardEnhanced
- **Right Column:** MorningChecklistCard + TaskListFull

### **MorningChecklistCard.jsx:**
- **Card Container:** Checklist widget with expand/collapse
- **Default Items:** Pre-populated morning tasks
- **Interactive Elements:** Checkboxes, add/edit functionality
- **State Management:** Completion tracking, persistence

### **TaskListFull.jsx:**
- **Tab System:** Active, All, Today, Overdue, Completed
- **Task List:** Scrollable task items with actions
- **Task Actions:** Complete, edit, delete functionality
- **Pagination:** Load more functionality

### **QuickNotesCardEnhanced.jsx:**
- **Text Editor:** Enhanced textarea with markdown support
- **Toolbar:** Bold, italic, lists, headings, etc.
- **View Modes:** Edit mode vs preview mode
- **Customization:** Font size, color options
- **Auto-save:** Real-time content persistence

### **QuoteBar.jsx:**
- **Quote Display:** Centered inspirational quote
- **Theme Aware:** Adapts to light/dark theme
- **Daily Rotation:** Changes quote daily

### **ErrorInline.jsx:**
- **Error Display:** Inline error messages with icons
- **Retry Functionality:** Optional retry button
- **Theme Support:** Light/dark theme styling

---

## **7. VISUAL/DESIGN FILES CHECKLIST**

### **🎨 FILES REQUIRING VISUAL UPDATES FOR DASHBOARD RESTYLING:**

#### **Primary Layout & Structure:**
- [ ] `src/views/Dashboard.jsx` - Main layout, KPI cards, grid system
- [ ] `src/index.css` - Global styles, custom components

#### **Theme & Design System:**
- [ ] `src/styles/tokens.css` - Color palette, spacing, typography
- [ ] `src/styles/theme-map.css` - Tailwind class mappings
- [ ] `src/styles/print.css` - Print styles (if modals affected)

#### **Dashboard Widgets (Visual Components):**
- [ ] `src/views/dashboard/MorningChecklistCard.jsx` - Checklist card styling
- [ ] `src/views/dashboard/TaskListFull.jsx` - Task list styling, tabs
- [ ] `src/views/dashboard/QuickNotesCardEnhanced.jsx` - Notes editor styling
- [ ] `src/components/QuoteBar.jsx` - Quote display styling
- [ ] `src/components/ErrorInline.jsx` - Error message styling

#### **Supporting Visual Elements:**
- [ ] Icons from Lucide React (may need size/color adjustments)
- [ ] Tailwind configuration (if custom colors/spacing needed)

---

## **8. NON-VISUAL FILES (Logic Only)**
*These handle data/functionality but don't affect appearance:*

- `src/supabaseClient.js` - Database connection
- `src/utils/errorBus.js` - Error handling logic  
- `src/utils/notesNormalize.js` - Text processing
- `src/hooks/useStableQuote.js` - Quote rotation logic
- `src/constants/quotes.js` - Quote data

---

## **9. DETAILED FILE ANALYSIS**

### **Core Layout Files**

#### `src/views/Dashboard.jsx` (206 lines)
- **Imports:** React hooks, Lucide icons, Supabase client, error utilities
- **State Management:** KPI data, loading states, error states
- **Layout Structure:** 
  - Full-screen container with `bg-app` class
  - Container with padding and grid layout
  - XL breakpoint: 6-column grid (3+3 split)
  - Mobile: Single column stack
- **KPI Cards:** Inline component with variants (info, success, warning)
- **Data Fetching:** Async functions for cases, projects, roles at risk
- **Navigation:** Click handlers for KPI cards to switch tabs

### **Dashboard Widgets**

#### `src/views/dashboard/MorningChecklistCard.jsx` (595 lines)
- **Features:** Checklist with default items, add/edit/delete, completion tracking
- **Database:** Stores checklist items per user per day
- **UI Elements:** Expandable card, input fields, icons, progress indicator
- **Styling:** Theme-aware card with borders, shadows, interactive elements

#### `src/views/dashboard/TaskListFull.jsx` (445 lines)
- **Features:** Multi-tab task list (Active, All, Today, Overdue, Completed)
- **Database:** Tasks table with user filtering and status management
- **UI Elements:** Tab navigation, task items, action buttons, pagination
- **Styling:** Card layout with tab headers, scrollable content area

#### `src/views/dashboard/QuickNotesCardEnhanced.jsx` (681 lines)
- **Features:** Rich text editor with markdown support, auto-save, preview mode
- **Database:** Single note per user with real-time persistence
- **UI Elements:** Toolbar with formatting buttons, textarea, preview pane
- **Styling:** Expandable card, toolbar layout, font customization options

### **Supporting Components**

#### `src/components/QuoteBar.jsx` (18 lines)
- **Features:** Daily rotating inspirational quote
- **Styling:** Centered italic text in themed card
- **Data Source:** Uses stable quote hook for persistence

#### `src/components/ErrorInline.jsx` (36 lines)
- **Features:** Error display with optional retry button
- **Styling:** Alert-style layout with icon, message, and action button
- **Theme Support:** Light/dark color variations

### **Styling System**

#### `src/styles/tokens.css` (32 lines)
- **Purpose:** CSS custom properties for theming
- **Variables:** Background colors, text colors, borders, shadows
- **Themes:** Light and dark mode definitions
- **Global:** Base styling for html, body, #root

#### `src/styles/theme-map.css` (102 lines)
- **Purpose:** Remap Tailwind utilities to use CSS variables
- **Categories:** Backgrounds, text, borders, rings/focus, shadows
- **Key Mappings:** 
  - `.bg-white` → `var(--card-bg)`
  - `.bg-app` → `var(--app-bg)`
  - `.ring-offset-white` → `var(--app-bg)`

#### `src/index.css` (63 lines)
- **Structure:** Tailwind imports + theme imports + custom styles
- **Custom Elements:** Slider styles, scrollbar styles, utility classes
- **Load Order:** Tailwind base → custom tokens → theme mappings

---

## **10. DATA FLOW & DEPENDENCIES**

### **Database Tables Used:**
- `cases` - For Open Cases KPI count
- `projects` - For Active Projects KPI count  
- `roles_at_risk` - For Roles at Risk KPI count
- `morning_checklist_items` - For checklist persistence
- `tasks` - For task management
- `quick_notes` - For notes persistence

### **State Management:**
- **Dashboard:** KPI data, loading states, error states
- **MorningChecklistCard:** Items array, loading, error, UI states
- **TaskListFull:** Tasks array, active tab, pagination, editing states
- **QuickNotesCardEnhanced:** Content, save state, preview mode, customization
- **QuoteBar:** Uses hook for stable quote (no local state)

### **Error Handling:**
- **ErrorBus:** Centralized error collection and notification
- **ErrorInline:** Component-level error display
- **Retry Logic:** Individual component retry functions

---

## **11. RESPONSIVE DESIGN**

### **Breakpoints Used:**
- **Mobile (default):** Single column layout
- **SM (640px+):** 3-column KPI grid
- **XL (1280px+):** 6-column main grid (3+3 split)

### **Layout Patterns:**
- **Grid System:** CSS Grid for main layout and KPI section
- **Flexbox:** Internal component layouts
- **Space Utilities:** Tailwind spacing for consistent gaps

---

## **12. PERFORMANCE CONSIDERATIONS**

### **Loading States:**
- Individual KPI loading indicators
- Component-level loading for widgets
- Skeleton states in task lists

### **Data Optimization:**
- Count queries for KPIs (head: true)
- Pagination for task lists
- Auto-save debouncing for notes

### **Memory Management:**
- Error bus with 50-item limit
- Session storage cleanup for quotes
- Component cleanup in useEffect

---

## **SUMMARY:**
- **Total Files Involved:** 14 files
- **Visual/Styling Files:** 8 files need updates for restyling
- **Logic/Data Files:** 6 files (no visual changes needed)
- **Main Components:** 1 primary + 4 dashboard widgets + 2 utility components
- **Styling System:** 3 CSS files (tokens, theme-map, global)
- **Lines of Code:** ~1,600 total lines across all dashboard-related files

The Dashboard uses a clean separation where visual styling is centralized in the CSS files and theme system, making it relatively straightforward to restyle without touching the business logic files.

---

## **Last Updated**
September 11, 2025
