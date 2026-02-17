# Technical Plan Review: SkiExpert for OpenAI Apps SDK

**Date**: November 6, 2025  
**Reviewer**: AI Technical Architect  
**Status**: Critical Architecture Changes Required

---

## Executive Summary

After thorough review of the technical plan against OpenAI's Apps SDK documentation and design guidelines, **significant architectural changes are required**. The current plan envisions a traditional web application with Vue.js frontend, but OpenAI Apps SDK works fundamentally differently:

- **Apps live INSIDE ChatGPT** - not as separate web applications
- **No traditional frontend framework needed** - ChatGPT renders the UI using its own display modes
- **Backend provides structured responses** - formatted as inline cards, carousels, or fullscreen content
- **Conversational-first design** - not multi-step forms

---

## Critical Issues Identified

### 🚨 ISSUE #1: Frontend Architecture Misunderstanding

**Current Plan:**
- Vue.js 3 with TypeScript
- Pinia state management
- Tailwind CSS
- Vite build tool
- Traditional web UI

**Reality of OpenAI Apps SDK:**
- **NO separate frontend application**
- Apps run INSIDE ChatGPT's interface
- ChatGPT renders all UI using its own display modes:
  - **Inline cards** (single-purpose widgets)
  - **Inline carousels** (multiple options side-by-side)
  - **Fullscreen views** (rich interactive experiences)
  - **Picture-in-picture** (persistent floating windows)
- Your backend provides **structured JSON responses** that ChatGPT renders
- ChatGPT controls all system elements: navigation, composer, chrome, styles

**Required Changes:**
1. **Remove the entire Vue.js frontend** from the architecture
2. Focus on **MCP server implementation** that returns structured responses
3. Design responses to match OpenAI's display mode formats
4. Use ChatGPT's native UI components (not custom web components)

**Reference:** [OpenAI App Design Guidelines - Display Modes](https://developers.openai.com/apps-sdk/concepts/design-guidelines)

---

### 🚨 ISSUE #2: Application Flow Design

**Current Plan:**
- Multi-step form flow with validation
- Vue form libraries
- Separate pages for different steps
- Traditional web app navigation

**Required for OpenAI Apps SDK:**
- **Conversational flow** - users interact through natural language chat
- **No forms** - information gathered through dialogue
- **Context-aware** - ChatGPT maintains conversation state
- **Display modes appear inline** - cards/carousels shown during conversation

**Correct Flow Example:**

```
User: "I want to plan a ski trip to Colorado in January"

ChatGPT calls your MCP tool: search_ski_destinations()
↓
Your MCP server returns structured data
↓
ChatGPT displays inline carousel with 3-5 resort options
Each card shows: image, resort name, price range, key features, "View Details" CTA
↓
User: "Tell me more about Vail"
ChatGPT calls: get_resort_details(resort_id: "vail")
↓
Your MCP server returns detailed info
↓
ChatGPT displays inline card with:
- Resort details
- Available dates highlighted
- "Check Availability" button
↓
User: "Check availability for 4 adults from Jan 15-20"
ChatGPT calls: check_availability()
↓
Conversation continues naturally...
```

**Key Principles:**
- Information collected through **natural conversation**, not forms
- ChatGPT intelligently asks follow-up questions
- User can provide information in any order
- Display modes enhance conversation, don't replace it

---

### 🚨 ISSUE #3: Data Collection Approach

**Current Plan:**
The ski.com form fields are excellent, but the plan doesn't show how to collect them conversationally.

**Ski.com Fields (to integrate):**

**Step 1: Destination**
- `destination` (text)
- `optional_description` (text area)

**Step 2: Dates**
- `dates` (text)
- `dates_flexible` (boolean)

**Step 3: Group Composition**
- `adults_18_plus` (0-8+)
- `seniors_65_plus` (0-8+)
- `children_0_5` (0-8+)
- `children_6_12` (0-8+)
- `children_13_17` (0-8+)

**Step 4: Accommodation**
- Budget: `budget_value`, `budget_midrange`, `budget_luxury`
- Property: `property_hotel`, `property_condo`, `property_chalet`, `property_vacation_rental`
- Room: `room_studio`, `room_1bedroom`, `room_suite`, `room_multiple_rooms`
- Proximity: `ski_in_out`, `walking_distance`, `shuttle_route`, `no_preference`
- Amenities: `hot_tub`, `pool`, `spa`, `kitchen`, `fireplace`, `gym`, `pet_friendly`

**Step 5: Extras**
- `lift_tickets`, `flights`, `transfers`, `rental_car`, `gear_rentals`, `lessons`
- `departure_airport` (if flights selected)

**Step 6: Contact**
- `first_name`, `last_name`, `email`, `phone`
- `consent_contact` (boolean)
- `notes` (textarea)

**Conversational Collection Strategy:**

```typescript
// MCP Server maintains session state
interface TripPlanningSession {
  // Step 1: Destination (collected first or inferred)
  destination?: string;
  destination_description?: string;
  
  // Step 2: Dates (high priority)
  dates?: DateRange;
  dates_flexible?: boolean;
  
  // Step 3: Group (critical for pricing)
  group_composition: {
    adults_18_plus: number;
    seniors_65_plus: number;
    children_0_5: number;
    children_6_12: number;
    children_13_17: number;
  };
  
  // Step 4: Accommodation preferences
  accommodation_preferences: {
    budget: ('value' | 'midrange' | 'luxury')[];
    property_types: string[];
    room_types: string[];
    proximity: string;
    amenities: string[];
  };
  
  // Step 5: Extras
  extras: {
    lift_tickets: boolean;
    flights: boolean;
    transfers: boolean;
    rental_car: boolean;
    gear_rentals: boolean;
    lessons: boolean;
    departure_airport?: string;
  };
  
  // Step 6: Contact (collected at booking time)
  contact?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    consent_contact: boolean;
    notes?: string;
  };
  
  // Tracking
  missing_fields: string[];
  conversation_stage: 'discovery' | 'browsing' | 'booking' | 'confirmed';
}
```

**Conversational Collection Flow:**

1. **Natural Language Parsing**: ChatGPT extracts information from user messages
   - "I want to ski in Vail with my family in January" → extracts destination, date hint, group hint
   
2. **Intelligent Follow-ups**: ChatGPT asks for missing critical info
   - "How many people will be joining you? Any children?"
   - "Do you have specific dates in mind, or are you flexible?"
   
3. **Progressive Disclosure**: Don't overwhelm with all questions at once
   - Ask for essential info first (destination, dates, group size)
   - Gather preferences naturally as conversation progresses
   - Assume sensible defaults where possible
   
4. **Context-Aware Prompts**: Use conversational context
   - If user mentions "beginner", automatically suggest lessons
   - If group has children 6-12, highlight family-friendly resorts
   - If dates are flexible, show best value periods

**Example Natural Flow:**

```
User: "I want to plan a ski trip to Colorado"

ChatGPT: "Great! Colorado has amazing skiing. When are you thinking of going?"

User: "Sometime in January, we're flexible"

[MCP tool captures: destination=Colorado, dates=Jan, flexible=true]

ChatGPT: "Perfect! January is a great time. How many people will be going?"

User: "Me, my wife, and our two kids - they're 8 and 10"

[MCP tool captures: adults_18_plus=2, children_6_12=2]

ChatGPT: "Wonderful! Do your kids have ski experience, or would you like to 
include lessons?"

User: "They're beginners, so yes, lessons would be good"

[MCP tool captures: lessons=true, skill_level=beginner]

ChatGPT calls: search_ski_packages(destination, dates, group, lessons)
↓
Returns 3-5 package options as carousel
Each card shows:
- Resort name + image
- Package overview (lodging + passes + lessons)
- Price range
- "View Details" CTA
```

**Key Strategy:**
- **Don't ask for EVERYTHING upfront** - collect essentials, infer rest
- **Use smart defaults** - most people want hotels, mid-range, reasonable proximity
- **Confirm assumptions** - "I'm assuming you'd prefer mid-range accommodations - is that right?"
- **Allow flexible input** - users might say "we need 2 rooms" instead of specifying room type

---

### 🚨 ISSUE #4: MCP Server Architecture

**Current Plan:**
- Multiple MCP servers (Core, Indy Pass, Generic Resort, Rental Shop)
- Unclear implementation details
- Mentions "need to find .NET library"

**Correct MCP Implementation:**

**MCP (Model Context Protocol) Overview:**
- Protocol for connecting external tools to ChatGPT
- Your backend exposes "tools" that ChatGPT can call
- Tools have defined schemas (input parameters, output format)
- Responses are structured JSON that ChatGPT renders

**Recommended Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│                      ChatGPT                             │
│  (Handles UI rendering, conversation, user interaction)  │
└─────────────────────────────────────────────────────────┘
                          │
                   MCP Protocol
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              SkiExpert MCP Server (.NET)                 │
│                                                           │
│  Exposed Tools (ChatGPT can call these):                 │
│  ┌────────────────────────────────────────────┐         │
│  │ search_ski_destinations(region, dates)     │         │
│  │ get_resort_details(resort_id)              │         │
│  │ check_availability(resort, dates, group)   │         │
│  │ get_package_options(session_id)            │         │
│  │ book_package(package_id, contact_info)     │         │
│  │ get_order_status(order_id)                 │         │
│  │ modify_booking(order_id, changes)          │         │
│  │ cancel_booking(order_id)                   │         │
│  └────────────────────────────────────────────┘         │
│                                                           │
│  Response Formats:                                       │
│  - Inline cards (single items)                          │
│  - Inline carousels (multiple options)                  │
│  - Fullscreen views (detailed content)                  │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Expedia    │  │  Ski Pass    │  │   Rental     │
│     API      │  │  Providers   │  │    Shops     │
└──────────────┘  └──────────────┘  └──────────────┘
```

**MCP Server Implementation (.NET):**

There IS a .NET implementation of MCP. Reference:
- [ModelContextProtocol for .NET](https://github.com/modelcontextprotocol/dotnet-sdk)
- NuGet package: `ModelContextProtocol`

```csharp
// Example MCP Server implementation
using ModelContextProtocol;

public class SkiExpertMcpServer : McpServer
{
    private readonly IBookingService _bookingService;
    private readonly ISessionManager _sessionManager;
    
    public SkiExpertMcpServer()
    {
        // Register tools that ChatGPT can call
        RegisterTool(new SearchDestinationsTool());
        RegisterTool(new CheckAvailabilityTool());
        RegisterTool(new BookPackageTool());
        RegisterTool(new GetOrderStatusTool());
    }
}

// Example tool definition
public class SearchDestinationsTool : McpTool
{
    public override string Name => "search_ski_destinations";
    
    public override string Description => 
        "Search for ski resorts and destinations based on location, dates, and preferences";
    
    public override ToolParameters Parameters => new()
    {
        Properties = new()
        {
            ["region"] = new() { Type = "string", Description = "Region or resort name" },
            ["dates"] = new() { Type = "object", Description = "Date range for trip" },
            ["group_size"] = new() { Type = "integer", Description = "Number of people" },
            ["preferences"] = new() { Type = "object", Description = "Optional preferences" }
        },
        Required = new[] { "region" }
    };
    
    public override async Task<ToolResponse> ExecuteAsync(ToolRequest request)
    {
        // Call your business logic
        var results = await _resortService.SearchAsync(request.Parameters);
        
        // Return structured response for inline carousel
        return new ToolResponse
        {
            DisplayMode = "inline_carousel",
            Content = new CarouselContent
            {
                Items = results.Select(r => new CardItem
                {
                    Image = r.ImageUrl,
                    Title = r.Name,
                    Metadata = new[]
                    {
                        $"{r.SkiableAcres} acres",
                        $"{r.Lifts} lifts",
                        $"From ${r.StartingPrice}/night"
                    },
                    Badge = r.IsPopular ? "Popular" : null,
                    Actions = new[]
                    {
                        new CardAction
                        {
                            Label = "View Details",
                            Type = "tool_call",
                            Tool = "get_resort_details",
                            Parameters = new { resort_id = r.Id }
                        }
                    }
                }).ToList()
            }
        };
    }
}
```

**Tool Response Formats:**

```typescript
// Inline Card Response
{
  "display_mode": "inline_card",
  "content": {
    "title": "Vail Mountain Resort Package",
    "image": "https://...",
    "sections": [
      {
        "heading": "Package Includes",
        "items": [
          "4 nights lodging at Vail Marriott",
          "4-day lift tickets for 4 people",
          "Beginner ski lessons (2 children)",
          "Equipment rentals"
        ]
      },
      {
        "heading": "Pricing",
        "items": ["Total: $4,850", "Per person: $1,212.50"]
      }
    ],
    "actions": [
      {
        "label": "Book Now",
        "type": "tool_call",
        "tool": "book_package",
        "style": "primary"
      },
      {
        "label": "Customize",
        "type": "tool_call",
        "tool": "customize_package"
      }
    ]
  }
}

// Inline Carousel Response (for multiple options)
{
  "display_mode": "inline_carousel",
  "content": {
    "items": [
      {
        "image": "https://...",
        "title": "Value Package - Keystone",
        "metadata": ["4 nights", "Ski-in/out", "$3,200 total"],
        "badge": "Best Value",
        "actions": [{ "label": "Select", "type": "tool_call" }]
      },
      {
        "image": "https://...",
        "title": "Premium Package - Vail",
        "metadata": ["4 nights", "Luxury lodge", "$5,800 total"],
        "badge": "Most Popular",
        "actions": [{ "label": "Select", "type": "tool_call" }]
      }
      // 3-8 items total
    ]
  }
}

// Fullscreen Response (for detailed exploration)
{
  "display_mode": "fullscreen",
  "content": {
    "type": "interactive_map",
    "title": "Colorado Ski Resorts",
    "map_data": {
      "center": [39.6403, -106.3742],
      "markers": [...]
    },
    "side_panel": {
      "title": "Resort Filters",
      "filters": [...]
    }
  }
}
```

---

### ⚠️ ISSUE #5: Display Mode Usage

**Design Guidelines Violations:**

The plan doesn't specify WHEN to use each display mode. Here's the correct usage:

**Inline Cards - Use for:**
- ✅ Single package confirmation (before booking)
- ✅ Order status summary
- ✅ Quick resort overview
- ✅ Booking confirmation

**Inline Carousels - Use for:**
- ✅ 3-8 resort options to choose from
- ✅ Multiple package tiers (Value, Standard, Premium)
- ✅ Available lodging options
- ✅ Lesson schedule options

**Fullscreen - Use for:**
- ✅ Interactive resort map (exploring multiple locations)
- ✅ Detailed package customization
- ✅ Calendar view for date selection with pricing
- ✅ Complete itinerary builder

**Picture-in-Picture - Use for:**
- ✅ Live booking progress tracker
- ✅ Real-time availability counter during high-demand periods
- ⚠️ Probably NOT needed for MVP

**Don't use cards for:**
- ❌ Long-form content (resort descriptions should be concise)
- ❌ Complex multi-step workflows (use conversation + cards)
- ❌ Promotional content or ads
- ❌ Forms with many input fields

---

### ⚠️ ISSUE #6: Compliance Gaps

**OpenAI App Developer Guidelines** require:

1. **Value** ✅ (App provides clear booking value)
2. **Privacy** ⚠️ (Plan mentions GDPR but needs detailed privacy policy for OpenAI review)
3. **Predictability** ⚠️ (Need clear error handling and status communication)
4. **Safety** ⚠️ (Must handle inappropriate requests gracefully)
5. **Accountability** ⚠️ (Need support contact and response SLA)

**Required Additions:**
- Privacy policy specifically for ChatGPT app users
- Clear data handling documentation
- Support email/contact in app metadata
- Error handling that maintains conversation flow
- Graceful degradation when APIs are unavailable

---

## Revised Architecture

### Correct System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ChatGPT                                  │
│         (UI Rendering, Conversation Management)                  │
│                                                                   │
│  Display Modes:                                                  │
│  • Inline cards (single items)                                  │
│  • Inline carousels (multiple options)                          │
│  • Fullscreen views (rich content)                              │
│  • Native composer (always available)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                       MCP Protocol
                       (Tool Calls)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│            SkiExpert MCP Server (.NET 8)                         │
│                  (FastEndpoints + MCP SDK)                       │
│                                                                   │
│  MCP Tools (exposed to ChatGPT):                                │
│  • search_ski_destinations                                      │
│  • get_resort_details                                           │
│  • check_availability                                           │
│  • get_package_options                                          │
│  • customize_package                                            │
│  • book_package                                                 │
│  • get_order_status                                             │
│  • modify_booking                                               │
│  • cancel_booking                                               │
│                                                                   │
│  Session Management:                                             │
│  • Redis-backed session storage                                 │
│  • Track conversation state per user                            │
│  • Store collected trip parameters                              │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ Booking Engine │  │ Payment Service│  │ Notification   │
│                │  │                │  │   Service      │
│ • Aggregation  │  │ • Stripe       │  │ • SendGrid/    │
│ • Pricing      │  │ • Refunds      │  │   Resend       │
│ • Validation   │  │ • Webhooks     │  │ • Email queue  │
└────────────────┘  └────────────────┘  └────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Integration Layer                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Expedia  │ │ Amadeus  │ │Indy Pass │ │ Rentals  │           │
│  │   API    │ │   API    │ │   API    │ │   API    │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer                                    │
│  • SQL Server / PostgreSQL (Orders, Bookings, Users)            │
│  • Redis (Session state, API caching)                           │
└─────────────────────────────────────────────────────────────────┘
```

### Updated Technology Stack

**Backend (ONLY component needed):**
- **Framework**: .NET 8 with FastEndpoints
- **MCP SDK**: `ModelContextProtocol` NuGet package
- **ORM**: Entity Framework Core
- **Caching**: Redis (for session state + API caching)
- **Payments**: Stripe.NET
- **Email**: Resend (recommended) or SendGrid
- **Logging**: Serilog + Application Insights

**Frontend:**
- ❌ **REMOVED** - No Vue.js, no separate frontend
- ✅ **ChatGPT renders all UI** using your MCP responses

**Infrastructure:**
- **Hosting**: Azure Container Apps (for MCP server)
- **Database**: Azure SQL or PostgreSQL
- **Cache**: Azure Redis Cache
- **Monitoring**: Application Insights
- **CI/CD**: GitHub Actions

---

## Revised User Journey

### Discovery Phase

```
User searches Google: "plan a ski trip"
→ Finds SkiExpert via SEO/ads
→ OR finds SkiExpert in ChatGPT app directory
→ Starts conversation in ChatGPT
```

### Conversation Flow

**Stage 1: Initial Discovery**
```
User: "I want to plan a ski trip to Colorado"

ChatGPT (using SkiExpert MCP):
"Exciting! Colorado has incredible skiing. To help you find the perfect trip, 
I have a few questions:
• When are you thinking of going?
• How many people will be joining you?
• Do you have a specific resort in mind, or would you like recommendations?"

User: "Probably January, 4 people - me, my wife, and 2 kids (ages 8 and 10). 
We don't know which resort yet."

[MCP records: dates=Jan, adults=2, children_6_12=2, destination=Colorado]

ChatGPT calls: search_ski_destinations({
  region: "Colorado",
  dates: "January",
  group: { adults: 2, children: 2, child_ages: [8, 10] }
})
```

**Stage 2: Browsing Options**
```
MCP Server returns: Inline Carousel with 5 resorts
↓
ChatGPT displays carousel:

[Card 1]             [Card 2]              [Card 3]
Keystone Resort      Vail Mountain         Breckenridge
[Image]              [Image]               [Image]
• Family-friendly    • Premium experience  • Village atmosphere
• 3,148 acres       • 5,317 acres         • 2,908 acres
• From $3,200       • From $4,850         • From $3,900
[View Details]      [View Details]        [View Details]

User: "Tell me more about Keystone"

ChatGPT calls: get_resort_details({ resort_id: "keystone" })
```

**Stage 3: Package Details**
```
MCP Server returns: Inline Card with resort details
↓
ChatGPT displays card:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Keystone Resort - Family Package
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Resort Image]

Package Includes:
✓ 4 nights at River Run Village
✓ 4-day lift tickets (4 people)
✓ Kids ski lessons (2 children)
✓ Equipment rentals included

Pricing:
Total: $3,245
Per person: $811.25

[Customize Package] [Book Now]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User: "Do the kids' lessons include equipment?"

ChatGPT: "Yes! The kids' ski lessons at Keystone include all equipment 
(skis, boots, poles, helmet) as part of the lesson package. Would you 
like to book this package, or would you prefer to customize anything?"
```

**Stage 4: Booking**
```
User: "Let's book it"

ChatGPT: "Great! To complete your booking, I'll need:
• Your full name
• Email address
• Phone number"

User: "John Smith, john@example.com, 555-1234"

ChatGPT calls: book_package({
  package_id: "keystone_family_jan",
  contact: {
    first_name: "John",
    last_name: "Smith",
    email: "john@example.com",
    phone: "555-1234"
  }
})
↓
MCP Server:
1. Creates order in database (status: PENDING_PAYMENT)
2. Creates Stripe Payment Intent
3. Returns payment link
↓
ChatGPT displays:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking Confirmation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: SKI-2025-0123

Your booking is reserved for 15 minutes.
Total: $3,245.00

[Complete Payment →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User clicks "Complete Payment"
→ Opens Stripe Checkout (inline or new tab)
→ User completes payment
→ Stripe webhook updates order status to CONFIRMED
→ Confirmation email sent
```

**Stage 5: Post-Booking**
```
User receives email:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎿 Your Keystone Ski Trip is Confirmed!

Order ID: SKI-2025-0123

Trip Details:
• Keystone Resort, Colorado
• January 15-19, 2025
• 4 people (2 adults, 2 children)

Included:
✓ 4 nights - River Run Village
  Confirmation: ABC123
✓ 4-day lift tickets (4 people)
  Confirmation: XYZ789
✓ Kids ski lessons - Jan 16 & 17, 9am
  Confirmation: LES456
✓ Equipment rentals

View your full itinerary:
[View Order →]

Need to make changes?
[Modify Booking] [Contact Support]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Later, user can return to ChatGPT:

User: "What's the status of my ski trip booking?"

ChatGPT calls: get_order_status({ order_id: "SKI-2025-0123" })
↓
Displays current status card with trip details
```

---

## Required Changes to Technical Plan

### 1. Remove Frontend Section Entirely

**Delete:**
- Vue.js 3 with TypeScript
- Pinia state management
- Tailwind CSS
- Vite build tool
- All Vue.js-related references

**Replace with:**
- Documentation on MCP response formatting
- Display mode specifications
- Structured data schemas for cards/carousels

### 2. Restructure Core Functionality

**Change from:**
"Trip Planning Conversation" with multi-step form flow

**Change to:**
"Conversational Trip Planning" with intelligent data collection:
- Natural language parsing by ChatGPT
- Progressive disclosure of information needs
- Smart defaults and assumptions
- Context-aware follow-ups

### 3. Update MCP Server Section

**Add:**
- Specific .NET MCP SDK implementation details
- Tool definitions for each capability
- Response format specifications for display modes
- Session management approach
- Error handling in conversational context

### 4. Integrate Ski.com Data Fields

**Add detailed mapping:**
- Which fields are collected when in conversation
- Which fields have smart defaults
- Which fields are optional vs required
- How to handle missing information gracefully

Example:
```typescript
interface DataFieldStrategy {
  field: string;
  collection_timing: 'immediate' | 'progressive' | 'optional';
  collection_method: 'explicit_ask' | 'infer_from_context' | 'default';
  default_value?: any;
  required_for: 'search' | 'booking' | 'neither';
}

const fieldStrategies: DataFieldStrategy[] = [
  {
    field: 'destination',
    collection_timing: 'immediate',
    collection_method: 'explicit_ask',
    required_for: 'search'
  },
  {
    field: 'dates',
    collection_timing: 'immediate',
    collection_method: 'explicit_ask',
    required_for: 'search'
  },
  {
    field: 'group_composition',
    collection_timing: 'immediate',
    collection_method: 'explicit_ask',
    required_for: 'search'
  },
  {
    field: 'budget_tier',
    collection_timing: 'progressive',
    collection_method: 'infer_from_context',
    default_value: 'midrange',
    required_for: 'neither'
  },
  {
    field: 'property_type',
    collection_timing: 'progressive',
    collection_method: 'default',
    default_value: ['hotel', 'condo'],
    required_for: 'neither'
  },
  {
    field: 'amenities',
    collection_timing: 'optional',
    collection_method: 'infer_from_context',
    required_for: 'neither'
  }
  // etc...
];
```

### 5. Update Development Phases

**Phase 1 should focus on:**
- ✅ MCP server setup with basic tools
- ✅ Single display mode (inline cards)
- ✅ One integration (Expedia sandbox)
- ✅ Basic booking flow
- ❌ NO Vue.js frontend development

**Phase 5 should be earlier:**
- ChatGPT/MCP integration is not a late-stage addition
- It's the CORE of the application from day 1
- Should be in Phase 1

### 6. Update Project Structure

**Remove:**
```
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
```

**Add:**
```
├── src/
│   ├── SkiExpert.Mcp/              # NEW: MCP Server implementation
│   │   ├── Tools/                  # MCP tool definitions
│   │   ├── DisplayModes/          # Response formatters
│   │   ├── SessionManagement/     # Conversation state tracking
│   │   └── McpServerHost.cs       # MCP server host
│   ├── SkiExpert.Api/             # API Gateway (for webhooks, admin)
│   ├── SkiExpert.Core/            # Business logic
│   │   ├── Services/
│   │   │   ├── PackageBuilder.cs
│   │   │   ├── PricingEngine.cs
│   │   │   └── AvailabilityChecker.cs
│   │   └── Models/
│   │       ├── TripPlanningSession.cs  # Session state model
│   │       └── SkiComDataFields.cs     # Ski.com field mapping
```

---

## Recommended Next Steps

### Immediate Actions (This Week)

1. **✅ Accept this architectural revision**
   - Acknowledge the fundamental differences
   - Abandon traditional web app thinking
   - Embrace conversational-first design

2. **📚 Study MCP Protocol**
   - Review [ModelContextProtocol .NET SDK](https://github.com/modelcontextprotocol/dotnet-sdk)
   - Understand tool definitions and response formats
   - Review example implementations

3. **🎨 Design Display Mode Responses**
   - Create mockups of inline cards (using OpenAI Figma library)
   - Design carousel layouts for resort options
   - Plan fullscreen experiences (if needed)

4. **💬 Map Conversational Flow**
   - Create conversation trees for different user intents
   - Define when to ask for which information
   - Plan error handling and clarification strategies

5. **🔧 Prototype MCP Server**
   - Create minimal .NET MCP server
   - Implement 1-2 basic tools (search_destinations, get_details)
   - Test with ChatGPT developer tools

### Phase 1 Revised (Weeks 1-6)

**Goal:** Working MCP server with basic search and display

**Deliverables:**
- ✅ .NET 8 MCP server project setup
- ✅ 3 core tools implemented:
  - `search_ski_destinations`
  - `get_resort_details`
  - `check_availability`
- ✅ Inline card and carousel response formatting
- ✅ Expedia Rapid API integration (sandbox)
- ✅ Session state management with Redis
- ✅ Basic database schema for bookings
- ✅ ChatGPT app registration and testing

**Success Criteria:**
- User can search for resorts via ChatGPT
- Results displayed as inline carousel
- User can view resort details as inline card
- Conversation state persists across messages

### Phase 2 Revised (Weeks 7-12)

**Goal:** Complete booking flow with payment

**Deliverables:**
- ✅ Booking tools:
  - `book_package`
  - `get_order_status`
- ✅ Stripe payment integration
- ✅ Order management system
- ✅ Email notifications (Resend)
- ✅ Webhook handling
- ✅ Full ski.com data field collection

**Success Criteria:**
- End-to-end booking works
- Payment processing successful
- Confirmation emails sent
- Order tracking functional

---

## Critical Success Factors

### ✅ Must Have

1. **Conversational-first mindset** - Everything through chat
2. **Proper MCP implementation** - Follows protocol exactly
3. **Structured responses** - Correct display mode formatting
4. **Session state management** - Track conversation context
5. **OpenAI compliance** - Follow all design guidelines
6. **Ski.com data fields** - Capture all necessary information
7. **Payment security** - PCI-compliant Stripe integration

### ⚠️ Watch Out For

1. **Over-engineering** - Don't build a traditional web app
2. **Form thinking** - Resist structured form flows
3. **UI customization** - Can't control ChatGPT's UI rendering
4. **Complex workflows** - Keep interactions simple
5. **Missing context** - Always consider conversation history

### 🎯 Optimization Opportunities

1. **Smart defaults** - Reduce friction by assuming common preferences
2. **Contextual suggestions** - Use conversation context intelligently
3. **Package personalization** - Tailor recommendations to user profile
4. **Proactive assistance** - Suggest relevant add-ons naturally
5. **Follow-up engagement** - Remind users about upcoming trips

---

## Conclusion

The original technical plan demonstrates solid understanding of the business model and integration requirements, but **fundamentally misunderstands OpenAI's Apps SDK architecture**. 

**Key Realizations:**
1. There is NO traditional frontend application
2. ChatGPT renders all UI using its display modes
3. Your backend provides structured JSON responses
4. Conversation flow replaces multi-step forms
5. MCP protocol is the core integration mechanism

**Impact on Timeline:**
- Removing Vue.js frontend saves ~4-6 weeks
- MCP learning curve adds ~2-3 weeks
- Net impact: **2-3 weeks faster to MVP**

**Impact on Cost:**
- No frontend developers needed
- No frontend hosting needed
- No frontend build pipeline needed
- **Significantly lower development cost**

**Impact on UX:**
- Better conversational experience
- Native ChatGPT look and feel
- Faster, more responsive interactions
- Seamless integration with ChatGPT capabilities

---

## Additional Resources

**OpenAI Apps SDK:**
- [App Design Guidelines](https://developers.openai.com/apps-sdk/concepts/design-guidelines)
- [App Developer Guidelines](https://developers.openai.com/apps-sdk/app-developer-guidelines)
- [MCP Server Concepts](https://developers.openai.com/apps-sdk/concepts/design-guidelines)

**MCP Protocol:**
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [.NET SDK Documentation](https://github.com/modelcontextprotocol/dotnet-sdk)

**Design Resources:**
- [OpenAI Figma Component Library](https://www.figma.com/community) - Search for "ChatGPT"

**Similar Examples:**
- Study other booking apps in ChatGPT app directory
- Review conversational commerce patterns
- Analyze travel planning chatbots

---

**Review Status:** COMPLETE  
**Recommended Action:** Accept architectural changes and proceed with revised plan  
**Next Step:** Create detailed MCP tool specifications

---

*This review was conducted based on OpenAI's official Apps SDK documentation and design guidelines. All architectural recommendations align with OpenAI's stated best practices for building ChatGPT apps.*

