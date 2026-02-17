# SkiExpert Technical Plan
## AI-Powered Ski Trip Planning Application for ChatGPT

**Version:** 2.0  
**Date:** November 6, 2025  
**Status:** Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [User Experience & Journey](#user-experience--journey)
5. [Data Collection Strategy](#data-collection-strategy)
6. [MCP Server Implementation](#mcp-server-implementation)
7. [API Integrations](#api-integrations)
8. [Database Design](#database-design)
9. [Payment & Notifications](#payment--notifications)
10. [Development Phases](#development-phases)
11. [Project Structure](#project-structure)
12. [Compliance & Security](#compliance--security)
13. [Success Metrics](#success-metrics)
14. [Risk Management](#risk-management)

---

## Executive Summary

### Business Model

SkiExpert is a specialized travel agent application focused exclusively on mountain ski trips, operating as a **ChatGPT app**. The platform generates revenue through commissions on:
- Lodging bookings (via Expedia/Amadeus)
- Ski pass sales (Ikon, Epic, Indy)
- Ski lessons
- Equipment rentals

**Target Metrics:**
- Average Booking Value: $1,500
- Peak Season (Dec-March): 25 bookings/day
- Off-Season: 7 bookings/day

### Technical Approach

SkiExpert is built as a **conversational application** that lives inside ChatGPT, using the **Model Context Protocol (MCP)** to expose booking capabilities. 

**Key Architecture Principles:**
- ✅ Backend-only application (.NET MCP Server)
- ✅ ChatGPT handles all UI rendering
- ✅ Conversational data collection (no forms)
- ✅ Structured JSON responses formatted as inline cards/carousels

**What We're NOT Building:**
- ❌ Separate web application
- ❌ React/Vue.js frontend
- ❌ Multi-step form flows
- ❌ Custom UI/UX

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ChatGPT Platform                        │
│                                                              │
│  • Handles conversation flow                                │
│  • Renders UI (cards, carousels, fullscreen)               │
│  • Manages user interactions                                │
│  • Calls MCP tools based on user intent                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                  MCP Protocol
                  (Tool Calls)
                         │
┌────────────────────────▼────────────────────────────────────┐
│              SkiExpert MCP Server (.NET 8)                  │
│                                                              │
│  Exposed Tools:                                             │
│  ┌────────────────────────────────────────────────┐        │
│  │  search_ski_destinations                       │        │
│  │  get_resort_details                            │        │
│  │  check_availability                            │        │
│  │  get_package_options                           │        │
│  │  customize_package                             │        │
│  │  book_package                                  │        │
│  │  get_order_status                              │        │
│  │  modify_booking                                │        │
│  │  cancel_booking                                │        │
│  └────────────────────────────────────────────────┘        │
│                                                              │
│  Core Services:                                             │
│  • Session Management (Redis)                              │
│  • Response Formatters (Display Modes)                     │
│  • Authentication & Authorization                          │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Business Logic Layer                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Package    │  │   Pricing    │  │   Booking    │     │
│  │   Builder    │  │   Engine     │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Payment    │  │ Notification │  │  Validation  │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  API Integration Layer                       │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Expedia  │  │ Amadeus  │  │   Indy   │  │  Rental  │   │
│  │   API    │  │   API    │  │   Pass   │  │   Shops  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐                                │
│  │  Stripe  │  │  Resend  │                                │
│  │ Payments │  │  Email   │                                │
│  └──────────┘  └──────────┘                                │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      Data Layer                              │
│                                                              │
│  ┌─────────────────────────────────────────────┐           │
│  │  SQL Server / PostgreSQL                    │           │
│  │  • Orders, Bookings, Users                  │           │
│  │  • Audit logs, Analytics                    │           │
│  └─────────────────────────────────────────────┘           │
│  ┌─────────────────────────────────────────────┐           │
│  │  Redis Cache                                │           │
│  │  • Session state                            │           │
│  │  • API response caching                     │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **MCP Server Pattern**
   - Single .NET application exposing MCP tools
   - RESTful endpoints for MCP protocol
   - Stateless tool execution with Redis-backed sessions

2. **Display Modes**
   - **Inline Cards**: Single items (package details, confirmations)
   - **Inline Carousels**: Multiple options (resort choices, package tiers)
   - **Fullscreen**: Rich experiences (interactive maps, itinerary builders)

3. **Session Management**
   - Redis-backed conversation state
   - Tracks collected user preferences
   - Expires after 30 minutes of inactivity

4. **Error Handling**
   - Graceful degradation when APIs unavailable
   - Conversational error messages
   - Automatic retries for transient failures

---

## Technology Stack

### Backend (Primary Application)

**Framework & Runtime:**
- .NET 8.0
- C# 12
- FastEndpoints (minimal API framework)
- Model Context Protocol SDK (`ModelContextProtocol` NuGet package)

**Data Access:**
- Entity Framework Core 8
- SQL Server or PostgreSQL
- Redis (StackExchange.Redis)

**Integration:**
- Stripe.NET (payment processing)
- Resend or SendGrid SDK (email)
- Custom HTTP clients for travel APIs

**Logging & Monitoring:**
- Serilog (structured logging)
- Application Insights (Azure monitoring)
- OpenTelemetry (distributed tracing)

**Testing:**
- xUnit (unit tests)
- Moq (mocking)
- Testcontainers (integration tests)

### Infrastructure

**Hosting:**
- Azure Container Apps (MCP server)
- Azure SQL Database or Azure Database for PostgreSQL
- Azure Redis Cache

**CI/CD:**
- GitHub Actions
- Docker containerization
- Azure Container Registry

**Monitoring:**
- Application Insights
- Azure Monitor
- Log Analytics

### Frontend

**ChatGPT (Provided by OpenAI)**
- No custom frontend development required
- ChatGPT renders all UI based on our structured responses
- We control content structure, ChatGPT controls presentation

---

## User Experience & Journey

### Discovery

Users discover SkiExpert through:
1. **ChatGPT App Directory** - Primary discovery method
2. **Search queries** - "plan a ski trip", "book ski vacation"
3. **Direct marketing** - SEO, content marketing, paid ads
4. **Word of mouth** - User recommendations

### Complete User Journey

#### Stage 1: Initial Conversation

```
User: "I want to plan a ski trip to Colorado"

ChatGPT (SkiExpert activated):
"Exciting! I'd love to help you plan your Colorado ski trip. 
To find the perfect options, I need a few details:

• When are you planning to go?
• How many people will be joining you?"

User: "Probably mid-January, and there will be 4 of us - me, my 
wife, and our 2 kids who are 8 and 10"

[SkiExpert captures:
 - destination: "Colorado"
 - dates: "mid-January" (flexible)
 - adults: 2
 - children_6_12: 2
 - inferred: family_vacation, likely needs lessons]
```

#### Stage 2: Browsing Options

```
ChatGPT calls: search_ski_destinations({
  region: "Colorado",
  dates: "mid-January 2025",
  group: { adults: 2, children: 2, ages: [8, 10] }
})

SkiExpert returns: Inline carousel with 5 family-friendly resorts

ChatGPT displays:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Here are some excellent family-friendly options in Colorado:

[Keystone]          [Breckenridge]      [Copper Mountain]
Family-friendly     Village charm       Great value
3,148 acres        2,908 acres         2,490 acres  
From $811/person   From $975/person    From $750/person
[View Details]     [View Details]      [View Details]

All packages include lodging, lift tickets, and can add lessons.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User: "Tell me more about Keystone"
```

#### Stage 3: Package Details

```
ChatGPT calls: get_resort_details({ resort_id: "keystone" })

ChatGPT displays inline card:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Keystone Resort - Family Package
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Resort Image]

Perfect for families learning to ski!

Package Includes:
✓ 4 nights at River Run Village
  • 1-bedroom condo with kitchen
  • Walking distance to slopes
  
✓ 4-day lift tickets (4 people)

✓ Beginner ski lessons (2 days)
  • Kids group lessons (ages 8 & 10)
  • Adult group lessons
  • All equipment included

✓ Equipment rentals (2 additional days)
  • Skis, boots, poles, helmets

Dates: January 15-19, 2025

Pricing:
• Total: $3,245
• Per person: $811.25

[Customize Package] [Book Now]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User: "This looks perfect! Book it"
```

#### Stage 4: Booking

```
ChatGPT: "Great choice! To complete your booking, I need:
• Your full name
• Email address  
• Phone number

Your information is secure and only used for booking confirmation."

User: "John Smith, john@email.com, 555-123-4567"

ChatGPT calls: book_package({
  package_id: "keystone_family_2025_jan15",
  contact: {
    first_name: "John",
    last_name: "Smith", 
    email: "john@email.com",
    phone: "555-123-4567"
  }
})

SkiExpert creates:
1. Order in database (PENDING_PAYMENT)
2. Stripe Payment Intent
3. Returns payment link

ChatGPT displays:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: SKI-2025-0123

Keystone Family Package
January 15-19, 2025
4 people

Your reservation is held for 15 minutes.
Total: $3,245.00

[Complete Payment →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User clicks payment button → Stripe Checkout opens
```

#### Stage 5: Post-Booking

```
After successful payment:

1. Stripe webhook updates order to CONFIRMED
2. SkiExpert sends confirmation email
3. ChatGPT shows confirmation card

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Booking Confirmed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: SKI-2025-0123

Your Keystone ski trip is booked! Check your 
email (john@email.com) for complete details 
and confirmations.

Trip Details:
📅 January 15-19, 2025
👨‍👩‍👧‍👦 4 people
🏔️ Keystone Resort, Colorado

Need to make changes?
[View Full Itinerary] [Contact Support]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

Later, user returns:

User: "What's the status of my Keystone trip?"

ChatGPT calls: get_order_status({ query: "Keystone" })

Displays current order status and details
```

### Conversation Patterns

**Natural Language Processing:**
- ChatGPT extracts intent and entities from user messages
- SkiExpert tools receive structured parameters
- Tools return structured responses
- ChatGPT presents responses conversationally

**Context Awareness:**
- Conversation history maintained by ChatGPT
- Session state stored in Redis by SkiExpert
- Smart follow-ups based on previous exchanges

**Progressive Disclosure:**
- Essential info collected first (where, when, who)
- Preferences gathered as conversation evolves
- Defaults assumed and confirmed

---

## Data Collection Strategy

### Complete Session State Model

```typescript
interface TripPlanningSession {
  // Metadata
  session_id: string;
  user_id?: string;
  created_at: Date;
  conversation_stage: 'discovery' | 'browsing' | 'customizing' | 'booking' | 'confirmed';
  
  // Essential Data (collected immediately)
  destination: {
    primary_destination?: string;      // "Vail", "Colorado"
    destination_type?: 'resort' | 'region' | 'country';
    user_description?: string;         // "good for beginners"
  };
  
  dates: {
    start_date?: Date;
    end_date?: Date;
    date_range_text?: string;         // "mid-January"
    flexible: boolean;
    flexibility_days?: number;
  };
  
  group_composition: {
    adults_18_plus: number;
    seniors_65_plus: number;
    children_0_5: number;
    children_6_12: number;
    children_13_17: number;
  };
  
  // Progressive Data (collected as needed)
  accommodation_preferences: {
    budget_tier: 'value' | 'midrange' | 'luxury';
    property_types: string[];          // ['hotel', 'condo']
    room_setup: string;                // 'studio', '1bedroom', 'multiple'
    proximity: 'ski_in_out' | 'walking' | 'shuttle' | 'no_preference';
    amenities: {
      hot_tub?: boolean;
      pool?: boolean;
      spa?: boolean;
      kitchen?: boolean;
      fireplace?: boolean;
      gym?: boolean;
      pet_friendly?: boolean;
    };
  };
  
  extras: {
    lift_tickets: boolean;            // Default: true
    flights: boolean;                 // Default: false
    transfers: boolean;
    rental_car: boolean;
    gear_rentals: boolean;
    lessons: boolean;
    departure_airport?: string;
  };
  
  // Booking Data (collected at checkout)
  contact_info?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    consent_contact: boolean;
    notes?: string;
  };
  
  // Inferred Data
  inferred: {
    skill_level?: 'beginner' | 'intermediate' | 'advanced';
    trip_purpose?: 'family' | 'romantic' | 'group' | 'solo';
    budget_range?: { min: number; max: number; };
  };
}
```

### Data Collection Principles

**1. Essential First (Immediate Collection)**
- Destination
- Approximate dates
- Group size and composition

**2. Progressive Disclosure**
- Budget preferences (infer from choices)
- Accommodation details (smart defaults)
- Amenities (ask only if relevant)

**3. Smart Defaults**
- Budget: Midrange unless specified
- Property: Hotel or condo (most common)
- Lift tickets: Included by default
- Equipment: Include if skill level suggests beginner

**4. Contextual Inference**
- "Learning to ski" → beginner, needs lessons & rentals
- "Family with young kids" → family-friendly resorts
- "Experienced skiers" → no lessons, advanced terrain

**5. Confirmation Strategy**
- State assumptions clearly
- Allow easy corrections
- Confirm before booking

### Example Collection Flows

**Beginner Family:**
```
User: "We've never skied before and want to try it with our kids"

Captured immediately:
- skill_level: beginner
- extras.lessons: true
- extras.gear_rentals: true
- trip_purpose: family

ChatGPT: "Wonderful! Skiing is amazing. I'll focus on beginner-friendly 
resorts with great lesson programs. When are you hoping to go, and how 
many kids?"
```

**Experienced Group:**
```
User: "Looking for challenging terrain, 6 experienced adults"

Captured immediately:
- skill_level: advanced
- adults_18_plus: 6
- extras.lessons: false
- extras.gear_rentals: false (assume own equipment)

ChatGPT: "Great! I'll find resorts with advanced terrain. Do you have 
dates in mind?"
```

**Budget-Conscious:**
```
User: "We're on a tight budget but really want to ski"

Captured immediately:
- budget_tier: value
- amenities: minimal

ChatGPT: "I'll focus on the best value options. Where would you like to 
go, and when?"
```

---

## MCP Server Implementation

### Tool Definitions

#### 1. search_ski_destinations

**Purpose:** Search for ski resorts based on location, dates, and group

**Parameters:**
```json
{
  "region": "string (optional)",
  "dates": "string (optional)",
  "group": {
    "adults": "integer",
    "children": "integer",
    "child_ages": "array<integer>"
  },
  "preferences": {
    "skill_level": "beginner|intermediate|advanced",
    "budget_tier": "value|midrange|luxury",
    "family_friendly": "boolean"
  }
}
```

**Response:** Inline carousel with 3-8 resort options

**C# Implementation:**
```csharp
public class SearchDestinationsTool : McpTool
{
    public override string Name => "search_ski_destinations";
    
    public override string Description => 
        "Search for ski resorts and destinations. Returns lodging " +
        "and package options based on location, dates, group size, " +
        "and preferences. Focuses on beginner-friendly resorts when " +
        "appropriate.";
    
    public override async Task<ToolResponse> ExecuteAsync(ToolRequest request)
    {
        var searchParams = ParseSearchParams(request);
        var resorts = await _resortService.SearchAsync(searchParams);
        
        return new ToolResponse
        {
            DisplayMode = "inline_carousel",
            Content = FormatResortCarousel(resorts)
        };
    }
}
```

#### 2. get_resort_details

**Purpose:** Get detailed information about a specific resort

**Parameters:**
```json
{
  "resort_id": "string (required)",
  "session_context": "object (optional)"
}
```

**Response:** Inline card with resort details and package options

#### 3. check_availability

**Purpose:** Check real-time availability and pricing

**Parameters:**
```json
{
  "resort_id": "string (required)",
  "start_date": "date (required)",
  "end_date": "date (required)",
  "group": "object (required)"
}
```

**Response:** Inline card or carousel with available packages

#### 4. get_package_options

**Purpose:** Generate package options (value, standard, premium)

**Parameters:**
```json
{
  "resort_id": "string (required)",
  "dates": "object (required)",
  "group": "object (required)",
  "preferences": "object (optional)"
}
```

**Response:** Inline carousel with 3 package tiers

#### 5. customize_package

**Purpose:** Modify a package (add/remove items, change options)

**Parameters:**
```json
{
  "package_id": "string (required)",
  "modifications": {
    "add_items": "array<string>",
    "remove_items": "array<string>",
    "change_lodging": "object",
    "change_dates": "object"
  }
}
```

**Response:** Inline card with updated package

#### 6. book_package

**Purpose:** Create booking and initiate payment

**Parameters:**
```json
{
  "package_id": "string (required)",
  "contact_info": {
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone": "string"
  },
  "notes": "string (optional)"
}
```

**Response:** Inline card with payment link

#### 7. get_order_status

**Purpose:** Retrieve order information

**Parameters:**
```json
{
  "order_id": "string (optional)",
  "email": "string (optional)",
  "query": "string (optional)"
}
```

**Response:** Inline card with order details

#### 8. modify_booking

**Purpose:** Change existing booking

**Parameters:**
```json
{
  "order_id": "string (required)",
  "modifications": "object (required)"
}
```

**Response:** Inline card with updated booking

#### 9. cancel_booking

**Purpose:** Cancel booking and process refund

**Parameters:**
```json
{
  "order_id": "string (required)",
  "reason": "string (optional)"
}
```

**Response:** Inline card with cancellation confirmation

### Response Format Standards

**Inline Card Structure:**
```json
{
  "display_mode": "inline_card",
  "content": {
    "title": "string",
    "image": "url",
    "sections": [
      {
        "heading": "string",
        "items": ["string", "string"]
      }
    ],
    "actions": [
      {
        "label": "string",
        "type": "tool_call",
        "tool": "string",
        "parameters": {},
        "style": "primary|secondary"
      }
    ]
  }
}
```

**Inline Carousel Structure:**
```json
{
  "display_mode": "inline_carousel",
  "content": {
    "items": [
      {
        "image": "url",
        "title": "string",
        "metadata": ["string", "string"],
        "badge": "string (optional)",
        "actions": [
          {
            "label": "string",
            "type": "tool_call",
            "tool": "string",
            "parameters": {}
          }
        ]
      }
    ]
  }
}
```

### Session Management

**Redis Key Structure:**
```
session:{session_id} → TripPlanningSession object (JSON)
session:{session_id}:expiry → 30 minutes TTL
user:{user_id}:sessions → List of active sessions
```

**Session Lifecycle:**
```csharp
public class SessionManager
{
    private readonly IDistributedCache _cache;
    
    public async Task<TripPlanningSession> GetOrCreateSession(string sessionId)
    {
        var key = $"session:{sessionId}";
        var json = await _cache.GetStringAsync(key);
        
        if (json == null)
        {
            var session = new TripPlanningSession
            {
                SessionId = sessionId,
                CreatedAt = DateTime.UtcNow,
                ConversationStage = "discovery"
            };
            await SaveSession(session);
            return session;
        }
        
        return JsonSerializer.Deserialize<TripPlanningSession>(json);
    }
    
    public async Task SaveSession(TripPlanningSession session)
    {
        var key = $"session:{session.SessionId}";
        var json = JsonSerializer.Serialize(session);
        
        await _cache.SetStringAsync(key, json, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30)
        });
    }
}
```

---

## API Integrations

### 1. Expedia Rapid API

**Purpose:** Primary lodging inventory

**Authentication:**
- Method: SHA-512 signature authentication
- Header: `Authorization: EAN APIKey={key},Signature={hash},timestamp={ts}`

**Key Endpoints:**
- `POST /properties/search` - Search accommodations
- `GET /properties/{id}/content` - Property details
- `POST /bookings` - Create reservation
- `GET /bookings/{id}` - Retrieve booking
- `DELETE /bookings/{id}` - Cancel booking

**Implementation:**
```csharp
public class ExpediaRapidService : ILodgingProvider
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    
    public async Task<List<LodgingOption>> SearchAsync(LodgingSearchRequest request)
    {
        var signature = GenerateSignature(request);
        
        var response = await _httpClient.PostAsync(
            "/properties/search",
            new StringContent(JsonSerializer.Serialize(request)),
            headers: new { Authorization = $"EAN {signature}" }
        );
        
        return await ParseResponse<List<LodgingOption>>(response);
    }
    
    private string GenerateSignature(object request)
    {
        var apiKey = _config["Expedia:ApiKey"];
        var secret = _config["Expedia:Secret"];
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        
        var message = $"{apiKey}{timestamp}{JsonSerializer.Serialize(request)}";
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(message));
        
        return Convert.ToBase64String(hash);
    }
}
```

**Commission:** 8-15% per booking (varies by property and partnership tier)

### 2. Amadeus Self-Service APIs

**Purpose:** Alternative lodging, flights, car rentals

**Authentication:**
- Method: OAuth 2.0
- Token endpoint: `POST /v1/security/oauth2/token`

**Key APIs:**
- Hotel Search API
- Flight Offers Search API
- Car Rental API
- Airport/City Search API

**Implementation:**
```csharp
public class AmadeusService : IFlightProvider
{
    private readonly HttpClient _httpClient;
    private readonly AmadeusTokenService _tokenService;
    
    public async Task<List<FlightOption>> SearchFlightsAsync(FlightSearchRequest request)
    {
        var token = await _tokenService.GetAccessTokenAsync();
        
        _httpClient.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", token);
        
        var response = await _httpClient.GetAsync(
            $"/v2/shopping/flight-offers?{BuildQueryString(request)}"
        );
        
        return await ParseFlightOffers(response);
    }
}
```

**Pricing:** Free tier available, pay-per-call after quota

### 3. Indy Pass Integration

**Priority:** High (leverage personal connection)

**Approach:**
1. Direct outreach to owner for API access
2. Custom integration agreement
3. Dedicated MCP tools if needed

**Endpoints Needed:**
- Pass availability
- Pass purchase/booking
- Lesson booking
- Order status

**Implementation Strategy:**
```csharp
public class IndyPassService : ISkiPassProvider
{
    public async Task<List<PassOption>> GetAvailablePassesAsync(
        string resortId, 
        DateRange dates)
    {
        // Custom integration based on API provided by Indy Pass
        // Will vary based on their system
    }
    
    public async Task<BookingConfirmation> BookPassAsync(PassBookingRequest request)
    {
        // Direct booking through their system
        // May require custom authentication
    }
}
```

**Commission:** To be negotiated (typically 5-10% for ski passes)

### 4. Ikon Pass / Epic Pass

**Status:** Research required

**Approach:**
1. Contact partner relations teams
2. Apply for developer API access
3. Alternative: Affiliate program if no API available

**Note:** May not have public APIs; backup plan is referral links with commission tracking

### 5. Individual Ski Resorts

**Approach:**
- Direct partnerships with top 50-100 resorts
- Many use common platforms (Inntopia, RealPage, etc.)
- Build generic adapter pattern

**Generic Resort Adapter:**
```csharp
public interface IResortService
{
    Task<ResortInfo> GetInfoAsync(string resortId);
    Task<List<LiftTicketOption>> GetTicketOptionsAsync(string resortId, DateRange dates);
    Task<List<LessonOption>> GetLessonOptionsAsync(string resortId, LessonRequest request);
}

public class ResortServiceFactory
{
    public IResortService GetService(string resortId)
    {
        // Return appropriate service based on resort's booking system
        return resortId switch
        {
            var id when id.StartsWith("indy_") => new IndyPassResortService(),
            var id when id.StartsWith("ikon_") => new IkonResortService(),
            _ => new GenericResortService()
        };
    }
}
```

### 6. Equipment Rental Integration

**Challenge:** Fragmented market with different systems

**Phase 1 (MVP):** Partner Portal Approach
- Provide rental shops with booking portal
- Shops manually confirm bookings
- Email notifications to shop

**Phase 2:** API Integration
- Integrate with shops that have APIs
- Build connectors for common POS systems
- Consider aggregator partnerships (SkiButler, etc.)

**Implementation:**
```csharp
public interface IRentalShopService
{
    Task<List<RentalShop>> SearchShopsAsync(string location);
    Task<List<EquipmentOption>> GetAvailableEquipmentAsync(
        int shopId, 
        DateRange dates,
        List<EquipmentType> types);
    Task<RentalBooking> CreateBookingAsync(RentalBookingRequest request);
}

// Phase 1: Manual confirmation
public class PortalBasedRentalService : IRentalShopService
{
    public async Task<RentalBooking> CreateBookingAsync(RentalBookingRequest request)
    {
        // Create booking in our system as PENDING
        var booking = await _bookingRepo.CreateAsync(request);
        
        // Send email to rental shop for confirmation
        await _emailService.SendRentalConfirmationRequestAsync(booking);
        
        return booking;
    }
}

// Phase 2: API integration
public class ApiBasedRentalService : IRentalShopService
{
    public async Task<RentalBooking> CreateBookingAsync(RentalBookingRequest request)
    {
        // Direct API booking
        var response = await _rentalApiClient.BookAsync(request);
        return MapToRentalBooking(response);
    }
}
```

---

## Database Design

### Core Tables

**Users**
```sql
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    PhoneNumber NVARCHAR(20),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    INDEX IX_Users_Email (Email)
);
```

**Orders**
```sql
CREATE TABLE Orders (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderId NVARCHAR(50) NOT NULL UNIQUE,  -- User-facing: SKI-2025-0123
    UserId UNIQUEIDENTIFIER NOT NULL,
    Status NVARCHAR(50) NOT NULL,  -- PendingPayment, Confirmed, InProgress, Completed, Cancelled
    TotalAmount DECIMAL(10,2) NOT NULL,
    Currency NVARCHAR(3) NOT NULL DEFAULT 'USD',
    StripePaymentIntentId NVARCHAR(255),
    SessionData NVARCHAR(MAX),  -- JSON of TripPlanningSession
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    INDEX IX_Orders_OrderId (OrderId),
    INDEX IX_Orders_UserId (UserId),
    INDEX IX_Orders_Status (Status),
    INDEX IX_Orders_CreatedAt (CreatedAt)
);
```

**OrderItems**
```sql
CREATE TABLE OrderItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderId UNIQUEIDENTIFIER NOT NULL,
    ItemType NVARCHAR(50) NOT NULL,  -- Lodging, SkiPass, Rental, Lesson, Flight
    ItemName NVARCHAR(255) NOT NULL,
    ProviderId NVARCHAR(100),  -- External provider identifier
    ProviderOrderId NVARCHAR(255),  -- Order ID from provider
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL,
    Status NVARCHAR(50) NOT NULL,  -- Pending, Confirmed, Cancelled, Refunded
    Metadata NVARCHAR(MAX),  -- JSON for provider-specific data
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (OrderId) REFERENCES Orders(Id),
    INDEX IX_OrderItems_OrderId (OrderId),
    INDEX IX_OrderItems_ItemType (ItemType)
);
```

**LodgingBookings**
```sql
CREATE TABLE LodgingBookings (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderItemId UNIQUEIDENTIFIER NOT NULL,
    Provider NVARCHAR(50) NOT NULL,  -- Expedia, Amadeus
    PropertyId NVARCHAR(100) NOT NULL,
    PropertyName NVARCHAR(255) NOT NULL,
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    GuestCount INT NOT NULL,
    RoomType NVARCHAR(100),
    ConfirmationNumber NVARCHAR(100),
    CancellationPolicy NVARCHAR(MAX),
    ProviderMetadata NVARCHAR(MAX),  -- JSON
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (OrderItemId) REFERENCES OrderItems(Id),
    INDEX IX_LodgingBookings_CheckInDate (CheckInDate)
);
```

**SkiPassBookings**
```sql
CREATE TABLE SkiPassBookings (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderItemId UNIQUEIDENTIFIER NOT NULL,
    Provider NVARCHAR(50) NOT NULL,  -- Ikon, Epic, Indy, Resort
    ResortId NVARCHAR(100) NOT NULL,
    ResortName NVARCHAR(255) NOT NULL,
    PassType NVARCHAR(100) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    PassHolderCount INT NOT NULL,
    ConfirmationNumber NVARCHAR(100),
    ProviderMetadata NVARCHAR(MAX),  -- JSON
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (OrderItemId) REFERENCES OrderItems(Id)
);
```

**RentalBookings**
```sql
CREATE TABLE RentalBookings (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderItemId UNIQUEIDENTIFIER NOT NULL,
    ShopId NVARCHAR(100) NOT NULL,
    ShopName NVARCHAR(255) NOT NULL,
    EquipmentType NVARCHAR(100) NOT NULL,  -- Skis, Snowboard, Package
    EquipmentDetails NVARCHAR(MAX),  -- JSON
    RentalStartDate DATE NOT NULL,
    RentalEndDate DATE NOT NULL,
    RenterCount INT NOT NULL,
    ConfirmationNumber NVARCHAR(100),
    ProviderMetadata NVARCHAR(MAX),  -- JSON
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (OrderItemId) REFERENCES OrderItems(Id)
);
```

**LessonBookings**
```sql
CREATE TABLE LessonBookings (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderItemId UNIQUEIDENTIFIER NOT NULL,
    ResortId NVARCHAR(100) NOT NULL,
    ResortName NVARCHAR(255) NOT NULL,
    LessonType NVARCHAR(50) NOT NULL,  -- Private, Group
    SkillLevel NVARCHAR(50) NOT NULL,  -- Beginner, Intermediate, Advanced
    LessonDate DATE NOT NULL,
    LessonTime TIME,
    DurationHours DECIMAL(3,1),
    ParticipantCount INT NOT NULL,
    ParticipantAges NVARCHAR(255),  -- JSON array
    InstructorName NVARCHAR(100),
    ConfirmationNumber NVARCHAR(100),
    ProviderMetadata NVARCHAR(MAX),  -- JSON
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (OrderItemId) REFERENCES OrderItems(Id)
);
```

**EmailNotifications**
```sql
CREATE TABLE EmailNotifications (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderId UNIQUEIDENTIFIER NOT NULL,
    EmailType NVARCHAR(50) NOT NULL,  -- OrderConfirmation, StatusUpdate, Reminder, Cancellation
    RecipientEmail NVARCHAR(255) NOT NULL,
    Subject NVARCHAR(500) NOT NULL,
    Body NVARCHAR(MAX) NOT NULL,
    SentAt DATETIME2,
    SendAttempts INT NOT NULL DEFAULT 0,
    LastError NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (OrderId) REFERENCES Orders(Id),
    INDEX IX_EmailNotifications_OrderId (OrderId),
    INDEX IX_EmailNotifications_SentAt (SentAt)
);
```

**OrderStatusHistory**
```sql
CREATE TABLE OrderStatusHistory (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderId UNIQUEIDENTIFIER NOT NULL,
    PreviousStatus NVARCHAR(50),
    NewStatus NVARCHAR(50) NOT NULL,
    ChangedBy NVARCHAR(100),  -- System, Admin, User
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (OrderId) REFERENCES Orders(Id),
    INDEX IX_OrderStatusHistory_OrderId (OrderId)
);
```

### Entity Framework Core Configuration

```csharp
public class SkiExpertDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<LodgingBooking> LodgingBookings { get; set; }
    public DbSet<SkiPassBooking> SkiPassBookings { get; set; }
    public DbSet<RentalBooking> RentalBookings { get; set; }
    public DbSet<LessonBooking> LessonBookings { get; set; }
    public DbSet<EmailNotification> EmailNotifications { get; set; }
    public DbSet<OrderStatusHistory> OrderStatusHistory { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure entities
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SkiExpertDbContext).Assembly);
        
        // Global query filters
        modelBuilder.Entity<Order>().HasQueryFilter(o => !o.IsDeleted);
    }
}
```

---

## Payment & Notifications

### Stripe Payment Processing

**Flow:**
1. User confirms booking
2. Create Stripe Payment Intent
3. Return payment link to ChatGPT
4. User completes payment via Stripe Checkout
5. Webhook confirms payment
6. Update order status to CONFIRMED
7. Send confirmation email

**Implementation:**
```csharp
public class StripePaymentService : IPaymentService
{
    private readonly StripeClient _stripeClient;
    private readonly IOrderRepository _orderRepo;
    
    public async Task<PaymentIntent> CreatePaymentIntentAsync(Order order)
    {
        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(order.TotalAmount * 100), // Convert to cents
            Currency = "usd",
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
            {
                Enabled = true
            },
            Metadata = new Dictionary<string, string>
            {
                { "order_id", order.OrderId },
                { "user_id", order.UserId.ToString() }
            }
        };
        
        var service = new PaymentIntentService(_stripeClient);
        var paymentIntent = await service.CreateAsync(options);
        
        // Update order with payment intent ID
        order.StripePaymentIntentId = paymentIntent.Id;
        await _orderRepo.UpdateAsync(order);
        
        return paymentIntent;
    }
    
    public async Task HandleWebhookAsync(string payload, string signature)
    {
        var webhookEvent = EventUtility.ConstructEvent(
            payload,
            signature,
            _config["Stripe:WebhookSecret"]
        );
        
        switch (webhookEvent.Type)
        {
            case "payment_intent.succeeded":
                await HandlePaymentSucceededAsync(webhookEvent);
                break;
            case "payment_intent.payment_failed":
                await HandlePaymentFailedAsync(webhookEvent);
                break;
            case "charge.refunded":
                await HandleRefundAsync(webhookEvent);
                break;
        }
    }
}
```

### Email Notification System

**Email Templates:**

1. **Order Confirmation** - Sent after payment success
2. **Booking Reminder** - 7 days before trip
3. **Status Updates** - When order status changes
4. **Cancellation Confirmation** - When booking cancelled

**Implementation (Resend):**
```csharp
public class EmailService : INotificationService
{
    private readonly ResendClient _resend;
    private readonly IEmailNotificationRepo _notificationRepo;
    
    public async Task SendOrderConfirmationAsync(Order order)
    {
        var template = await BuildOrderConfirmationTemplate(order);
        
        var message = new EmailMessage
        {
            From = "bookings@skiexpert.com",
            To = order.User.Email,
            Subject = $"Your Ski Trip is Confirmed! (Order {order.OrderId})",
            Html = template.Html,
            Text = template.Text
        };
        
        try
        {
            var result = await _resend.SendEmailAsync(message);
            
            await _notificationRepo.CreateAsync(new EmailNotification
            {
                OrderId = order.Id,
                EmailType = "OrderConfirmation",
                RecipientEmail = order.User.Email,
                Subject = message.Subject,
                Body = message.Html,
                SentAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send order confirmation for {OrderId}", order.OrderId);
            // Queue for retry
            await QueueEmailForRetryAsync(order.Id, "OrderConfirmation");
        }
    }
}
```

---

## Development Phases

### Phase 1: MCP Foundation (Weeks 1-6)

**Goal:** Working ChatGPT app with basic search functionality

**Week 1-2: Project Setup**
- Create .NET solution structure
- Set up MCP server with FastEndpoints
- Configure Azure resources (Container Apps, SQL, Redis)
- Set up CI/CD pipeline

**Week 3-4: Core MCP Tools**
- Implement `search_ski_destinations` (with mock data)
- Implement `get_resort_details` (with mock data)
- Build response formatters (inline card, carousel)
- Set up Redis session management

**Week 5: Basic Integration**
- Integrate Expedia Rapid API (sandbox)
- Replace mock data with real lodging search
- Implement basic error handling

**Week 6: Testing & ChatGPT Registration**
- Register app with OpenAI
- Test in ChatGPT development environment
- Fix issues, refine conversation flow
- Deploy to staging

**Deliverables:**
- ✅ Working MCP server deployed to Azure
- ✅ 2 functional tools (search, details)
- ✅ Real lodging data from Expedia sandbox
- ✅ Testable in ChatGPT
- ✅ Session state management working

**Success Criteria:**
- User can search for ski resorts via ChatGPT
- Results display as inline carousel
- User can view resort details
- Conversation state persists across messages

---

### Phase 2: Booking Flow (Weeks 7-12)

**Goal:** End-to-end booking with payment

**Week 7-8: Database & Booking Logic**
- Implement database schema
- Build booking service
- Create order management system
- Implement `check_availability` tool

**Week 9-10: Payment Integration**
- Integrate Stripe payment processing
- Implement `book_package` tool
- Build webhook handlers
- Create payment confirmation flow

**Week 11: Email & Status**
- Integrate Resend for email
- Implement email templates
- Build `get_order_status` tool
- Create status update system

**Week 12: Testing & Refinement**
- End-to-end testing
- Payment flow testing
- Email delivery testing
- Bug fixes and polish

**Deliverables:**
- ✅ Complete booking workflow
- ✅ Stripe payment integration
- ✅ Order management system
- ✅ Email confirmations
- ✅ Order tracking

**Success Criteria:**
- User can complete full booking flow
- Payment processing works correctly
- Confirmation emails sent
- Order status retrievable

---

### Phase 3: Ski Pass Integration (Weeks 13-18)

**Goal:** Add ski pass booking capabilities

**Week 13-14: Indy Pass**
- Establish Indy Pass API connection
- Implement Indy Pass service
- Build pass availability checking
- Test pass booking

**Week 15-16: Ikon/Epic Pass**
- Research Ikon/Epic APIs
- Implement available integrations
- Build fallback for affiliate links
- Test pass options

**Week 17: Package Builder**
- Build package combination logic
- Implement `get_package_options` tool
- Create pricing engine for packages
- Test package customization

**Week 18: Testing & Optimization**
- Test all pass providers
- Optimize package pricing
- Refine package display
- Performance testing

**Deliverables:**
- ✅ Ski pass booking integration
- ✅ Package builder (lodging + passes)
- ✅ Multi-tier package options
- ✅ Pricing engine

**Success Criteria:**
- Users can book packages with passes
- Multiple pass providers available
- Package customization works
- Pricing calculated correctly

---

### Phase 4: Rentals & Lessons (Weeks 19-24)

**Goal:** Complete trip packages

**Week 19-20: Rental Integration**
- Build rental shop partner portal (MVP approach)
- Implement rental booking flow
- Create rental shop notification system
- Test rental bookings

**Week 21-22: Lesson Integration**
- Integrate lesson booking with resorts
- Build lesson availability checking
- Implement lesson confirmation flow
- Test lesson bookings

**Week 23: Complete Packages**
- Integrate all components
- Build complete package builder
- Implement `customize_package` tool
- Test full trip packages

**Week 24: Polish & Optimization**
- Performance optimization
- Caching improvements
- UI refinements
- Bug fixes

**Deliverables:**
- ✅ Rental booking system
- ✅ Lesson booking integration
- ✅ Complete trip packages
- ✅ Full customization

**Success Criteria:**
- Complete packages available
- All components can be customized
- Rental and lesson booking works
- Performance meets targets

---

### Phase 5: Launch Preparation (Weeks 25-28)

**Goal:** Production-ready application

**Week 25: Security & Compliance**
- Security audit
- GDPR compliance review
- Terms of service
- Privacy policy

**Week 26: Monitoring & Analytics**
- Application Insights setup
- Custom metrics implementation
- Error tracking
- Analytics dashboard

**Week 27: Marketing & Content**
- OpenAI app store listing
- Marketing materials
- Support documentation
- Help center content

**Week 28: Soft Launch**
- Beta testing with select users
- Gather feedback
- Fix critical issues
- Prepare for public launch

**Deliverables:**
- ✅ Production-ready application
- ✅ Security & compliance complete
- ✅ Monitoring in place
- ✅ Marketing materials ready

**Success Criteria:**
- App passes security audit
- Monitoring working correctly
- Beta users successfully book trips
- Ready for public launch

---

### Phase 6: Public Launch & Iteration (Week 29+)

**Goal:** Public launch and continuous improvement

**Week 29: Public Launch**
- Publish to ChatGPT app directory
- Launch marketing campaigns
- Monitor closely for issues
- Quick response to problems

**Ongoing: Optimization**
- Monitor metrics and KPIs
- Gather user feedback
- Iterate on conversation flow
- Add new features based on demand
- Expand resort/pass partnerships

---

## Project Structure

```
SkiExpert/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── src/
│   ├── SkiExpert.Mcp/                    # MCP Server (Main Application)
│   │   ├── Program.cs
│   │   ├── Tools/                         # MCP Tool Implementations
│   │   │   ├── SearchDestinationsTool.cs
│   │   │   ├── GetResortDetailsTool.cs
│   │   │   ├── CheckAvailabilityTool.cs
│   │   │   ├── GetPackageOptionsTool.cs
│   │   │   ├── CustomizePackageTool.cs
│   │   │   ├── BookPackageTool.cs
│   │   │   ├── GetOrderStatusTool.cs
│   │   │   ├── ModifyBookingTool.cs
│   │   │   └── CancelBookingTool.cs
│   │   ├── Services/
│   │   │   ├── SessionManager.cs
│   │   │   └── DisplayModeFormatter.cs
│   │   └── Models/
│   │       ├── TripPlanningSession.cs
│   │       └── ToolResponses/
│   │
│   ├── SkiExpert.Core/                    # Business Logic
│   │   ├── Services/
│   │   │   ├── PackageBuilderService.cs
│   │   │   ├── PricingEngine.cs
│   │   │   ├── AvailabilityChecker.cs
│   │   │   └── BookingService.cs
│   │   ├── Models/
│   │   │   ├── Package.cs
│   │   │   ├── Resort.cs
│   │   │   ├── LodgingOption.cs
│   │   │   ├── SkiPass.cs
│   │   │   └── Booking.cs
│   │   └── Interfaces/
│   │       ├── ILodgingProvider.cs
│   │       ├── ISkiPassProvider.cs
│   │       ├── IRentalProvider.cs
│   │       └── ILessonProvider.cs
│   │
│   ├── SkiExpert.Integrations/            # External API Clients
│   │   ├── Expedia/
│   │   │   ├── ExpediaRapidService.cs
│   │   │   ├── ExpediaAuthHandler.cs
│   │   │   └── Models/
│   │   ├── Amadeus/
│   │   │   ├── AmadeusService.cs
│   │   │   ├── AmadeusTokenService.cs
│   │   │   └── Models/
│   │   ├── IndyPass/
│   │   │   ├── IndyPassService.cs
│   │   │   └── Models/
│   │   ├── SkiPasses/
│   │   │   ├── IkonPassService.cs
│   │   │   ├── EpicPassService.cs
│   │   │   └── Models/
│   │   └── Rentals/
│   │       ├── GenericRentalService.cs
│   │       └── Models/
│   │
│   ├── SkiExpert.Payment/                 # Payment Processing
│   │   ├── Services/
│   │   │   ├── StripePaymentService.cs
│   │   │   ├── RefundService.cs
│   │   │   └── WebhookHandler.cs
│   │   └── Models/
│   │
│   ├── SkiExpert.Notifications/           # Email & Notifications
│   │   ├── Services/
│   │   │   ├── EmailService.cs
│   │   │   ├── TemplateBuilder.cs
│   │   │   └── NotificationQueue.cs
│   │   └── Templates/
│   │       ├── OrderConfirmation.cshtml
│   │       ├── StatusUpdate.cshtml
│   │       └── Reminder.cshtml
│   │
│   ├── SkiExpert.Data/                    # Data Access
│   │   ├── SkiExpertDbContext.cs
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── Order.cs
│   │   │   ├── OrderItem.cs
│   │   │   └── Bookings/
│   │   ├── Configurations/
│   │   │   ├── OrderConfiguration.cs
│   │   │   └── UserConfiguration.cs
│   │   ├── Repositories/
│   │   │   ├── OrderRepository.cs
│   │   │   ├── UserRepository.cs
│   │   │   └── Interfaces/
│   │   └── Migrations/
│   │
│   └── SkiExpert.Shared/                  # Shared Utilities
│       ├── Extensions/
│       ├── Helpers/
│       └── Constants/
│
├── tests/
│   ├── SkiExpert.Mcp.Tests/
│   │   ├── Tools/
│   │   └── Services/
│   ├── SkiExpert.Core.Tests/
│   │   ├── Services/
│   │   └── Models/
│   ├── SkiExpert.Integrations.Tests/
│   └── SkiExpert.Integration.Tests/
│
├── docs/
│   ├── api/
│   ├── architecture/
│   └── deployment/
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── research/                              # Research & Review Docs
│   ├── REVIEW_README.md
│   ├── EXECUTIVE_SUMMARY.md
│   ├── TECHNICAL_PLAN_REVIEW.md
│   ├── DATA_COLLECTION_STRATEGY.md
│   ├── MCP_QUICKSTART_GUIDE.md
│   └── original_technical_plan.md
│
├── .gitignore
├── README.md                              # Project README
├── TECHNICAL_PLAN.md                      # This document
├── Targets.md                             # Business targets
└── SkiExpert.sln
```

---

## Compliance & Security

### Data Security

**Encryption:**
- All data encrypted at rest (Transparent Data Encryption)
- All data encrypted in transit (TLS 1.3)
- Sensitive data (PII) separately encrypted

**PCI Compliance:**
- Never store raw credit card data
- Use Stripe.js for tokenization
- Stripe handles PCI compliance
- Regular security audits

**API Keys & Secrets:**
- Store in Azure Key Vault
- Rotate regularly (90 days)
- Never commit to source control
- Use managed identities where possible

**Authentication & Authorization:**
- JWT tokens for API access
- Role-based access control (RBAC)
- OAuth 2.0 for user authentication
- Rate limiting on all endpoints

### Privacy & GDPR

**Data Collection:**
- Collect only necessary data
- Clear privacy policy
- Explicit consent for marketing
- Right to access/delete data

**Data Retention:**
- Active orders: Indefinite
- Completed orders: 7 years (legal requirement)
- Cancelled orders: 1 year
- User data: Until deletion requested

**Third-Party Sharing:**
- Transparent disclosure in privacy policy
- Only share with booking partners
- No selling of user data
- GDPR-compliant data processing agreements

### Compliance

**Travel Agent Licensing:**
- Research state-by-state requirements
- Obtain necessary licenses
- Maintain insurance
- Follow consumer protection laws

**Terms of Service:**
- Clear cancellation policies
- Refund policies
- Liability disclaimers
- Dispute resolution process

**Business Insurance:**
- Errors & omissions insurance
- General liability insurance
- Cyber liability insurance

---

## Success Metrics

### Technical Metrics

**Performance:**
- API response time: < 2 seconds (p95)
- MCP tool execution: < 1 second (p95)
- Uptime: 99.9% (43 minutes downtime/month)
- Database query time: < 100ms (p95)

**Reliability:**
- Order processing success rate: > 99%
- Payment success rate: > 95%
- Email delivery rate: > 98%
- API integration uptime: > 99%

**Scalability:**
- Support 1000 concurrent users
- Handle 500 bookings per day
- Process 10,000 searches per day

### Business Metrics

**Bookings:**
- Peak season: 25 bookings/day target
- Off-season: 7 bookings/day target
- Average booking value: $1,500
- Monthly recurring bookings: Track growth

**Conversion:**
- Search to booking: 1-2% target
- Browsing to booking: 5-10% target
- Package customization rate: Track
- Abandoned booking recovery: Track

**Revenue:**
- Commission per booking: Track by provider
- Monthly revenue: Track growth
- Revenue per user: Track
- Customer lifetime value: Track

**User Engagement:**
- Average conversation length: Track
- Tool calls per booking: Track
- Repeat customer rate: Track
- User satisfaction score: Target > 4.5/5

### Monitoring & Alerting

**Application Insights:**
- Custom metrics for each MCP tool
- Performance dashboards
- Error rate tracking
- User journey analytics

**Alerts:**
- Response time > 5 seconds
- Error rate > 1%
- Payment failure rate > 5%
- API integration failures

**Logging:**
- Structured logging with Serilog
- Log levels: Debug, Info, Warning, Error, Fatal
- Centralized log aggregation
- Retention: 90 days

---

## Risk Management

### Technical Risks

**1. API Availability**
- **Risk:** External APIs (Expedia, etc.) become unavailable
- **Mitigation:** 
  - Implement fallback providers (Amadeus as backup for lodging)
  - Cache API responses (Redis, 1-hour TTL)
  - Graceful degradation with cached data
  - Monitor API health continuously

**2. Rate Limiting**
- **Risk:** Exceed API rate limits during peak season
- **Mitigation:**
  - Implement request queuing
  - Aggressive caching strategy
  - Multiple API credentials if available
  - Load balancing across providers

**3. Payment Processing Issues**
- **Risk:** Stripe downtime or payment failures
- **Mitigation:**
  - Monitor Stripe status page
  - Implement retry logic with exponential backoff
  - Clear error messaging to users
  - Manual payment processing fallback

**4. Scalability Challenges**
- **Risk:** Sudden traffic spike crashes system
- **Mitigation:**
  - Azure Container Apps auto-scaling
  - Redis caching to reduce database load
  - Database connection pooling
  - Load testing before peak season

### Business Risks

**1. Commission Rates**
- **Risk:** Lower than expected commission rates
- **Mitigation:**
  - Negotiate favorable rates upfront
  - Diversify revenue sources
  - Consider subscription model in future
  - Build direct resort partnerships

**2. Competition**
- **Risk:** Major players launch similar ChatGPT apps
- **Mitigation:**
  - Focus on ski-specific expertise
  - Superior conversation design
  - Unique partnerships (e.g., Indy Pass)
  - Build brand loyalty early

**3. Seasonality**
- **Risk:** Revenue concentrated in winter months
- **Mitigation:**
  - Market off-season skiing (spring, summer glaciers)
  - Expand to summer activities (phase 2)
  - Build email list for next season
  - Offer early booking discounts

**4. Ski Pass API Access**
- **Risk:** Ikon/Epic don't provide API access
- **Mitigation:**
  - Prioritize Indy Pass (confirmed access)
  - Use affiliate links as fallback
  - Partner with individual resorts directly
  - Build value with lodging + lessons

### Operational Risks

**1. Booking Errors**
- **Risk:** Incorrect bookings due to data issues
- **Mitigation:**
  - Comprehensive validation before booking
  - Confirmation screens with all details
  - 24-hour cancellation grace period
  - Customer support for corrections

**2. Customer Support Load**
- **Risk:** High support volume during peak season
- **Mitigation:**
  - Comprehensive FAQs and help center
  - Self-service order management in ChatGPT
  - Clear error messages
  - Hire seasonal support staff

**3. Regulatory Changes**
- **Risk:** Travel agent licensing requirements change
- **Mitigation:**
  - Monitor regulatory landscape
  - Work with legal counsel
  - Maintain compliance documentation
  - Flexible business structure

---

## Next Steps

### Immediate Actions (This Week)

1. **Review & Approval**
   - Review this technical plan with stakeholders
   - Gather feedback and refine as needed
   - Get formal approval to proceed

2. **Partnership Outreach**
   - Apply for Expedia Rapid API partnership
   - Register for Amadeus Self-Service API
   - Contact Indy Pass owner about API access
   - Research Ikon/Epic Pass partnership programs

3. **Business Setup**
   - Register business entity
   - Open Mercury business account
   - Create Stripe business account
   - Apply for necessary licenses

4. **Team Setup**
   - Assemble development team
   - Set up development environments
   - Create project management workspace
   - Schedule kickoff meeting

### Week 1 (Development Start)

1. **Infrastructure**
   - Create Azure subscription
   - Set up Azure Container Apps environment
   - Provision Azure SQL Database
   - Set up Azure Redis Cache

2. **Project Setup**
   - Create GitHub repository
   - Set up .NET solution structure
   - Configure CI/CD pipelines
   - Set up development/staging/production environments

3. **Initial Development**
   - Implement basic MCP server
   - Create first tool (search_destinations with mock data)
   - Set up session management
   - Register with OpenAI for development

---

## Appendix

### Glossary

- **MCP (Model Context Protocol):** OpenAI's protocol for connecting external tools to ChatGPT
- **Display Mode:** The format in which content appears in ChatGPT (inline card, carousel, fullscreen)
- **Tool:** A function exposed by the MCP server that ChatGPT can call
- **Session State:** User-specific data stored across a conversation
- **Inline Card:** A single-purpose widget displayed in chat
- **Inline Carousel:** Multiple cards displayed side-by-side for comparison

### References

**OpenAI:**
- [App Design Guidelines](https://developers.openai.com/apps-sdk/concepts/design-guidelines)
- [App Developer Guidelines](https://developers.openai.com/apps-sdk/app-developer-guidelines)
- [Model Context Protocol](https://modelcontextprotocol.io/)

**APIs:**
- [Expedia Rapid API](https://developers.expediagroup.com/rapid/)
- [Amadeus for Developers](https://developers.amadeus.com/)
- [Stripe API Documentation](https://stripe.com/docs/api)

**Frameworks:**
- [.NET 8 Documentation](https://learn.microsoft.com/en-us/dotnet/)
- [FastEndpoints](https://fastendpoints.com/)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)

**Azure:**
- [Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Azure SQL Database](https://learn.microsoft.com/en-us/azure/azure-sql/)
- [Azure Redis Cache](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/)

---

**Document Version:** 2.0  
**Last Updated:** November 6, 2025  
**Status:** Ready for Implementation

**This is your official technical plan. Use this as your single source of truth for building SkiExpert.**

