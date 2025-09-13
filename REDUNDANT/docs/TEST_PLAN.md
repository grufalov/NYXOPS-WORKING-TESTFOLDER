# Test Plan

## Dashboard v2 Layout + Quote Fixes

### 1. Layout Tests

#### XL Breakpoint (≥1280px)
- [ ] Open browser to ≥1280px width
- [ ] Verify 3 KPI cards stack vertically on the left (2 columns)
- [ ] Verify My Desk card takes up remaining space on the right (3 columns)
- [ ] Verify both sections have same height alignment
- [ ] Verify grid maintains proportions at various xl+ widths

#### Mobile/Tablet Breakpoint (<1280px)
- [ ] Resize browser to <1280px width  
- [ ] Verify layout stacks vertically: Quote → KPI cards → My Desk
- [ ] Verify all elements remain readable and functional
- [ ] Test on mobile device viewport

### 2. KPI Functionality Tests

#### Click-through Navigation
- [ ] Click Open Cases card → should navigate to cases tab
- [ ] Click Active Projects card → should navigate to projects tab  
- [ ] Click Roles at Risk card → should navigate to roles-at-risk tab
- [ ] Verify cards maintain hover/scale effects
- [ ] Test keyboard navigation (Tab, Enter, Space)

#### Focus States
- [ ] Tab through KPI cards to verify visible focus rings
- [ ] Verify focus states use outline utilities, not color-only
- [ ] Test screen reader accessibility with cards

### 3. Quote System Tests

#### Single Quote Display
- [ ] Refresh page (F5) → verify only ONE quote appears
- [ ] Verify no flickering or multiple quotes during load
- [ ] Verify quote appears immediately on page load

#### React StrictMode Test
- [ ] Enable React StrictMode in development
- [ ] Refresh multiple times → verify no quote flashing/cycling
- [ ] Verify same quote persists throughout session
- [ ] Open new tab → verify may show different quote
- [ ] Refresh original tab → verify quote remains stable

### 4. My Desk Tests

#### Sticky Header
- [ ] Add enough tasks to trigger scroll in My Desk area
- [ ] Scroll within My Desk list
- [ ] Verify header stays fixed with backdrop blur effect
- [ ] Verify search and "View all" button remain accessible

#### Internal Scrolling  
- [ ] Verify My Desk list scrolls internally within max-h-[520px]
- [ ] Verify main page doesn't scroll when scrolling task list
- [ ] Test scroll behavior on different screen heights

#### Search Results
- [ ] Enter search term in My Desk search box
- [ ] Verify "Showing X of 10" appears next to search box
- [ ] Verify results filter in real-time
- [ ] Test ESC key to clear search

#### Task Interaction
- [ ] Click individual tasks → verify navigation with focus parameter
- [ ] Test keyboard navigation through task list
- [ ] Verify truncation works on long task titles/notes
- [ ] Verify relative timestamps display correctly

### 5. Accessibility Tests

#### Keyboard Navigation
- [ ] Tab through all interactive elements in proper order
- [ ] Verify focus trapping works correctly  
- [ ] Test Enter and Space key activation on buttons/cards
- [ ] Verify focus states are clearly visible

#### Screen Reader
- [ ] Test with screen reader to verify proper element labeling
- [ ] Verify ARIA attributes are present where needed
- [ ] Test loading states announce properly

### 6. Responsive Design Tests

#### Breakpoint Transitions
- [ ] Slowly resize from xl to mobile → verify smooth transitions
- [ ] Test intermediate tablet sizes (768px - 1279px)
- [ ] Verify no horizontal scrolling at any breakpoint
- [ ] Test on actual devices (iPad, iPhone, Android)

#### Content Adaptation
- [ ] Verify text remains readable at all sizes
- [ ] Verify buttons/cards remain tappable on touch devices
- [ ] Test landscape vs portrait orientation on mobile

### Success Criteria

✅ All tests pass
✅ No layout shifts or flickers  
✅ Keyboard navigation works throughout
✅ Quote system shows one stable quote per session
✅ My Desk card provides smooth internal scrolling
✅ Grid layout adapts properly across all breakpoints
