# 🚀 Registration System Restructuring Plan

## Overview
Major restructuring to implement:
1. **Month-centric dashboard** as primary interface
2. **Flexible program configuration** with custom pricing options
3. **Template system** for program creation

---

## 🏗️ PHASE 1: Database Schema Analysis & Design

### Current Schema Issues
```sql
-- Current rigid structure
Program {
  fullPrice: number
  halfPrice?: number  
  subscriptionPrice?: number
  venueSplitPercent: number  -- FIXED per program type
  programTypeId: string      -- RIGID connection
  yearId: string
}

Registration {
  fullRegistrations: number    -- HARDCODED pricing types
  halfRegistrations: number
  subscriptionRegistrations: number
  programId: string
  seasonId?: string
  month?: number
}
```

### New Flexible Schema Design

#### 1. Enhanced Programs Table
```sql
Program {
  id: string
  yearId: string
  programTypeId?: string      -- OPTIONAL (for templates)
  
  -- NEW FLEXIBLE FIELDS --
  name: string                -- Custom program name
  sessionDuration: number     -- Hours per session (per program)
  isMonthly: boolean         -- Per program, not just programType
  venueSplitPercent: number  -- Per program customization
  
  -- METADATA --
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 2. New Dynamic Pricing System
```sql
PricingOption {
  id: string
  programId: string
  name: string              -- "Full Season", "Student Rate", etc.
  price: number
  order: number             -- Display order
  isActive: boolean         -- Can disable options
  
  program: Program @relation(fields: [programId])
  registrationEntries: RegistrationEntry[]
}
```

#### 3. Restructured Registration System
```sql
Registration {
  id: string
  programId: string
  seasonId?: string         -- For seasonal programs
  month?: number           -- For monthly programs (1-12)
  
  -- METADATA --
  createdAt: DateTime
  updatedAt: DateTime
  
  program: Program @relation(fields: [programId])
  season?: Season @relation(fields: [seasonId])
  entries: RegistrationEntry[]  -- NEW RELATION
}

RegistrationEntry {
  id: string
  registrationId: string
  pricingOptionId: string
  quantity: number          -- Number of registrations for this pricing
  
  registration: Registration @relation(fields: [registrationId])
  pricingOption: PricingOption @relation(fields: [pricingOptionId])
}
```

#### 4. Template System
```sql
ProgramTemplate {
  id: string
  name: string              -- "U16 Standard Setup"
  description?: string
  
  -- TEMPLATE DATA (JSON or separate fields) --
  programName: string       -- Default name when using template
  sessionDuration: number
  isMonthly: boolean
  venueSplitPercent: number
  
  createdAt: DateTime
  updatedAt: DateTime
  
  -- RELATIONS --
  pricingTemplates: PricingTemplate[]
}

PricingTemplate {
  id: string
  templateId: string
  name: string              -- "Full Season", "Half Season"
  price: number            -- Default price
  order: number
  
  template: ProgramTemplate @relation(fields: [templateId])
}
```

---

## 🎯 PHASE 2: Migration Strategy

### Step 1: Create Migration Scripts
- [ ] Add new columns to existing Program table
- [ ] Create new PricingOption table
- [ ] Create new RegistrationEntry table  
- [ ] Create ProgramTemplate and PricingTemplate tables

### Step 2: Data Migration Scripts
- [ ] Convert existing fullPrice/halfPrice/subscriptionPrice to PricingOptions
- [ ] Convert existing Registration entries to new RegistrationEntry format
- [ ] Create default templates from existing ProgramTypes
- [ ] Preserve all existing data integrity

### Step 3: API Compatibility Layer
- [ ] Maintain old API endpoints during transition
- [ ] Create new API endpoints for new structure
- [ ] Gradual migration path

---

## 🎨 PHASE 3: New UI/UX Design

### Primary Dashboard: Month-Centric View
```
┌─────────────────────────────────────────────────────┐
│  📅 March 2025           ← February | April →       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🌸 SPRING SEASON PROGRAMS                          │
│  ┌─────────────────────────────────────────────────┐│
│  │ U16 Advanced Training                           ││
│  │ Full Season: 12  Half Season: 2                 ││
│  │ [+] [-]          [+] [-]                        ││
│  │ Revenue: 650,000 ISK | Net: 325,000 ISK         ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  📅 MONTHLY PROGRAMS                                │
│  ┌─────────────────────────────────────────────────┐│
│  │ Monthly Pass                                    ││
│  │ Standard: 5      Student: 2                     ││
│  │ [+] [-]          [+] [-]                        ││
│  │ Revenue: 280,000 ISK | Net: 140,000 ISK         ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│  💰 MONTH TOTAL: 930,000 ISK Revenue               │
└─────────────────────────────────────────────────────┘
```

### New Program Creation Flow
```
┌─────────────────────────────────────────────────────┐
│  ➕ Create New Program for 2025                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📋 Load from Template: [Select Template ▼] [Load] │
│                                                     │
│  Program Name: [________________]                   │
│  Duration: [1.5] hours per session                  │
│  Type: ○ Monthly ● Seasonal                        │
│  Venue Split: [50]%                                 │
│                                                     │
│  💰 PRICING OPTIONS                                 │
│  ┌─────────────────────────────────────────────────┐│
│  │ 1. [Full Season        ] [50,000] ISK  [×]      ││
│  │ 2. [Half Season        ] [25,000] ISK  [×]      ││
│  │ 3. [Student Discount   ] [40,000] ISK  [×]      ││
│  └─────────────────────────────────────────────────┘│
│  [+ Add Pricing Option]                             │
│                                                     │
│  [💾 Save as Template] [Create Program] [Cancel]    │
└─────────────────────────────────────────────────────┘
```

---

## ⚙️ PHASE 4: Implementation Phases

### Phase 4A: Database Migration (Week 1)
- [ ] Create new schema files
- [ ] Write migration scripts with rollback capability
- [ ] Test migrations on copy of production data
- [ ] Execute migrations with backup

### Phase 4B: API Layer (Week 2)
- [ ] Build new API endpoints for flexible programs
- [ ] Build new registration endpoints for dynamic pricing
- [ ] Build template management APIs
- [ ] Maintain backward compatibility

### Phase 4C: Core UI Components (Week 3)
- [ ] Month navigation component
- [ ] Flexible program creation form
- [ ] Dynamic pricing entry components
- [ ] Template selection/management UI

### Phase 4D: Dashboard Integration (Week 4)
- [ ] Month-centric main dashboard
- [ ] Quick registration entry interface
- [ ] Financial calculations for new structure
- [ ] Navigation updates

### Phase 4E: Testing & Refinement (Week 5)
- [ ] End-to-end testing with real data scenarios
- [ ] Performance optimization
- [ ] UI/UX polish
- [ ] Documentation updates

---

## 🛡️ Risk Mitigation

### Data Safety
- [ ] Complete database backup before migration
- [ ] Migration rollback procedures
- [ ] Parallel system validation
- [ ] Gradual user migration path

### Functionality Preservation  
- [ ] All existing calculations must work identically
- [ ] All existing data must be accessible
- [ ] Import/export compatibility maintained
- [ ] User workflow continuity

### Performance Considerations
- [ ] Index new table relationships
- [ ] Optimize month-based queries
- [ ] Cache frequently accessed data
- [ ] Monitor query performance

---

## 📊 Success Metrics

### Functionality
- [ ] All existing registrations display correctly
- [ ] Financial calculations match previous results
- [ ] Month navigation works smoothly
- [ ] Template system saves time in program creation

### User Experience
- [ ] Dashboard loads quickly (< 2 seconds)
- [ ] Quick registration entry works intuitively  
- [ ] Program creation is more flexible
- [ ] Overall workflow is faster

---

## 🚨 Rollback Plan

If issues arise:
1. **Database Rollback**: Restore from pre-migration backup
2. **Code Rollback**: Git revert to previous stable version
3. **Hybrid Mode**: Keep old interface available during transition
4. **Data Export**: Ensure data can be exported at any point

---

*This document will be updated as implementation progresses.*
*Last Updated: 2025-08-23*