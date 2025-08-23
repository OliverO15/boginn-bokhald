# 🚀 New Flexible API Design

## Overview
API endpoints to support the month-centric dashboard, flexible program management, and dynamic pricing system.

---

## 📅 Dashboard & Month-Centric APIs

### GET /api/dashboard/[year]/[month]
Get all data needed for month-centric dashboard.

**Response:**
```json
{
  "month": 3,
  "year": 2025,
  "monthName": "March",
  "currentSeason": {
    "id": "season-id",
    "name": "Spring 2025",
    "startDate": "2025-01-15T00:00:00Z",
    "endDate": "2025-04-30T00:00:00Z"
  },
  "programs": {
    "seasonal": [
      {
        "id": "program-id",
        "name": "U16 Advanced Training",
        "sessionDuration": 1.5,
        "venueSplitPercent": 50.0,
        "pricingOptions": [
          {
            "id": "pricing-id-1",
            "name": "Full Season",
            "price": 50000,
            "order": 0
          },
          {
            "id": "pricing-id-2", 
            "name": "Half Season",
            "price": 25000,
            "order": 1
          }
        ],
        "registration": {
          "id": "reg-id",
          "entries": [
            {
              "pricingOptionId": "pricing-id-1",
              "quantity": 13,
              "subtotal": 650000
            },
            {
              "pricingOptionId": "pricing-id-2",
              "quantity": 1,
              "subtotal": 25000
            }
          ],
          "totalRevenue": 675000,
          "venueCosts": 337500,
          "netProfit": 337500
        }
      }
    ],
    "monthly": [
      {
        "id": "monthly-program-id",
        "name": "Monthly Pass",
        "sessionDuration": 2.0,
        "venueSplitPercent": 50.0,
        "pricingOptions": [
          {
            "id": "monthly-pricing-id-1",
            "name": "Standard",
            "price": 61500,
            "order": 0
          },
          {
            "id": "monthly-pricing-id-2",
            "name": "Student",
            "price": 45000,
            "order": 1
          }
        ],
        "registration": {
          "id": "monthly-reg-id",
          "entries": [
            {
              "pricingOptionId": "monthly-pricing-id-1",
              "quantity": 5,
              "subtotal": 307500
            }
          ],
          "totalRevenue": 307500,
          "venueCosts": 153750,
          "netProfit": 153750
        }
      }
    ]
  },
  "totals": {
    "revenue": 982500,
    "venueCosts": 491250,
    "netProfit": 491250,
    "marginPercent": 50.0
  }
}
```

### GET /api/dashboard/[year]/[month]/summary
Get financial summary only for a month (lightweight).

**Response:**
```json
{
  "month": 3,
  "year": 2025,
  "revenue": 982500,
  "venueCosts": 491250,
  "netProfit": 491250,
  "marginPercent": 50.0,
  "programCount": 5,
  "totalRegistrations": 19
}
```

### POST /api/dashboard/quick-update
Quick registration update from dashboard.

**Request:**
```json
{
  "registrationId": "reg-id",
  "pricingOptionId": "pricing-id-1",
  "quantity": 14,
  "operation": "set" // or "increment", "decrement"
}
```

**Response:**
```json
{
  "success": true,
  "registration": {
    "id": "reg-id",
    "entries": [...],
    "totalRevenue": 700000,
    "venueCosts": 350000,
    "netProfit": 350000
  },
  "monthTotals": {
    "revenue": 1007500,
    "venueCosts": 503750,
    "netProfit": 503750
  }
}
```

---

## 🏗️ Flexible Program Management APIs

### GET /api/programs/[programId]
Get full program details with pricing options.

**Response:**
```json
{
  "id": "program-id",
  "name": "U16 Advanced Training",
  "yearId": "year-id",
  "year": {
    "id": "year-id",
    "year": 2025
  },
  "programTypeId": "program-type-id",
  "programType": {
    "id": "program-type-id",
    "name": "U16 Training"
  },
  "sessionDuration": 1.5,
  "isMonthly": false,
  "venueSplitPercent": 50.0,
  "pricingOptions": [
    {
      "id": "pricing-id-1",
      "name": "Full Season",
      "price": 50000,
      "order": 0,
      "isActive": true
    },
    {
      "id": "pricing-id-2",
      "name": "Half Season",
      "price": 25000,
      "order": 1,
      "isActive": true
    }
  ],
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-15T00:00:00Z"
}
```

### POST /api/programs
Create a new flexible program.

**Request:**
```json
{
  "yearId": "year-id",
  "programTypeId": "program-type-id", // Optional, for categorization
  "name": "U16 Spring Advanced",
  "sessionDuration": 1.5,
  "isMonthly": false,
  "venueSplitPercent": 50.0,
  "pricingOptions": [
    {
      "name": "Full Season",
      "price": 50000,
      "order": 0
    },
    {
      "name": "Half Season", 
      "price": 25000,
      "order": 1
    },
    {
      "name": "Student Discount",
      "price": 40000,
      "order": 2
    }
  ]
}
```

### PUT /api/programs/[programId]
Update program details and pricing options.

**Request:**
```json
{
  "name": "U16 Elite Training",
  "sessionDuration": 2.0,
  "venueSplitPercent": 45.0,
  "pricingOptions": [
    {
      "id": "pricing-id-1", // Existing - update
      "name": "Full Season Premium",
      "price": 55000,
      "order": 0
    },
    {
      "name": "Early Bird Special", // New - create
      "price": 42000,
      "order": 1
    },
    {
      "id": "pricing-id-2", // Existing but not included - delete
      "isActive": false
    }
  ]
}
```

### POST /api/programs/[programId]/pricing-options
Add new pricing option to existing program.

**Request:**
```json
{
  "name": "Late Registration",
  "price": 60000,
  "order": 3
}
```

### PUT /api/pricing-options/[optionId]
Update individual pricing option.

**Request:**
```json
{
  "name": "Super Early Bird",
  "price": 38000,
  "order": 1,
  "isActive": true
}
```

### DELETE /api/pricing-options/[optionId]
Soft delete pricing option (sets isActive: false).

---

## 📋 Template System APIs

### GET /api/templates
Get all program templates.

**Response:**
```json
{
  "templates": [
    {
      "id": "template-id-1",
      "name": "U16 Standard Setup",
      "description": "Standard U16 program with common pricing",
      "programName": "U16 Training",
      "sessionDuration": 1.5,
      "isMonthly": false,
      "venueSplitPercent": 50.0,
      "programType": {
        "id": "program-type-id",
        "name": "U16 Training"
      },
      "pricingTemplates": [
        {
          "id": "pricing-template-id-1",
          "name": "Full Season",
          "price": 50000,
          "order": 0
        },
        {
          "id": "pricing-template-id-2",
          "name": "Half Season",
          "price": 25000,
          "order": 1
        }
      ],
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/templates
Create new program template.

**Request:**
```json
{
  "name": "Adult Premium Setup",
  "description": "High-end adult program template",
  "programName": "Adult Elite Training",
  "sessionDuration": 2.0,
  "isMonthly": false,
  "venueSplitPercent": 45.0,
  "programTypeId": "adult-type-id",
  "pricingTemplates": [
    {
      "name": "Premium Full",
      "price": 85000,
      "order": 0
    },
    {
      "name": "Premium Half",
      "price": 45000,
      "order": 1
    }
  ]
}
```

### POST /api/programs/from-template
Create program from template.

**Request:**
```json
{
  "templateId": "template-id-1",
  "yearId": "year-id",
  "overrides": {
    "name": "U16 Spring 2025",
    "sessionDuration": 1.75,
    "pricingOptions": [
      {
        "name": "Full Season",
        "price": 52000 // Override template price
      }
    ]
  }
}
```

### GET /api/programs/[programId]/save-as-template
Create template from existing program.

**Response:**
```json
{
  "templateId": "new-template-id",
  "name": "U16 Advanced Template (Auto-saved)",
  "message": "Template created successfully"
}
```

---

## 📊 Registration & Financial APIs

### POST /api/registrations/flexible
Create registration with flexible pricing entries.

**Request:**
```json
{
  "programId": "program-id",
  "seasonId": "season-id", // For seasonal programs
  "month": null, // For monthly programs
  "entries": [
    {
      "pricingOptionId": "pricing-id-1",
      "quantity": 13
    },
    {
      "pricingOptionId": "pricing-id-2",
      "quantity": 1
    }
  ]
}
```

### PUT /api/registrations/[registrationId]/entries
Update registration entries.

**Request:**
```json
{
  "entries": [
    {
      "id": "entry-id-1", // Existing entry - update
      "quantity": 14
    },
    {
      "pricingOptionId": "pricing-id-3", // New entry - create
      "quantity": 2
    }
  ]
}
```

### GET /api/registrations/[registrationId]/calculate
Get financial calculations for registration.

**Response:**
```json
{
  "registrationId": "reg-id",
  "breakdown": [
    {
      "pricingOptionName": "Full Season",
      "quantity": 13,
      "price": 50000,
      "subtotal": 650000
    },
    {
      "pricingOptionName": "Half Season",
      "quantity": 1,
      "price": 25000,
      "subtotal": 25000
    }
  ],
  "totals": {
    "revenue": 675000,
    "venueCosts": 337500,
    "netProfit": 337500,
    "marginPercent": 50.0
  }
}
```

---

## 🔄 Migration & Compatibility APIs

### GET /api/migration/status
Check migration status and compatibility.

**Response:**
```json
{
  "isFlexibleSystem": true,
  "migrationDate": "2025-01-01T00:00:00Z",
  "legacyDataCount": 0,
  "flexibleDataCount": 156
}
```

### POST /api/migration/convert-legacy
Convert legacy registration data to flexible format.

**Request:**
```json
{
  "registrationId": "legacy-reg-id"
}
```

### GET /api/compatibility/legacy-calculations
Get calculations in both old and new format for validation.

**Response:**
```json
{
  "registrationId": "reg-id",
  "legacy": {
    "revenue": 675000,
    "venueCosts": 337500,
    "netProfit": 337500
  },
  "flexible": {
    "revenue": 675000,
    "venueCosts": 337500,
    "netProfit": 337500
  },
  "matches": true
}
```

---

## 📈 Analytics & Reporting APIs

### GET /api/analytics/month-comparison
Compare months for trends.

**Query Parameters:**
- `months`: `2025-02,2025-03,2025-04`
- `metrics`: `revenue,profit,registrations`

**Response:**
```json
{
  "comparison": [
    {
      "month": "2025-02",
      "revenue": 850000,
      "profit": 425000,
      "registrations": 15
    },
    {
      "month": "2025-03", 
      "revenue": 982500,
      "profit": 491250,
      "registrations": 19
    }
  ],
  "trends": {
    "revenue": "+15.6%",
    "profit": "+15.6%", 
    "registrations": "+26.7%"
  }
}
```

### GET /api/analytics/program-performance
Get program performance metrics.

**Response:**
```json
{
  "programs": [
    {
      "id": "program-id",
      "name": "U16 Advanced",
      "metrics": {
        "totalRevenue": 2025000,
        "avgRegistrationsPerMonth": 14,
        "profitMargin": 50.0,
        "seasonalTrend": "growing"
      }
    }
  ]
}
```

---

## 🔒 Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "INVALID_PRICING_OPTION",
    "message": "Pricing option does not belong to this program",
    "details": {
      "pricingOptionId": "invalid-id",
      "programId": "program-id"
    },
    "timestamp": "2025-01-01T12:00:00Z"
  }
}
```

### Common Error Codes
- `PROGRAM_NOT_FOUND`: Program doesn't exist
- `INVALID_PRICING_OPTION`: Pricing option invalid for program
- `DUPLICATE_REGISTRATION`: Registration already exists for this period
- `TEMPLATE_NOT_FOUND`: Template doesn't exist
- `MIGRATION_REQUIRED`: Operation requires system migration
- `CALCULATION_ERROR`: Financial calculation failed

---

## ⚡ Performance Considerations

### Caching Strategy
- **Program data**: Cache for 5 minutes
- **Financial calculations**: Cache for 30 seconds
- **Templates**: Cache for 1 hour
- **Dashboard data**: Cache per month for 1 minute

### Pagination
- Programs: 50 per page
- Templates: 20 per page
- Registration entries: No limit (typically small)

### Rate Limiting
- Dashboard updates: 100 requests per minute
- Program creation: 10 requests per minute
- Template operations: 20 requests per minute

---

## 🚀 Implementation Priority

### Phase 1: Core APIs
1. Dashboard month-centric endpoints
2. Flexible program CRUD
3. Registration with dynamic pricing

### Phase 2: Template System
1. Template CRUD operations
2. Program creation from templates
3. Save program as template

### Phase 3: Analytics & Migration
1. Financial calculations
2. Legacy compatibility
3. Analytics and reporting

---

*This API design supports the complete flexible program management system while maintaining backward compatibility during migration.*