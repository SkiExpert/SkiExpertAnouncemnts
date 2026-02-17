# SkiExpert MVP Technical Plan
## AI-Powered Ski Trip Planning - Simplified for Fast Launch

**Version:** 1.0 MVP  
**Date:** November 7, 2025  
**Status:** Ready for Implementation  
**Focus:** Minimum Viable Product - Get it running fast

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [MVP Scope](#mvp-scope)
3. [Simplified Architecture](#simplified-architecture)
4. [Technology Stack](#technology-stack)
5. [API Integrations](#api-integrations)
6. [Database Design](#database-design)
7. [MCP Server Implementation](#mcp-server-implementation)
8. [Payment Flow](#payment-flow)
9. [MVP Development Plan](#mvp-development-plan)
10. [Project Structure](#project-structure)

---

## Executive Summary

### What We're Building

A **ChatGPT app** that helps users plan and book ski trips through natural conversation. Users can search for ski resorts, view lodging options, add activities (lift tickets, lessons, rentals), and complete bookings - all without leaving ChatGPT.

### MVP Business Model

Generate revenue through commissions on:
- Hotel bookings via Expedia (8-15% commission)
- Activities via Viator (20% commission) - lift tickets, lessons, equipment rentals

**MVP Target:** 5 bookings per day by end of ski season

### Technical Approach - Simplified

**What We're Building:**
- ✅ Backend-only .NET MCP Server
- ✅ ChatGPT handles all UI
- ✅ PostgreSQL for data AND sessions (no Redis)
- ✅ Basic logging only (no Application Insights initially)
- ✅ Expedia for hotels + Viator for activities ONLY
- ✅ Stripe for payments

**What We're NOT Building (MVP):**
- ❌ Flights
- ❌ Multiple hotel providers
- ❌ Direct ski pass integrations (Ikon, Epic, Indy)
- ❌ Complex caching systems (Redis)
- ❌ Advanced monitoring/telemetry
- ❌ Custom frontend
- ❌ Multiple API fallbacks

---

## MVP Scope

### In Scope

**Core Features:**
1. Search ski destinations by region/resort name
2. View available lodging (hotels, condos) via Expedia
3. Browse activities via Viator (lessons, rentals, lift tickets where available)
4. Build packages (lodging + activities)
5. Complete booking with Stripe payment
6. Receive email confirmation
7. View booking status

**Geographic Focus:**
- North American ski resorts (US & Canada)
- Expand internationally in Phase 2

**Conversation Flow:**
```
User: "I want to ski in Colorado in January"
  ↓
SkiExpert: Collect dates, group size
  ↓
SkiExpert: Show 3-5 resort options (carousel)
  ↓
User: "Tell me about Vail"
  ↓
SkiExpert: Show lodging options at Vail
  ↓
User: "That one looks good, can we add ski lessons?"
  ↓
SkiExpert: Show available lessons from Viator
  ↓
User: "Book it"
  ↓
SkiExpert: Collect contact info → Create Stripe payment → Confirm
```

### Out of Scope (MVP)

- Flights
- Car rentals
- Airport transfers
- Multi-destination trips
- Group bookings (>6 people)
- Advanced package customization
- Booking modifications (cancellations only)
- Real-time availability updates
- Multiple currency support

---

## Simplified Architecture

```
┌─────────────────────────────────────────────┐
│           ChatGPT Platform                  │
│  • Conversation UI                          │
│  • User interactions                        │
│  • Calls MCP tools                          │
└──────────────────┬──────────────────────────┘
                   │
            MCP Protocol
                   │
┌──────────────────▼──────────────────────────┐
│     SkiExpert MCP Server (.NET 8)          │
│                                             │
│  MCP Tools:                                 │
│  • search_destinations                      │
│  • get_lodging_options                      │
│  • get_activities                           │
│  • create_package                           │
│  • book_package                             │
│  • get_booking_status                       │
│  • cancel_booking                           │
│                                             │
│  Services:                                  │
│  • Session Manager (Postgres)               │
│  • Package Builder                          │
│  • Booking Service                          │
│  • Payment Service (Stripe)                 │
│  • Email Service (Resend)                   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         External APIs                       │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Expedia  │  │  Viator  │  │  Stripe  │ │
│  │  Hotels  │  │Activities│  │ Payments │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
│  ┌──────────┐                               │
│  │  Resend  │                               │
│  │  Email   │                               │
│  └──────────┘                               │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│      PostgreSQL Database                    │
│                                             │
│  • Users, Orders, Bookings                  │
│  • Sessions (stored as JSON)                │
│  • Email logs                               │
└─────────────────────────────────────────────┘
```

### Key Simplifications

1. **Single Database:** PostgreSQL handles everything (data + sessions)
2. **No Caching Layer:** Keep it simple, optimize later
3. **Minimal Logging:** Console + file logging via Serilog
4. **Two APIs Only:** Expedia + Viator
5. **No Fallbacks:** Single provider per category
6. **Stateless Server:** All state in database

---

## Technology Stack

### Backend

**Framework:**
- .NET 8.0
- C# 12
- Minimal APIs (no FastEndpoints initially)
- MCP SDK (when available, or custom implementation)

**Data Access:**
- Entity Framework Core 8
- PostgreSQL 15
- Npgsql (Postgres driver)

**Libraries:**
```xml
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.*" />
<PackageReference Include="Stripe.net" Version="44.*" />
<PackageReference Include="Serilog.AspNetCore" Version="8.*" />
<PackageReference Include="Microsoft.Extensions.Http" Version="8.*" />
```

**Why No Redis?**
- PostgreSQL can handle sessions via JSON storage
- Simple `session_state` table with 30-minute expiry
- No additional infrastructure needed
- Good enough for 100s of concurrent users

### Hosting (MVP)

**Simple Deployment:**
- Railway.app or Render.com (easy .NET hosting)
- **OR** Azure Container Apps (if you prefer Azure)
- PostgreSQL managed database (Railway, Render, or Azure)
- Estimated cost: $20-50/month

**Why Not Full Azure Stack?**
- Simpler setup for MVP
- Lower costs during validation
- Easy to migrate later if needed

### No Monitoring (Yet)

**MVP Approach:**
- Console logging to stdout
- File logging for errors
- Stripe dashboard for payment monitoring
- Simple health check endpoint

**Add Later:**
- Application Insights
- OpenTelemetry
- Custom metrics

---

## API Integrations

### 1. Expedia Group Rapid API (Hotels)

**Why Expedia for MVP:**
- ✅ Largest hotel inventory (700,000+ properties)
- ✅ Excellent documentation
- ✅ Sandbox environment for testing
- ✅ 8-15% commission
- ✅ No upfront fees

**Getting Started:**
1. Apply for partnership: https://developers.expediagroup.com/
2. Wait for approval (1-2 weeks typically)
3. Get API credentials for sandbox
4. Test integration
5. Apply for production access

**Key Endpoints:**
```
POST /properties/search        - Search hotels
GET  /properties/{id}          - Property details  
POST /bookings                 - Create booking
GET  /bookings/{id}            - Get booking
DELETE /bookings/{id}          - Cancel booking
```

**Authentication:**
- SHA-512 HMAC signature
- API Key + Secret provided upon approval

**Sample Implementation:**
```csharp
public class ExpediaService
{
    private readonly HttpClient _client;
    private readonly string _apiKey;
    private readonly string _secret;
    
    public async Task<List<Hotel>> SearchHotelsAsync(
        string location, 
        DateTime checkIn, 
        DateTime checkOut,
        int rooms)
    {
        var signature = GenerateSignature(request);
        
        var response = await _client.PostAsync(
            "/properties/search",
            new StringContent(JsonSerializer.Serialize(new {
                location,
                check_in = checkIn.ToString("yyyy-MM-dd"),
                check_out = checkOut.ToString("yyyy-MM-dd"),
                rooms = new[] { new { adults = 2 } }
            }))
        );
        
        // Parse and return results
    }
}
```

**MVP Limitations:**
- Search within 50-mile radius only
- Display first 10 results max
- No complex filters initially
- Basic room type selection

### 2. Viator API (Activities)

**Why Viator for MVP:**
- ✅ 300,000+ experiences globally
- ✅ Good ski resort coverage
- ✅ Easy signup (Basic Access = self-service)
- ✅ 20% commission
- ✅ Handles ski lessons, equipment rentals, some lift tickets

**Getting Started:**
1. Sign up: https://www.viator.com/partner
2. Get immediate Basic API access
3. Integrate search and redirect to Viator checkout
4. Apply for Full API Access later (for direct booking)

**API Levels:**

**Basic Access (MVP):**
- Self-service, immediate
- Search products, get details
- User completes booking on viator.com
- You still earn commission via tracking
- Perfect for MVP validation

**Full Access (Phase 2):**
- Requires approval
- Direct booking capability
- More control over experience
- Apply after MVP proves concept

**Key Endpoints (Basic):**
```
GET /products/search          - Search activities
GET /products/{id}            - Activity details
GET /products/{id}/availability - Check availability
```

**Sample Implementation:**
```csharp
public class ViatorService
{
    private readonly HttpClient _client;
    private readonly string _apiKey;
    
    public async Task<List<Activity>> SearchActivitiesAsync(
        string destination,
        DateTime startDate,
        string category = "ski")
    {
        var response = await _client.GetAsync(
            $"/products/search?destination={destination}" +
            $"&startDate={startDate:yyyy-MM-dd}" +
            $"&category={category}"
        );
        
        return await ParseActivities(response);
    }
    
    public string GetBookingUrl(string productId, ActivityDetails details)
    {
        // Generate tracked URL that redirects to Viator
        return $"https://www.viator.com/tours/{productId}?pid={_partnerId}";
    }
}
```

**MVP Flow:**
1. User searches for lodging at resort
2. Show "Add Activities" option
3. Search Viator for ski-related activities
4. Display 3-5 top options
5. User clicks "Book This" → Redirect to Viator with tracking
6. User completes booking on Viator
7. Viator tracks commission back to you

**Categories to Focus On:**
- Ski & Snowboard Lessons
- Equipment Rentals
- Lift Tickets (where available via Viator)
- Guided Tours

---

## Database Design

### Simplified Schema

**sessions** (for conversation state)
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID,
    state JSONB NOT NULL,  -- Store entire TripPlanningSession
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    
    INDEX idx_sessions_session_id (session_id),
    INDEX idx_sessions_expires_at (expires_at)
);

-- Auto-cleanup expired sessions
CREATE INDEX idx_sessions_cleanup ON sessions(expires_at) 
WHERE expires_at < NOW();
```

**users**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    INDEX idx_users_email (email)
);
```

**orders**
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,  -- SKI-2025-0001
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL,  
        -- pending_payment, confirmed, cancelled, refunded
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Stripe
    stripe_payment_intent_id VARCHAR(255),
    stripe_payment_status VARCHAR(50),
    
    -- Package details (stored as JSON for simplicity)
    package_data JSONB NOT NULL,
    
    -- Contact info
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    INDEX idx_orders_user_id (user_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_order_number (order_number),
    INDEX idx_orders_customer_email (customer_email)
);
```

**bookings** (tracks external bookings)
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    provider VARCHAR(50) NOT NULL,  -- expedia, viator
    booking_type VARCHAR(50) NOT NULL,  -- hotel, activity
    
    -- Provider-specific IDs
    provider_booking_id VARCHAR(255),
    provider_confirmation VARCHAR(255),
    
    -- Details (flexible JSON storage)
    booking_details JSONB NOT NULL,
    
    status VARCHAR(50) NOT NULL,  -- pending, confirmed, cancelled
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    INDEX idx_bookings_order_id (order_id),
    INDEX idx_bookings_provider (provider)
);
```

**email_logs** (simple email tracking)
```sql
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    email_type VARCHAR(50) NOT NULL,  -- confirmation, cancellation
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    sent_at TIMESTAMPTZ,
    error TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    INDEX idx_email_logs_order_id (order_id)
);
```

### Session State Storage

Instead of Redis, we store sessions as JSON in PostgreSQL:

```csharp
public class SessionState
{
    public string SessionId { get; set; }
    public string? UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    
    // The actual session data
    public TripPlanningSession State { get; set; }
}

public class TripPlanningSession
{
    public string? Destination { get; set; }
    public DateTime? CheckInDate { get; set; }
    public DateTime? CheckOutDate { get; set; }
    
    public GroupInfo Group { get; set; } = new();
    
    public string? SelectedResort { get; set; }
    public string? SelectedHotelId { get; set; }
    public List<string> SelectedActivityIds { get; set; } = new();
    
    public ConversationStage Stage { get; set; } = ConversationStage.Discovery;
}

public class GroupInfo
{
    public int Adults { get; set; }
    public int Children { get; set; }
    public List<int> ChildAges { get; set; } = new();
}

public enum ConversationStage
{
    Discovery,      // Collecting where/when/who
    Browsing,       // Showing options
    Customizing,    // Building package
    Booking,        // Collecting payment info
    Confirmed       // Done
}
```

**Session Manager:**
```csharp
public class SessionManager
{
    private readonly SkiExpertDbContext _db;
    
    public async Task<TripPlanningSession> GetOrCreateAsync(string sessionId)
    {
        var session = await _db.Sessions
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);
            
        if (session == null || session.ExpiresAt < DateTime.UtcNow)
        {
            // Create new session
            session = new SessionState
            {
                SessionId = sessionId,
                State = new TripPlanningSession(),
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(30)
            };
            
            _db.Sessions.Add(session);
            await _db.SaveChangesAsync();
        }
        
        return session.State;
    }
    
    public async Task SaveAsync(string sessionId, TripPlanningSession state)
    {
        var session = await _db.Sessions
            .FirstAsync(s => s.SessionId == sessionId);
            
        session.State = state;
        session.ExpiresAt = DateTime.UtcNow.AddMinutes(30); // Extend
        
        await _db.SaveChangesAsync();
    }
}
```

**Performance Note:**
- PostgreSQL JSONB is fast (indexed, queryable)
- Good for 100s of concurrent sessions
- If you hit performance issues, migrate to Redis later
- For MVP, this is simpler and cheaper

---

## MCP Server Implementation

### Tool Definitions (Simplified)

#### 1. search_destinations

**Purpose:** Search for ski resorts and show lodging options

```csharp
[McpTool("search_destinations")]
public async Task<ToolResponse> SearchDestinations(
    [Description("Region or resort name")] string destination,
    [Description("Check-in date")] DateTime? checkIn,
    [Description("Check-out date")] DateTime? checkOut,
    [Description("Number of adults")] int adults = 2,
    [Description("Number of children")] int children = 0)
{
    // Get or create session
    var session = await _sessionManager.GetOrCreateAsync(GetSessionId());
    
    // Update session state
    session.Destination = destination;
    session.CheckInDate = checkIn;
    session.CheckOutDate = checkOut;
    session.Group.Adults = adults;
    session.Group.Children = children;
    session.Stage = ConversationStage.Browsing;
    
    await _sessionManager.SaveAsync(GetSessionId(), session);
    
    // Search Expedia for hotels
    var hotels = await _expediaService.SearchHotelsAsync(
        destination,
        checkIn ?? DateTime.Now.AddMonths(1),
        checkOut ?? DateTime.Now.AddMonths(1).AddDays(3),
        CalculateRooms(adults, children)
    );
    
    // Return as carousel
    return new ToolResponse
    {
        Type = "carousel",
        Items = hotels.Take(5).Select(h => new CarouselItem
        {
            Title = h.Name,
            Subtitle = $"From ${h.PricePerNight}/night",
            Image = h.ImageUrl,
            Metadata = new[] 
            {
                $"{h.StarRating} stars",
                $"{h.DistanceToResort} miles to slopes"
            },
            Actions = new[]
            {
                new ToolAction
                {
                    Label = "View Details",
                    Tool = "get_hotel_details",
                    Parameters = new { hotelId = h.Id }
                }
            }
        })
    };
}
```

#### 2. get_hotel_details

**Purpose:** Show detailed information about a specific hotel

```csharp
[McpTool("get_hotel_details")]
public async Task<ToolResponse> GetHotelDetails(
    [Description("Hotel ID from search")] string hotelId)
{
    var hotel = await _expediaService.GetHotelDetailsAsync(hotelId);
    
    var session = await _sessionManager.GetOrCreateAsync(GetSessionId());
    session.SelectedHotelId = hotelId;
    await _sessionManager.SaveAsync(GetSessionId(), session);
    
    return new ToolResponse
    {
        Type = "card",
        Content = new Card
        {
            Title = hotel.Name,
            Image = hotel.ImageUrl,
            Sections = new[]
            {
                new CardSection
                {
                    Heading = "Property Details",
                    Items = new[]
                    {
                        hotel.Description,
                        $"Rating: {hotel.StarRating} stars ({hotel.ReviewCount} reviews)",
                        $"Location: {hotel.Address}"
                    }
                },
                new CardSection
                {
                    Heading = "Amenities",
                    Items = hotel.Amenities.Take(8).ToArray()
                },
                new CardSection
                {
                    Heading = "Pricing",
                    Items = new[]
                    {
                        $"From ${hotel.PricePerNight}/night",
                        $"Total: ${hotel.TotalPrice} for {hotel.Nights} nights",
                        "Includes taxes and fees"
                    }
                }
            },
            Actions = new[]
            {
                new ToolAction
                {
                    Label = "Add Activities",
                    Tool = "search_activities",
                    Style = "secondary"
                },
                new ToolAction
                {
                    Label = "Book Now",
                    Tool = "book_package",
                    Style = "primary"
                }
            }
        }
    };
}
```

#### 3. search_activities

**Purpose:** Show available activities from Viator

```csharp
[McpTool("search_activities")]
public async Task<ToolResponse> SearchActivities(
    [Description("Type of activity")] string category = "ski")
{
    var session = await _sessionManager.GetOrCreateAsync(GetSessionId());
    
    if (string.IsNullOrEmpty(session.Destination))
    {
        return ErrorResponse("Please select a destination first");
    }
    
    // Search Viator
    var activities = await _viatorService.SearchActivitiesAsync(
        session.Destination,
        session.CheckInDate ?? DateTime.Now.AddMonths(1),
        category
    );
    
    return new ToolResponse
    {
        Type = "carousel",
        Items = activities.Take(5).Select(a => new CarouselItem
        {
            Title = a.Title,
            Subtitle = $"From ${a.Price} per person",
            Image = a.ImageUrl,
            Metadata = new[]
            {
                $"Duration: {a.Duration}",
                $"Rating: {a.Rating} ({a.ReviewCount} reviews)",
                a.Category
            },
            Actions = new[]
            {
                new ToolAction
                {
                    Label = "Add to Package",
                    Tool = "add_activity",
                    Parameters = new { activityId = a.Id }
                }
            }
        })
    };
}
```

#### 4. book_package

**Purpose:** Create order and initiate payment

```csharp
[McpTool("book_package")]
public async Task<ToolResponse> BookPackage(
    [Description("Customer first name")] string firstName,
    [Description("Customer last name")] string lastName,
    [Description("Customer email")] string email,
    [Description("Customer phone")] string phone)
{
    var session = await _sessionManager.GetOrCreateAsync(GetSessionId());
    
    // Validate session has required data
    if (string.IsNullOrEmpty(session.SelectedHotelId))
    {
        return ErrorResponse("Please select lodging first");
    }
    
    // Get hotel details
    var hotel = await _expediaService.GetHotelDetailsAsync(
        session.SelectedHotelId);
    
    // Calculate total
    var total = hotel.TotalPrice;
    
    // Get or create user
    var user = await _userService.GetOrCreateAsync(email, firstName, lastName, phone);
    
    // Create order
    var order = new Order
    {
        OrderNumber = GenerateOrderNumber(),
        UserId = user.Id,
        Status = "pending_payment",
        TotalAmount = total,
        CustomerEmail = email,
        CustomerPhone = phone,
        PackageData = new PackageData
        {
            Destination = session.Destination,
            CheckInDate = session.CheckInDate.Value,
            CheckOutDate = session.CheckOutDate.Value,
            Hotel = new HotelData
            {
                ProviderId = hotel.Id,
                Name = hotel.Name,
                PricePerNight = hotel.PricePerNight,
                TotalPrice = hotel.TotalPrice
            },
            Activities = new List<ActivityData>() // TODO: Add selected activities
        }
    };
    
    _db.Orders.Add(order);
    await _db.SaveChangesAsync();
    
    // Create Stripe payment intent
    var paymentIntent = await _stripeService.CreatePaymentIntentAsync(order);
    
    // Update order with payment intent
    order.StripePaymentIntentId = paymentIntent.Id;
    await _db.SaveChangesAsync();
    
    // Return payment card
    return new ToolResponse
    {
        Type = "card",
        Content = new Card
        {
            Title = "Confirm Your Booking",
            Sections = new[]
            {
                new CardSection
                {
                    Heading = "Trip Summary",
                    Items = new[]
                    {
                        $"📍 {session.Destination}",
                        $"📅 {session.CheckInDate:MMM dd} - {session.CheckOutDate:MMM dd}",
                        $"👥 {session.Group.Adults} adults, {session.Group.Children} children",
                        $"🏨 {hotel.Name}"
                    }
                },
                new CardSection
                {
                    Heading = "Order Details",
                    Items = new[]
                    {
                        $"Order #: {order.OrderNumber}",
                        $"Total: ${order.TotalAmount:F2}",
                        $"Email: {email}"
                    }
                }
            },
            Actions = new[]
            {
                new ToolAction
                {
                    Label = "Complete Payment",
                    Type = "link",
                    Url = paymentIntent.CheckoutUrl,
                    Style = "primary"
                }
            }
        }
    };
}
```

#### 5. get_booking_status

**Purpose:** Retrieve order information

```csharp
[McpTool("get_booking_status")]
public async Task<ToolResponse> GetBookingStatus(
    [Description("Order number or email")] string query)
{
    // Try to find order by order number or email
    var order = await _db.Orders
        .Include(o => o.User)
        .FirstOrDefaultAsync(o => 
            o.OrderNumber == query.ToUpper() ||
            o.CustomerEmail.ToLower() == query.ToLower());
            
    if (order == null)
    {
        return ErrorResponse("Order not found. Please check the order number or email.");
    }
    
    return new ToolResponse
    {
        Type = "card",
        Content = FormatOrderCard(order)
    };
}
```

### Response Format Helpers

```csharp
public class ToolResponse
{
    public string Type { get; set; } // "card" or "carousel"
    public Card? Content { get; set; }
    public List<CarouselItem>? Items { get; set; }
}

public class Card
{
    public string Title { get; set; }
    public string? Image { get; set; }
    public List<CardSection> Sections { get; set; }
    public List<ToolAction> Actions { get; set; }
}

public class CardSection
{
    public string Heading { get; set; }
    public List<string> Items { get; set; }
}

public class CarouselItem
{
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string Image { get; set; }
    public List<string> Metadata { get; set; }
    public List<ToolAction> Actions { get; set; }
}

public class ToolAction
{
    public string Label { get; set; }
    public string Type { get; set; } = "tool_call"; // or "link"
    public string? Tool { get; set; }
    public object? Parameters { get; set; }
    public string? Url { get; set; }
    public string Style { get; set; } = "secondary"; // or "primary"
}
```

---

## Payment Flow

### Stripe Integration (Simplified)

```csharp
public class StripePaymentService
{
    private readonly StripeClient _stripe;
    private readonly IConfiguration _config;
    
    public async Task<PaymentIntent> CreatePaymentIntentAsync(Order order)
    {
        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(order.TotalAmount * 100), // Convert to cents
            Currency = "usd",
            AutomaticPaymentMethods = new()
            {
                Enabled = true
            },
            Metadata = new Dictionary<string, string>
            {
                { "order_id", order.Id.ToString() },
                { "order_number", order.OrderNumber }
            },
            // Return URL after payment
            ReceiptEmail = order.CustomerEmail
        };
        
        var service = new PaymentIntentService(_stripe);
        var paymentIntent = await service.CreateAsync(options);
        
        return paymentIntent;
    }
    
    // Webhook handler
    public async Task HandleWebhookAsync(string json, string signature)
    {
        var stripeEvent = EventUtility.ConstructEvent(
            json, 
            signature, 
            _config["Stripe:WebhookSecret"]
        );
        
        if (stripeEvent.Type == "payment_intent.succeeded")
        {
            var paymentIntent = (PaymentIntent)stripeEvent.Data.Object;
            await HandlePaymentSuccessAsync(paymentIntent);
        }
        else if (stripeEvent.Type == "payment_intent.payment_failed")
        {
            var paymentIntent = (PaymentIntent)stripeEvent.Data.Object;
            await HandlePaymentFailedAsync(paymentIntent);
        }
    }
    
    private async Task HandlePaymentSuccessAsync(PaymentIntent intent)
    {
        // Find order
        var order = await _db.Orders
            .FirstAsync(o => o.StripePaymentIntentId == intent.Id);
            
        // Update status
        order.Status = "confirmed";
        order.StripePaymentStatus = "succeeded";
        await _db.SaveChangesAsync();
        
        // Create Expedia booking
        await _expediaService.CreateBookingAsync(order);
        
        // Send confirmation email
        await _emailService.SendConfirmationAsync(order);
    }
}
```

### Email Confirmation (Simple)

```csharp
public class EmailService
{
    private readonly ResendClient _resend;
    
    public async Task SendConfirmationAsync(Order order)
    {
        var packageData = order.PackageData;
        
        var html = $@"
            <h1>Your Ski Trip is Confirmed!</h1>
            <p>Order Number: <strong>{order.OrderNumber}</strong></p>
            
            <h2>Trip Details</h2>
            <ul>
                <li>Destination: {packageData.Destination}</li>
                <li>Dates: {packageData.CheckInDate:MMM dd} - {packageData.CheckOutDate:MMM dd}</li>
                <li>Hotel: {packageData.Hotel.Name}</li>
                <li>Total: ${order.TotalAmount:F2}</li>
            </ul>
            
            <p>We'll send additional confirmation details from our partners shortly.</p>
            
            <p>Need help? Reply to this email.</p>
        ";
        
        var message = new EmailMessage
        {
            From = "bookings@skiexpert.com",
            To = order.CustomerEmail,
            Subject = $"Booking Confirmed - {order.OrderNumber}",
            Html = html
        };
        
        try
        {
            await _resend.SendEmailAsync(message);
            
            // Log success
            _db.EmailLogs.Add(new EmailLog
            {
                OrderId = order.Id,
                EmailType = "confirmation",
                Recipient = order.CustomerEmail,
                Subject = message.Subject,
                SentAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            // Log error
            _db.EmailLogs.Add(new EmailLog
            {
                OrderId = order.Id,
                EmailType = "confirmation",
                Recipient = order.CustomerEmail,
                Subject = message.Subject,
                Error = ex.Message
            });
            await _db.SaveChangesAsync();
            
            // Don't throw - email failure shouldn't break booking
            _logger.LogError(ex, "Failed to send confirmation email");
        }
    }
}
```

---

## MVP Development Plan

### Phase 1: Foundation (Week 1-2)

**Week 1: Setup**
- [ ] Create .NET 8 project
- [ ] Set up PostgreSQL (local + hosted)
- [ ] Configure Entity Framework Core
- [ ] Create database migrations
- [ ] Set up basic MCP server structure
- [ ] Deploy to Railway/Render (staging)

**Week 2: First Tool**
- [ ] Apply for Expedia partnership
- [ ] Implement session management (Postgres)
- [ ] Build `search_destinations` tool (mock data first)
- [ ] Create response formatters (card, carousel)
- [ ] Test locally with mock ChatGPT requests
- [ ] Set up logging (Serilog to file)

**Deliverable:** Working MCP server that responds to tool calls

---

### Phase 2: Expedia Integration (Week 3-4)

**Week 3: Hotel Search**
- [ ] Get Expedia sandbox credentials
- [ ] Implement Expedia authentication
- [ ] Build hotel search
- [ ] Build hotel details
- [ ] Replace mock data with real Expedia data
- [ ] Test with real queries

**Week 4: Hotel Booking**
- [ ] Implement Expedia booking creation
- [ ] Build `get_hotel_details` tool
- [ ] Test end-to-end hotel search → details flow
- [ ] Handle errors gracefully
- [ ] Add basic validation

**Deliverable:** Can search and view real hotels via Expedia

---

### Phase 3: Booking & Payment (Week 5-6)

**Week 5: Order System**
- [ ] Build order creation logic
- [ ] Implement user management
- [ ] Create `book_package` tool
- [ ] Add order number generation
- [ ] Build `get_booking_status` tool

**Week 6: Stripe Integration**
- [ ] Set up Stripe account
- [ ] Implement payment intent creation
- [ ] Build webhook handler
- [ ] Test payment flow
- [ ] Add payment error handling

**Deliverable:** Can create orders and process payments

---

### Phase 4: Viator & Email (Week 7-8)

**Week 7: Activities**
- [ ] Sign up for Viator API (Basic Access)
- [ ] Implement Viator search
- [ ] Build `search_activities` tool
- [ ] Generate tracked Viator URLs
- [ ] Test activity discovery flow

**Week 8: Notifications**
- [ ] Set up Resend account
- [ ] Implement email service
- [ ] Create confirmation email template
- [ ] Send emails on booking confirmation
- [ ] Test email delivery
- [ ] Add email logging

**Deliverable:** Can add activities and send confirmation emails

---

### Phase 5: Polish & Testing (Week 9-10)

**Week 9: Error Handling & Validation**
- [ ] Add comprehensive input validation
- [ ] Improve error messages
- [ ] Add retry logic for API calls
- [ ] Handle edge cases
- [ ] Add session expiry cleanup job
- [ ] Test cancellation flow

**Week 10: ChatGPT Integration**
- [ ] Register app with OpenAI
- [ ] Test in ChatGPT development environment
- [ ] Refine conversation flow
- [ ] Fix any integration issues
- [ ] Create app store listing
- [ ] Prepare marketing materials

**Deliverable:** Production-ready MVP

---

### Phase 6: Launch (Week 11)

- [ ] Apply for Expedia production access
- [ ] Deploy to production
- [ ] Set up domain and SSL
- [ ] Configure production Stripe webhooks
- [ ] Submit to ChatGPT app directory
- [ ] Monitor first bookings closely
- [ ] Gather user feedback

**Success Metrics:**
- ✅ App approved in ChatGPT directory
- ✅ 1 successful booking in first week
- ✅ No critical bugs
- ✅ Payment processing works
- ✅ Emails delivered successfully

---

## Project Structure (Simplified)

```
SkiExpert/
├── src/
│   └── SkiExpert/                        # Single project for MVP
│       ├── Program.cs                    # App entry point
│       │
│       ├── Mcp/                          # MCP Tools
│       │   ├── SearchDestinationsTool.cs
│       │   ├── GetHotelDetailsTool.cs
│       │   ├── SearchActivitiesTool.cs
│       │   ├── BookPackageTool.cs
│       │   ├── GetBookingStatusTool.cs
│       │   └── CancelBookingTool.cs
│       │
│       ├── Services/
│       │   ├── SessionManager.cs
│       │   ├── ExpediaService.cs
│       │   ├── ViatorService.cs
│       │   ├── StripePaymentService.cs
│       │   ├── EmailService.cs
│       │   └── BookingService.cs
│       │
│       ├── Data/
│       │   ├── SkiExpertDbContext.cs
│       │   ├── Entities/
│       │   │   ├── User.cs
│       │   │   ├── Order.cs
│       │   │   ├── Booking.cs
│       │   │   ├── SessionState.cs
│       │   │   └── EmailLog.cs
│       │   └── Migrations/
│       │
│       └── Models/
│           ├── TripPlanningSession.cs
│           ├── ToolResponse.cs
│           ├── Hotel.cs
│           ├── Activity.cs
│           └── PackageData.cs
│
├── tests/
│   └── SkiExpert.Tests/
│       ├── Tools/
│       ├── Services/
│       └── Integration/
│
├── .gitignore
├── README.md
├── MVP_TECHNICAL_PLAN.md               # This document
├── TECHNICAL_PLAN.md                   # Original detailed plan
├── Dockerfile                          # For deployment
└── SkiExpert.sln
```

**Why Single Project?**
- Simpler to develop and debug
- Faster compilation
- Easier deployment
- Can split into multiple projects later if needed
- Perfect for MVP scope

---

## What's Different from Original Plan?

### Removed for MVP:

1. **No Redis** - Postgres handles sessions
2. **No Application Insights** - Basic logging only
3. **No Amadeus** - Expedia only for hotels
4. **No Direct Ski Pass Integration** - Via Viator only
5. **No FastEndpoints** - Minimal APIs sufficient
6. **No Multiple Projects** - Single project
7. **No Advanced Caching** - Optimize later
8. **No Flights** - Hotels + activities only
9. **No Azure Full Stack** - Simpler hosting
10. **No Complex Monitoring** - Add when needed

### Simplified:

1. **Session Storage** - Postgres JSONB instead of Redis
2. **Database Schema** - Fewer tables, more JSON
3. **API Integrations** - 2 providers instead of 5+
4. **Project Structure** - Single project instead of 6
5. **Deployment** - Railway/Render instead of Azure Container Apps
6. **Email** - Simple templates instead of complex system
7. **Error Handling** - Basic retry logic instead of circuit breakers

### When to Add Back:

**After 100 Bookings:**
- Add Redis for session caching
- Add Application Insights
- Add more hotels providers (Amadeus, Hotelbeds)
- Split into multiple projects

**After 500 Bookings:**
- Add direct ski pass integrations
- Add flights
- Add advanced monitoring
- Migrate to Azure full stack
- Add complex caching strategies

**After 1000 Bookings:**
- Add real-time availability
- Add booking modifications
- Add multi-currency support
- Add mobile app

---

## Cost Estimate (MVP)

### Monthly Operating Costs:

**Hosting:**
- Railway.app or Render.com: $15-25/month
- PostgreSQL (managed): $15-25/month
- Domain + SSL: $2/month
- **Subtotal: ~$35/month**

**Services:**
- Stripe: $0 (pay-per-transaction: 2.9% + $0.30)
- Resend: $0 (20,000 emails/month free)
- Expedia API: $0 (commission-based)
- Viator API: $0 (commission-based)
- **Subtotal: $0 fixed**

**Total MVP Cost: ~$35/month + transaction fees**

**Break-even:** 1-2 bookings per month

---

## Getting Started Checklist

### Pre-Development:

- [ ] Apply for Expedia Rapid API partnership
- [ ] Sign up for Viator Partner API
- [ ] Create Stripe account
- [ ] Create Resend account
- [ ] Choose hosting provider (Railway/Render)
- [ ] Set up GitHub repository

### Development Setup:

- [ ] Install .NET 8 SDK
- [ ] Install PostgreSQL locally
- [ ] Install Cursor/VS Code
- [ ] Create .NET solution
- [ ] Set up Entity Framework Core
- [ ] Create initial migrations
- [ ] Set up logging

### API Setup:

- [ ] Get Expedia sandbox credentials
- [ ] Get Viator API key
- [ ] Get Stripe test keys
- [ ] Get Resend API key
- [ ] Test API connectivity

### First Milestone:

- [ ] Implement session management
- [ ] Build first MCP tool
- [ ] Test with mock data
- [ ] Deploy to staging
- [ ] Integrate real Expedia data
- [ ] Test end-to-end

---

## Support & Resources

### Documentation:

- Expedia Rapid API: https://developers.expediagroup.com/rapid/
- Viator Partner API: https://docs.viator.com/partner-api/
- Stripe Payments: https://stripe.com/docs/payments
- MCP Protocol: https://modelcontextprotocol.io/
- .NET 8: https://learn.microsoft.com/en-us/dotnet/

### Community:

- Model Context Protocol Discord
- .NET Discord
- r/dotnet on Reddit

---

**MVP Technical Plan v1.0**  
**Last Updated:** November 7, 2025  
**Status:** Ready to Build  
**Timeline:** 11 weeks to launch  
**Budget:** ~$35/month

**Start with this plan. Ship fast. Iterate based on real user feedback.**

