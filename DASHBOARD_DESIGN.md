# 📊 Month-Centric Dashboard Design

## Overview
The new dashboard will be the primary interface, optimized for quick registration entry during the current month/season. This replaces the current program-first navigation with a time-first approach.

---

## 🎯 Design Goals

1. **Speed**: Quick registration entry for current month
2. **Context**: Clear view of what season/month we're in
3. **Overview**: Financial snapshot at a glance
4. **Navigation**: Easy month-to-month navigation
5. **Efficiency**: Minimize clicks for common tasks

---

## 📱 Layout Structure

### Header: Month Navigation
```
┌─────────────────────────────────────────────────────────────────┐
│  🏹 Boginn Bókhald                              [Settings] [?]  │
├─────────────────────────────────────────────────────────────────┤
│  ← Feb 2025    📅 MARCH 2025 - SPRING SEASON    Apr 2025 →     │
│                     Today: March 15, 2025                       │
└─────────────────────────────────────────────────────────────────┘
```

### Main Content: Program Cards Grid
```
┌─────────────────────────────────────────────────────────────────┐
│  🌸 SPRING SEASON PROGRAMS                                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌──────────────┐│
│  │ U16 Advanced        │ │ Adult Training      │ │ Kids Program ││
│  │ Spring 2025         │ │ Spring 2025         │ │ Spring 2025  ││
│  │                     │ │                     │ │              ││
│  │ Full Season: 13 [±] │ │ Full Season: 8  [±] │ │ Full: 12 [±] ││
│  │ Half Season: 1  [±] │ │ Half Season: 2  [±] │ │ Half: 3  [±] ││
│  │ Student Rate: 0 [±] │ │ Early Bird: 5   [±] │ │              ││
│  │                     │ │                     │ │              ││
│  │ 💰 675,000 ISK      │ │ 💰 950,000 ISK      │ │ 💰 450,000   ││
│  │ 🏢 337,500 ISK      │ │ 🏢 475,000 ISK      │ │ 🏢 225,000   ││
│  │ 📊 337,500 ISK      │ │ 📊 475,000 ISK      │ │ 📊 225,000   ││
│  │                     │ │                     │ │              ││
│  │        [Details]    │ │        [Details]    │ │   [Details]  ││
│  └─────────────────────┘ └─────────────────────┘ └──────────────┘│
│                                                                 │
│  📅 MONTHLY PROGRAMS                                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐ ┌─────────────────────┐                │
│  │ Monthly Pass        │ │ Foundation Course   │                │
│  │ March 2025          │ │ March 2025          │                │
│  │                     │ │                     │                │
│  │ Standard: 5     [±] │ │ Beginner: 8     [±] │                │
│  │ Student: 2      [±] │ │ Advanced: 2     [±] │                │
│  │                     │ │                     │                │
│  │ 💰 280,000 ISK      │ │ 💰 320,000 ISK      │                │
│  │ 🏢 140,000 ISK      │ │ 🏢 160,000 ISK      │                │
│  │ 📊 140,000 ISK      │ │ 📊 160,000 ISK      │                │
│  │                     │ │                     │                │
│  │        [Details]    │ │        [Details]    │                │
│  └─────────────────────┘ └─────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

### Footer: Monthly Summary
```
┌─────────────────────────────────────────────────────────────────┐
│  💰 MARCH 2025 TOTALS                                           │
│  Revenue: 2,675,000 ISK | Venue Costs: 1,337,500 ISK           │
│  Net Profit: 1,337,500 ISK (50% margin)                        │
│                                                                 │
│  [📊 Detailed Report] [📈 Year Comparison] [⚙️ Manage Programs] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎛️ Interactive Elements

### Quick Registration Controls
Each program card has inline +/- buttons for immediate registration changes:

```
Full Season: 13 [➖] [13] [➕]
```

- **Click +/-**: Immediate increment/decrement
- **Type in number**: Direct entry
- **Auto-save**: Changes save immediately
- **Visual feedback**: Brief animation on change

### Program Card States

#### Active Program (has registrations)
```
┌─────────────────────┐
│ U16 Advanced ✅     │ <- Green indicator
│ Spring 2025         │
│ Full Season: 13 [±] │
│ Half Season: 1  [±] │
│ 💰 675,000 ISK      │
│ 📊 337,500 ISK      │
│        [Details]    │
└─────────────────────┘
```

#### Inactive Program (no registrations)
```
┌─────────────────────┐
│ Adult Evening ⚪     │ <- Gray indicator
│ Spring 2025         │
│ Full Season: 0  [±] │
│ Half Season: 0  [±] │
│ 💰 0 ISK            │
│ 📊 0 ISK            │
│        [Details]    │
└─────────────────────┘
```

#### Template/Not Set Up
```
┌─────────────────────┐
│ ➕ Add Program      │
│                     │
│   Click to create   │
│   a new program     │
│   for this month    │
│                     │
│     [+ Create]      │
└─────────────────────┘
```

---

## 📱 Responsive Design

### Desktop (1200px+)
- 3-4 program cards per row
- Full sidebar with quick stats
- Detailed tooltips on hover

### Tablet (768px - 1199px)
- 2 program cards per row
- Collapsible sidebar
- Touch-friendly buttons

### Mobile (< 768px)
- 1 program card per row
- Bottom navigation
- Swipe gestures for month navigation
- Simplified card layout:

```
┌─────────────────────┐
│ U16 Advanced        │
│ Spring 2025         │
│                     │
│ Full: 13 [➖➕]      │
│ Half: 1  [➖➕]      │
│                     │
│ 💰 675,000 ISK      │
│ [Details] [Edit]    │
└─────────────────────┘
```

---

## 🎨 Visual Design System

### Colors
- **Primary**: Blue (#3B82F6) - Action buttons, navigation
- **Success**: Green (#10B981) - Revenue, active programs
- **Warning**: Orange (#F59E0B) - Venue costs
- **Error**: Red (#EF4444) - Losses, alerts
- **Neutral**: Gray (#6B7280) - Text, borders

### Icons
- 💰 Revenue
- 🏢 Venue costs (Bogfimisetrið split)
- 📊 Net profit
- 🌸 Spring season
- ☀️ Summer season  
- 🍂 Fall season
- 📅 Monthly programs
- ✅ Active programs
- ⚪ Inactive programs

### Typography
- **Header**: Inter 24px Bold
- **Program Name**: Inter 18px Medium
- **Numbers**: Roboto Mono 16px (for alignment)
- **Body**: Inter 14px Regular

---

## 🚀 Key Features

### 1. Smart Month Detection
- Automatically opens to current month
- Shows relevant season for seasonal programs
- Highlights "today" in navigation

### 2. One-Click Registration Entry
- No forms, no modals for simple changes
- Immediate visual feedback
- Undo functionality (Ctrl+Z)

### 3. Financial Preview
- Real-time calculation updates
- Color-coded profit margins
- Comparison to previous months

### 4. Contextual Actions
```
Right-click on program card:
┌─────────────────────┐
│ Edit Program        │
│ View Details        │
│ Duplicate to Month  │
│ ────────────────    │
│ Archive Program     │
└─────────────────────┘
```

### 5. Bulk Operations
```
Select multiple programs → Bulk Actions:
┌─────────────────────┐
│ Apply to All Months │
│ Export Data         │
│ Print Summary       │
│ ────────────────    │
│ Archive Selected    │
└─────────────────────┘
```

---

## 📊 Dashboard Widgets

### Month Navigation Widget
```
┌─────────────────────┐
│  📅 Quick Jump      │
│  ○ Jan  ● Mar  ○ May│
│  ○ Feb  ○ Apr  ○ Jun│
│                     │
│  🎯 Go to Today     │
└─────────────────────┘
```

### Financial Summary Widget
```
┌─────────────────────┐
│  💰 March Summary   │
│  Revenue: 2.67M ISK │
│  Profit:  1.34M ISK │
│  Margin:  50%       │
│                     │
│  📈 +15% vs Feb     │
└─────────────────────┘
```

### Recent Activity Widget
```
┌─────────────────────┐
│  📝 Recent Changes  │
│  U16: +2 Full (3m)  │
│  Adult: -1 Half(5m) │
│  Monthly: +3(10m)   │
│                     │
│  [View All]         │
└─────────────────────┘
```

---

## 🎯 User Workflows

### Primary Workflow: Update Registrations
1. **Land on dashboard** → Current month auto-selected
2. **See program cards** → Immediate context of current registrations  
3. **Click +/-** → Update registration numbers
4. **See financial impact** → Real-time calculation updates
5. **Done** → No save button needed

### Secondary Workflow: Review Previous Month
1. **Click previous month** → Navigate to February
2. **Review numbers** → See what was registered
3. **Compare to current** → Mental note of trends
4. **Return to current** → Click current month or "Today"

### Setup Workflow: Start of Year/Season
1. **Navigate to year view** → Annual program management
2. **Create/edit programs** → Set up pricing options
3. **Return to dashboard** → Ready for registration entry

---

## 🔄 State Management

### URL Structure
```
/dashboard                    → Current month
/dashboard/2025/03           → Specific month  
/dashboard/2025/03?season=spring → Month + season context
```

### Local State
- Current month/year
- Temporary registration changes (before auto-save)
- UI preferences (card size, layout)
- Recently viewed months

### Server State (React Query)
- Month registrations data
- Program configurations
- Financial calculations
- User activity log

---

## ⚡ Performance Optimizations

### Data Loading
- **Preload**: Current + adjacent months
- **Lazy load**: Financial calculations
- **Cache**: Static program data
- **Debounce**: Auto-save after 500ms of inactivity

### UI Optimizations  
- **Virtualized**: Large program lists
- **Memoized**: Financial calculations
- **Throttled**: Hover effects
- **Progressive**: Load cards as they come into view

---

## 🧪 Testing Strategy

### User Acceptance Tests
1. **New user** can immediately understand current month status
2. **Returning user** can quickly update registrations
3. **Month navigation** works intuitively
4. **Financial calculations** update correctly
5. **Mobile experience** is fully functional

### Performance Tests
- **Load time**: < 2 seconds for initial dashboard
- **Interaction**: < 100ms for +/- button response
- **Navigation**: < 500ms month transitions
- **Auto-save**: < 1 second after last change

---

*This design prioritizes the primary use case: quick registration updates during current operations, while maintaining easy access to historical data and program management.*