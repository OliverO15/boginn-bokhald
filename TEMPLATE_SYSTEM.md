# 📋 Template System Design

## Overview
The template system allows users to save program configurations and reuse them when creating new programs, reducing setup time and ensuring consistency across years.

---

## 🎯 Design Goals

1. **Time Saving**: Quick program setup from previous configurations
2. **Consistency**: Standardized program structures across years
3. **Flexibility**: Templates are starting points, fully customizable
4. **Organization**: Easy management of template library
5. **Discovery**: Smart suggestions based on usage patterns

---

## 🏗️ Template Structure

### Template Components
```typescript
interface ProgramTemplate {
  id: string
  name: string                 // "U16 Standard Setup"
  description?: string         // "Basic U16 program with common pricing"
  
  // Default program configuration
  programName: string          // "U16 Training" 
  sessionDuration: number      // 1.5 hours
  isMonthly: boolean          // false for seasonal
  venueSplitPercent: number   // 50.0
  
  // Category/Organization
  programTypeId?: string      // Optional grouping
  tags: string[]              // ["archery", "youth", "seasonal"]
  
  // Usage tracking
  usageCount: number          // How often used
  lastUsed: Date             // When last used
  
  // Template pricing structure
  pricingTemplates: PricingTemplate[]
  
  createdAt: Date
  updatedAt: Date
}

interface PricingTemplate {
  id: string
  templateId: string
  name: string                // "Full Season", "Student Rate"
  price: number              // Default price in ISK
  order: number              // Display order
}
```

---

## 🎨 Template Management UI

### Template Library View
```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Program Templates                            [+ New Template] │
├─────────────────────────────────────────────────────────────────┤
│  🔍 Search templates...                    Filter: [All ▼]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🏷️ FREQUENTLY USED                                             │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌──────────────┐│
│  │ U16 Standard ⭐     │ │ Adult Basic ⭐      │ │ Monthly Pass ⭐││
│  │ Used 12 times       │ │ Used 8 times        │ │ Used 15 times││
│  │                     │ │                     │ │              ││
│  │ • Full: 50,000      │ │ • Full: 75,000      │ │ • Standard   ││
│  │ • Half: 25,000      │ │ • Half: 37,500      │ │ • Student    ││
│  │ • Student: 40,000   │ │ • Early: 65,000     │ │ • Premium    ││
│  │                     │ │                     │ │              ││
│  │ 1.5h | Seasonal     │ │ 2h | Seasonal       │ │ 2h | Monthly ││
│  │                     │ │                     │ │              ││
│  │ [Use] [Edit] [...]  │ │ [Use] [Edit] [...]  │ │ [Use] [Edit] ││
│  └─────────────────────┘ └─────────────────────┘ └──────────────┘│
│                                                                 │
│  🗂️ ALL TEMPLATES (18)                                          │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌──────────────┐│
│  │ Foundation Course   │ │ Elite Training      │ │ Kids Summer  ││
│  │ Used 3 times        │ │ Used 1 time         │ │ Used 5 times ││
│  └─────────────────────┘ └─────────────────────┘ └──────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Template Creation/Edit Form
```
┌─────────────────────────────────────────────────────────────────┐
│  ➕ Create New Template                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Template Name: [U16 Advanced Setup_________________]           │
│  Description:   [Advanced U16 program with premium pricing___] │
│                                                                 │
│  📋 DEFAULT PROGRAM SETTINGS                                    │
│  Program Name:  [U16 Advanced Training______________]           │
│  Session Length: [1.5] hours                                   │
│  Type: ○ Monthly ● Seasonal                                    │
│  Venue Split: [50]%                                            │
│                                                                 │
│  🏷️ ORGANIZATION                                                │
│  Category: [U16 Training ▼]                                    │
│  Tags: [youth] [advanced] [+ Add tag]                          │
│                                                                 │
│  💰 DEFAULT PRICING OPTIONS                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 1. [Full Season Premium ] [55,000] ISK  [↕] [×]             ││
│  │ 2. [Half Season Premium ] [30,000] ISK  [↕] [×]             ││
│  │ 3. [Student Discount    ] [45,000] ISK  [↕] [×]             ││
│  │ 4. [Early Bird Special  ] [50,000] ISK  [↕] [×]             ││
│  └─────────────────────────────────────────────────────────────┘│
│  [+ Add Pricing Option]                                         │
│                                                                 │
│  [💾 Save Template] [🖥️ Preview] [❌ Cancel]                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Template Usage Workflows

### Workflow 1: Create Program from Template
```
1. User clicks "Add New Program" for 2025
   ↓
2. Program Creation Form loads
   ┌─────────────────────────────────────────────────────────────────┐
   │  ➕ Create Program for 2025                                     │
   │                                                                 │
   │  📋 Start from Template: [Select Template ▼] [Load Template]    │
   │  ○ Start Fresh                                                  │
   │                                                                 │
   │  Program Name: [________________]                               │
   │  (other fields disabled until template selected or fresh chosen)│
   └─────────────────────────────────────────────────────────────────┘
   ↓
3. User selects template from dropdown
   ↓
4. Form pre-fills with template data (all editable)
   ┌─────────────────────────────────────────────────────────────────┐
   │  ➕ Create Program for 2025                                     │
   │                                                                 │
   │  📋 From Template: "U16 Standard Setup" ✅                      │
   │                                                                 │
   │  Program Name: [U16 Training Spring 2025___] ← editable         │
   │  Session Length: [1.5] hours ← editable                        │
   │  Type: ● Seasonal ○ Monthly ← editable                         │
   │  Venue Split: [50]% ← editable                                 │
   │                                                                 │
   │  💰 PRICING OPTIONS (from template)                             │
   │  1. [Full Season    ] [50,000] ISK  [×]                        │
   │  2. [Half Season    ] [25,000] ISK  [×]                        │
   │  3. [Student Rate   ] [40,000] ISK  [×]                        │
   │  [+ Add Pricing Option]                                         │
   │                                                                 │
   │  [Create Program] [Save as New Template] [Cancel]               │
   └─────────────────────────────────────────────────────────────────┘
   ↓
5. User can modify any fields, add/remove pricing options
   ↓
6. Click "Create Program" to save
```

### Workflow 2: Save Existing Program as Template
```
1. User is editing existing program
   ↓
2. Clicks "Save as Template" button
   ↓
3. Template creation dialog opens
   ┌─────────────────────────────────────────────────────────────────┐
   │  💾 Save "U16 Spring Advanced" as Template                      │
   │                                                                 │
   │  Template Name: [U16 Advanced Setup_____________]               │
   │  Description:   [Advanced U16 program with updated pricing___] │
   │                                                                 │
   │  🔍 PREVIEW                                                     │
   │  Program Name: U16 Training (default)                          │
   │  Duration: 1.75 hours                                          │
   │  Type: Seasonal                                                │
   │  Venue Split: 45%                                              │
   │                                                                 │
   │  Pricing Options:                                               │
   │  • Full Season Premium: 55,000 ISK                             │
   │  • Half Season Premium: 30,000 ISK                             │
   │  • Student Discount: 45,000 ISK                                │
   │                                                                 │
   │  [💾 Save Template] [Cancel]                                    │
   └─────────────────────────────────────────────────────────────────┘
   ↓
4. Template is saved and available for future use
```

---

## 🧠 Smart Template Features

### 1. Auto-Generated Templates
System automatically creates templates from commonly used configurations:
```typescript
// After program is used in 3+ years, suggest making it a template
if (programUsageCount >= 3) {
  suggestTemplateCreation(program)
}
```

### 2. Template Recommendations
When creating programs, show relevant suggestions:
```
┌─────────────────────────────────────────────────────────────────┐
│  💡 SUGGESTED TEMPLATES                                         │
│                                                                 │
│  Based on your previous U16 programs:                           │
│  • U16 Standard Setup (used in 2023, 2024)                     │
│  • U16 Advanced Template (similar pricing structure)            │
│                                                                 │
│  Popular this year:                                             │
│  • Monthly Pass Premium (used by 3 programs this year)          │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Template Versioning
Track template evolution over time:
```typescript
interface TemplateVersion {
  id: string
  templateId: string
  version: number
  changes: string[]        // ["Updated pricing", "Added student discount"]
  createdAt: Date
  isActive: boolean
}
```

### 4. Usage Analytics
```
Template Performance:
┌─────────────────────────────────────────────────────────────────┐
│  📊 U16 Standard Setup                                          │
│                                                                 │
│  Usage: 12 programs created                                     │
│  Success Rate: 92% (11/12 programs still active)               │
│  Avg. Modifications: 2.3 changes per use                       │
│  Most Modified Field: Program Name (100%), Pricing (75%)       │
│                                                                 │
│  Recent Users:                                                  │
│  • 2025 Spring U16 Training (modified pricing)                 │
│  • 2025 U16 Advanced (added premium option)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Template Operations

### Template Categories
```typescript
enum TemplateCategory {
  YOUTH_PROGRAMS = "Youth Programs",
  ADULT_PROGRAMS = "Adult Programs", 
  MONTHLY_PASSES = "Monthly Passes",
  SPECIALTY_COURSES = "Specialty Courses",
  CUSTOM = "Custom"
}
```

### Bulk Template Operations
```
┌─────────────────────────────────────────────────────────────────┐
│  Selected: 3 templates                                          │
│                                                                 │
│  [📋 Duplicate] [🏷️ Add Tags] [📁 Move to Category] [🗑️ Delete] │
│                                                                 │
│  Bulk Actions:                                                  │
│  • Update all pricing by +5%                                    │
│  • Change venue split to 45%                                    │
│  • Add "2025" tag to all                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Template Import/Export
```
Export Templates:
┌─────────────────────────────────────────────────────────────────┐
│  📤 Export Template Library                                     │
│                                                                 │
│  Format: ● JSON ○ CSV ○ Excel                                  │
│  Include: ☑ Usage Statistics ☑ Version History                 │
│                                                                 │
│  [📥 Download] [📧 Email] [☁️ Backup to Cloud]                  │
└─────────────────────────────────────────────────────────────────┘

Import Templates:
┌─────────────────────────────────────────────────────────────────┐
│  📥 Import Templates                                            │
│                                                                 │
│  [📁 Choose File] template_library_2024.json                   │
│                                                                 │
│  Preview: 15 templates found                                    │
│  Conflicts: 2 templates with same name                         │
│                                                                 │
│  Handle Conflicts: ● Rename ○ Overwrite ○ Skip                 │
│                                                                 │
│  [Import Templates] [Cancel]                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Template Selection UI Components

### Template Picker Component
```jsx
<TemplatePicker
  category="youth" // Optional filter
  onSelect={(template) => loadTemplate(template)}
  showPreview={true}
  sortBy="usage" // usage, name, date
  placeholder="Search templates..."
/>
```

### Template Card Component
```jsx
<TemplateCard
  template={template}
  showUsageStats={true}
  actions={["use", "edit", "duplicate", "delete"]}
  onAction={(action, template) => handleAction(action, template)}
/>
```

### Template Quick Actions
```
Hover/Right-click menu on template card:
┌─────────────────────┐
│ 🎯 Use Template     │
│ ✏️ Edit Template    │
│ 📋 Duplicate        │
│ 🏷️ Add Tags        │
│ ──────────────────  │
│ 📊 View Statistics  │
│ 📤 Export           │
│ ──────────────────  │
│ 🗑️ Delete Template  │
└─────────────────────┘
```

---

## 📊 Template Data Migration

### From Current System
1. **Convert ProgramTypes** → Basic Templates
2. **Analyze Programs** → Identify common patterns
3. **Create Standard Templates** → From most-used configurations
4. **Migrate Pricing** → Convert to pricing templates

### Migration Script
```sql
-- Create templates from existing program patterns
INSERT INTO program_templates (name, program_name, session_duration, is_monthly, venue_split_percent)
SELECT 
    pt.name || ' Standard Template' as name,
    pt.name as program_name,
    pt.session_hours as session_duration,
    pt.is_monthly,
    50.0 as venue_split_percent
FROM program_types pt;

-- Create pricing templates from most common pricing patterns
INSERT INTO pricing_templates (template_id, name, price, "order")
SELECT 
    t.id,
    'Full Price',
    AVG(p.full_price)::integer,
    0
FROM program_templates t
JOIN program_types pt ON t.program_name = pt.name
JOIN programs p ON p.program_type_id = pt.id
GROUP BY t.id;
```

---

## 🔍 Search & Filtering

### Advanced Template Search
```
Search Features:
• Text search: Name, description, tags
• Pricing range: Min/max price filters
• Type filter: Seasonal vs Monthly
• Usage filter: Frequently used, Recent, Never used
• Date filter: Created date range
• Category filter: Youth, Adult, Monthly, etc.
```

### Search Interface
```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 [Advanced Template Search________________] [Search] [Clear]  │
│                                                                 │
│  Filters:                                                       │
│  Type: [All ▼]  Category: [All ▼]  Price: [Min___] - [Max___]  │
│  Usage: [All ▼]  Created: [Any Date ▼]  Tags: [youth] [×]      │
│                                                                 │
│  Sort by: [Most Used ▼] ↑↓                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Performance & Storage

### Caching Strategy
- **Template library**: Cache for 1 hour
- **Individual templates**: Cache for 30 minutes
- **Search results**: Cache for 5 minutes
- **Usage statistics**: Cache for 1 day

### Storage Optimization
- **Compress template data** for large libraries
- **Lazy load pricing templates** until needed
- **Index commonly searched fields**
- **Archive unused templates** after 2+ years

---

## 🧪 Testing Strategy

### Template System Tests
1. **Create template** from blank form
2. **Create template** from existing program
3. **Load template** and modify fields
4. **Search/filter** template library
5. **Bulk operations** on multiple templates
6. **Import/export** template data
7. **Version management** and rollback
8. **Usage statistics** accuracy

### Performance Tests
- **Template library** loads < 1 second
- **Template selection** applies < 500ms
- **Search results** return < 300ms
- **Bulk operations** complete < 5 seconds

---

## 🚀 Implementation Phases

### Phase 1: Core Template System
- [ ] Template database schema
- [ ] Basic template CRUD operations
- [ ] Template creation from programs
- [ ] Template application to new programs

### Phase 2: Template Library UI
- [ ] Template management interface
- [ ] Search and filtering
- [ ] Template cards and preview
- [ ] Bulk operations

### Phase 3: Smart Features
- [ ] Usage analytics
- [ ] Template recommendations
- [ ] Auto-template suggestions
- [ ] Version management

### Phase 4: Advanced Features
- [ ] Import/export functionality
- [ ] Template sharing
- [ ] Advanced search
- [ ] Performance optimizations

---

*The template system transforms program creation from manual setup to configuration-based workflow, significantly reducing time and errors while maintaining full flexibility.*