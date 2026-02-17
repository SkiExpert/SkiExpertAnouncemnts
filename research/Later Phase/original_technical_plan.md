# Technical Plan: SkiExpert - Ski Trip Agent Application

## Executive Summary

SkiExpert is a specialized travel agent application focused exclusively on mountain ski trips. The platform will generate revenue through commissions on bookings for lodging, ski passes, equipment rentals, and lessons. The application will integrate with major travel APIs, ski pass providers, and rental shops to offer comprehensive ski trip packages. The backend will be developed using C# .NET, with Mercury for banking services and Stripe for payment processing.

## Business Model & Target Metrics

Based on `Targets.md`, the platform targets:
- **Average Booking Value**: $1,500
- **Peak Season (Dec-March)**: 25 bookings/day
- **Off-Season**: 7 bookings/day
- **Revenue Channels**: 
  - Commission on lodging bookings via Expedia/Amadeus
  - Commission on ski pass sales (Ikon, Epic, Indy)
  - Commission on ski lessons
  - Commission on equipment rentals

## System Architecture

### Overview

The application will follow a modular, microservices-oriented architecture built on .NET:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Web UI       │  │ ChatBot UI   │  │ Mobile UI    │      │
│  │ (Vue.js)     │  │ (GPT Chat)   │  │ (Future)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                  API Gateway Layer                            │
│            (FastEndpoints)                                    │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│              Backend Services (.NET)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Booking     │ │ Order       │ │ Notification│          │
│  │ Service     │ │ Management  │ │ Service    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Payment     │ │ MCP Server  │ │ Integration│          │
│  │ Service     │ │ Service     │ │ Service    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│            External API Integrations                          │
│  Expedia │ Amadeus │ Ikon │ Epic │ Indy │ Stripe │ Mercury│
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                  │
│          SQL Server / PostgreSQL Database                     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- **Framework**: FastEndpoints (.NET 8.0+)
- **Language**: C# 12
- **ORM**: Entity Framework Core
- **Authentication**: FastEndpoints Auth / JWT
- **API Versioning**: FastEndpoints built-in versioning
- **Logging**: Serilog
- **Caching**: Redis (for API response caching)

**Frontend:**
- **Primary**: Vue.js 3 with TypeScript
- **State Management**: Pinia (Vue state management)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Chat Interface**: OpenAI ChatGPT SDK / Custom GPT integration

**Database:**
- **Primary**: SQL Server or PostgreSQL
- **Caching**: Redis
- **Search**: Azure Cognitive Search or Elasticsearch (for ski resort/pass search)

**Infrastructure:**
- **Hosting**: Azure App Service / Azure Container Apps
- **CDN**: Azure CDN
- **Email Service**: SendGrid or Resend
- **Monitoring**: Application Insights / Seq
- **CI/CD**: GitHub Actions / Azure DevOps

## Core Functionality & User Journey

### 1. Discovery & Search

**User Flow:**
- Users search for "skiing", "learn to ski", "ski mountains", "snowboarding lessons"
- Discovery handled via:
  - **ChatGPT Integration**: Natural language queries routed to SkiExpert MCP server
  - **SEO Optimization**: Content marketing and blog posts
  - **Paid Advertising**: Google Ads, Facebook/Instagram ads targeting ski enthusiasts

**Technical Implementation:**
- Develop MCP (Model Context Protocol) server that exposes SkiExpert capabilities to ChatGPT
- MCP server endpoints:
  - `search_resorts` - Search ski resorts by location, preferences
  - `get_package_options` - Retrieve available packages
  - `get_pass_information` - Query pass options (Ikon, Epic, Indy)
  - `check_availability` - Real-time availability checking

### 2. Trip Planning Conversation

**Information Gathering:**
The chatbot/system collects:
- **Travel Dates**: Specific dates or date ranges
- **Party Composition**: 
  - Number of adults
  - Number of children (ages for appropriate lesson matching)
- **Ski Pass Needs**: 
  - Number of passes required
  - Pass type preferences (Ikon vs Epic vs Indy vs single-mountain)
- **Equipment Rentals**: 
  - Number of rental sets needed
  - Types (skis, snowboard, boots, poles, helmets)
  - Duration
- **Lesson Requirements**: 
  - Beginner/Intermediate/Advanced lessons
  - Private vs Group lessons
  - Number of participants

**Technical Implementation:**
- Conversational state management using Pinia store (Vue.js)
- Multi-step form flow with validation (Vue form libraries)
- Real-time price calculations as user makes selections

### 3. Itinerary Generation & Package Selection

**Output:**
- Complete itinerary with:
  - Lodging options (from Expedia/Amadeus)
  - Ski pass selections and pricing
  - Equipment rental reservations
  - Lesson bookings with time slots
  - Total package price breakdown
- Multiple package options presented (Budget, Standard, Premium)

**Technical Implementation:**
- Aggregation service that queries all integrated APIs in parallel
- Package builder that combines lodging + passes + rentals + lessons
- Pricing engine that calculates totals including commissions
- Caching layer for frequently requested packages

### 4. Booking & Payment

**Process:**
- User selects preferred package
- Review summary page with all details
- Stripe Checkout integration
- Order confirmation with unique Order ID
- Email confirmation sent

**Technical Implementation:**
- Stripe payment processing (FastEndpoints endpoints for payment handling)
- Webhook handling for payment status updates (FastEndpoints webhook endpoints)
- Order creation in database
- Initial status: `PENDING_CONFIRMATION`

### 5. Order Tracking & Management

**Features:**
- Users receive email updates at key lifecycle stages
- Email contains Order ID and link to order portal
- Users can view/modify/cancel bookings using Order ID

**Order Lifecycle States:**
```
PENDING_CONFIRMATION → CONFIRMED → IN_PROGRESS → COMPLETED
                      ↓
                   CANCELLED
```

**Technical Implementation:**
- Background job service (Hangfire or Azure Functions) monitoring order status
- Email service integration (SendGrid/Resend)
- User portal with Order ID lookup
- Update/cancellation APIs with proper validation and refund handling

## API Integrations

### 1. Expedia Group Rapid API

**Purpose**: Access global lodging inventory for ski destinations

**Integration Details:**
- **Partnership Application**: Apply at [Expedia Rapid API Partner Portal](https://partner.expediagroup.com/en-us/join-us/rapid-api)
- **Authentication**: Signature-based authentication using API key and shared secret
  - Method: SHA-512 signature generation
  - Header format: `Authorization: EAN APIKey={apiKey},Signature={sha512Hash},timestamp={unixTimestamp}`
- **Setup Documentation**: [Expedia Developer Hub - Rapid Setup](https://developers.expediagroup.com/rapid/setup)

**Key Endpoints:**
- `/properties/search` - Search hotels/lodging by location
- `/properties/content` - Get property details, images, amenities
- `/bookings/book` - Create reservations
- `/bookings/manage` - Retrieve/modify/cancel bookings

**Implementation Plan:**
```csharp
// Example service structure
public class ExpediaRapidService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    
    // Methods:
    // - SearchProperties(location, dates, guests)
    // - GetPropertyDetails(propertyId)
    // - CreateBooking(propertyId, guestInfo)
    // - CancelBooking(bookingId)
}
```

**Commission Structure**: Expedia typically offers 8-15% commission on bookings, varies by property and partnership tier.

### 2. Amadeus Self-Service APIs

**Purpose**: Access additional travel services (flights, car rentals, hotel alternatives)

**Integration Details:**
- **Registration**: [Amadeus for Developers Portal](https://developers.amadeus.com/)
- **Authentication**: OAuth 2.0 token-based
- **API Types**: 
  - Self-Service APIs (pay-as-you-go, free monthly quota)
  - Enterprise APIs (monthly fee, includes support)
- **Quick Start**: [Amadeus Quick Start Guide](https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/quick-start/)

**Key APIs:**
- Flight Search & Booking APIs
- Hotel Search APIs (alternative/complement to Expedia)
- Car Rental APIs
- Airport & City Code APIs

**Implementation Plan:**
```csharp
public class AmadeusService
{
    private readonly HttpClient _httpClient;
    private readonly AmadeusTokenService _tokenService;
    
    // Methods:
    // - SearchFlights(origin, destination, dates)
    // - SearchHotels(location, dates)
    // - BookFlight(offerId)
    // - BookHotel(offerId)
}
```

**Pricing**: Free tier available, then pay-per-call pricing structure.

### 3. Ski Pass Provider Integrations

#### 3.1 Indy Pass

**Priority**: High (leverage personal connection with owner)

**Integration Approach:**
- **Initial**: Reach out directly to Indy Pass owner for API access
- **MCP Protocol**: Develop custom MCP server specifically for Indy Pass
- **Endpoints Needed**:
  - Pass availability checking
  - Pass purchase/booking
  - Lesson booking
  - Order status tracking

**MCP Server Structure:**
```csharp
// MCP Server for Indy Pass
public class IndyPassMcpServer
{
    // MCP Protocol Implementation
    // Tools exposed:
    // - search_indy_pass_resorts(location)
    // - check_pass_availability(dates, resort)
    // - book_indy_pass(resort, dates, guests)
    // - book_indy_lesson(resort, dates, level)
    // - get_indy_order_status(orderId)
}
```

#### 3.2 Ikon Pass

**Integration Approach:**
- **Research**: Investigate Ikon Pass API availability
- **Partnership**: Contact Ikon Pass partner relations team
- **Alternative**: If no API, investigate web scraping or manual booking workflows (not ideal)

**Ikon Pass Structure:**
- Multiple resort access
- Different pass tiers (Full Ikon, Ikon Base, Ikon Session)
- Lesson programs at each resort

#### 3.3 Epic Pass

**Integration Approach:**
- **Research**: Investigate Epic Pass API/partnership program
- **Partnership**: Contact Vail Resorts (Epic Pass owner) B2B division
- **Note**: Epic Pass has similar structure to Ikon

#### 3.4 Individual Ski Mountains

**Integration Approach:**
- **Direct Partnerships**: Establish relationships with individual resorts
- **Common Patterns**: Many resorts use:
  - Resort-specific booking systems
  - Third-party platforms (e.g., Inntopia, RealPage, etc.)
- **MCP Protocol**: Generic ski resort MCP server that can be configured per resort

**Priority Resorts**: Target top 50-100 ski resorts initially, expand based on demand

### 4. Equipment Rental Shop Integrations

**Challenge**: Many ski rental shops use different POS/booking systems

**Integration Approaches:**

**Option A: Direct API Integration**
- Partner with shops that have APIs
- Develop shop-specific API clients

**Option B: Third-Party Aggregator**
- Partner with rental aggregators (if they exist)
- Research: SkiButler, SkiRentals.com APIs

**Option C: Custom Booking Portal**
- Provide shops with booking portal/login
- Shops manually confirm bookings (MVP approach)
- Eventually move to API integration

**Implementation Structure:**
```csharp
public interface IRentalShopService
{
    Task<List<RentalShop>> SearchShops(Location location);
    Task<List<Equipment>> GetAvailableEquipment(int shopId, DateTime startDate, DateTime endDate);
    Task<BookingResult> CreateRentalBooking(RentalBookingRequest request);
}

// Implementations:
// - IndyRentalShopService
// - GenericRentalShopService (with adapter pattern)
```

### 5. Payment Processing: Stripe

**Integration Details:**
- **Account Setup**: Create Stripe account for SkiExpert business
- **.NET SDK**: Use official Stripe.NET library
- **Payment Methods**: Credit cards, Apple Pay, Google Pay
- **Features Required**:
  - Payment Intents API (recommended for .NET)
  - Webhook handling for payment status
  - Refund capabilities
  - Subscription support (for repeat customers)

**Implementation:**
```csharp
public class StripePaymentService
{
    private readonly StripeService _stripeService;
    
    // Methods:
    // - CreatePaymentIntent(orderId, amount, customerEmail)
    // - ConfirmPayment(paymentIntentId)
    // - ProcessRefund(paymentIntentId, amount)
    // - HandleWebhook(webhookEvent) // For payment status updates
}
```

**Webhook Events to Handle:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

**Security**: Ensure PCI compliance; use Stripe.js for client-side tokenization

### 6. Banking: Mercury

**Integration Details:**
- **Account Setup**: Open business account at [Mercury](https://mercury.com/)
- **API Integration**: Mercury provides REST API for:
  - Account balance checking
  - Transaction history
  - Transfer initiation
- **Webhooks**: Set up webhooks for transaction notifications

**Use Cases:**
- Track commission payments received
- Monitor cash flow
- Reconcile Stripe deposits with Mercury account
- Automated transfers (if needed for payouts to suppliers)

**Implementation:**
```csharp
public class MercuryBankingService
{
    private readonly HttpClient _httpClient;
    
    // Methods:
    // - GetAccountBalance()
    // - GetTransactions(startDate, endDate)
    // - InitiateTransfer(amount, destination)
    // - HandleWebhook(webhookEvent)
}
```

**Note**: Review Mercury API documentation for exact endpoints and authentication method

## MCP Server Development

### Model Context Protocol Overview

MCP (Model Context Protocol) is OpenAI's protocol for connecting applications to AI models. SkiExpert will expose its capabilities via MCP servers that ChatGPT can call.

### MCP Server Architecture

**Required MCP Servers:**

1. **SkiExpert Core MCP Server**
   - Exposes main booking/search capabilities to ChatGPT
   - Tools: `search_ski_trips`, `get_package_details`, `create_booking`

2. **Indy Pass MCP Server**
   - Specific integration for Indy Pass
   - Tools: `search_indy_resorts`, `book_indy_pass`, `book_indy_lesson`

3. **Generic Ski Resort MCP Server**
   - Configurable for Ikon, Epic, or individual resorts
   - Tools: `search_resorts`, `check_pass_availability`, `book_pass`, `book_lesson`

4. **Rental Shop MCP Server**
   - Equipment rental capabilities
   - Tools: `search_rental_shops`, `check_equipment_availability`, `book_rental`

**MCP Server Implementation (.NET):**
- **Library**: Need to implement MCP protocol or find .NET library
- **Protocol**: HTTP-based or WebSocket-based (research OpenAI MCP spec)
- **Structure**: Each MCP server runs as separate service/process

**Reference**: Research OpenAI's MCP specification for exact protocol details

## Database Schema Design

### Core Tables

**Users**
```sql
Users (
    Id (PK, Guid)
    Email (unique)
    FirstName
    LastName
    PhoneNumber
    CreatedAt
    UpdatedAt
)
```

**Orders**
```sql
Orders (
    Id (PK, Guid)
    OrderId (unique, varchar) -- User-facing Order ID
    UserId (FK to Users)
    Status (enum: PendingConfirmation, Confirmed, InProgress, Completed, Cancelled)
    TotalAmount (decimal)
    Currency (varchar, default 'USD')
    StripePaymentIntentId (nullable)
    CreatedAt
    UpdatedAt
)
```

**OrderItems**
```sql
OrderItems (
    Id (PK, Guid)
    OrderId (FK to Orders)
    ItemType (enum: Lodging, SkiPass, Rental, Lesson)
    ItemName (varchar)
    ProviderId (varchar) -- External provider ID
    ProviderOrderId (nullable) -- Order ID from provider
    Quantity (int)
    UnitPrice (decimal)
    TotalPrice (decimal)
    Status (enum: Pending, Confirmed, Cancelled, Refunded)
    Metadata (JSON) -- Flexible storage for provider-specific data
    CreatedAt
    UpdatedAt
)
```

**LodgingBookings**
```sql
LodgingBookings (
    Id (PK, Guid)
    OrderItemId (FK to OrderItems)
    Provider (enum: Expedia, Amadeus)
    PropertyId (varchar)
    CheckInDate
    CheckOutDate
    GuestCount
    ConfirmationNumber (varchar)
    CancellationPolicy (text)
    ProviderMetadata (JSON)
    CreatedAt
    UpdatedAt
)
```

**SkiPassBookings**
```sql
SkiPassBookings (
    Id (PK, Guid)
    OrderItemId (FK to OrderItems)
    Provider (enum: Ikon, Epic, Indy, IndividualResort)
    ResortId (varchar)
    ResortName (varchar)
    PassType (varchar)
    StartDate
    EndDate
    GuestCount
    ConfirmationNumber (varchar)
    ProviderMetadata (JSON)
    CreatedAt
    UpdatedAt
)
```

**RentalBookings**
```sql
RentalBookings (
    Id (PK, Guid)
    OrderItemId (FK to OrderItems)
    ShopId (varchar)
    ShopName (varchar)
    EquipmentType (varchar) -- Skis, Snowboard, etc.
    EquipmentDetails (JSON)
    RentalStartDate
    RentalEndDate
    GuestCount
    ConfirmationNumber (varchar)
    ProviderMetadata (JSON)
    CreatedAt
    UpdatedAt
)
```

**LessonBookings**
```sql
LessonBookings (
    Id (PK, Guid)
    OrderItemId (FK to OrderItems)
    ResortId (varchar)
    ResortName (varchar)
    LessonType (enum: Private, Group)
    SkillLevel (enum: Beginner, Intermediate, Advanced)
    LessonDate
    LessonTime
    ParticipantCount
    ParticipantAges (JSON array)
    ConfirmationNumber (varchar)
    ProviderMetadata (JSON)
    CreatedAt
    UpdatedAt
)
```

**EmailNotifications**
```sql
EmailNotifications (
    Id (PK, Guid)
    OrderId (FK to Orders)
    EmailType (enum: OrderConfirmation, StatusUpdate, Reminder, Cancellation)
    RecipientEmail
    Subject
    Body (text)
    SentAt (nullable)
    CreatedAt
)
```

**OrderStatusHistory**
```sql
OrderStatusHistory (
    Id (PK, Guid)
    OrderId (FK to Orders)
    PreviousStatus (enum)
    NewStatus (enum)
    ChangedBy (varchar) -- System or User
    Notes (text)
    CreatedAt
)
```

### Indexes

- `Orders.OrderId` (unique index for lookups)
- `Orders.UserId` (for user order queries)
- `Orders.Status` (for status-based queries)
- `OrderItems.OrderId` (for order details)
- `EmailNotifications.OrderId` (for notification history)

## Email Notification System

### Email Service Integration

**Service Choice**: SendGrid or Resend (recommend Resend for modern API and better deliverability)

**Email Templates:**

1. **Order Confirmation**
   - Sent immediately after payment success
   - Contains: Order ID, itinerary summary, booking confirmation numbers
   - Call-to-action: "View Order" link with Order ID

2. **Status Update Emails**
   - Sent when order status changes
   - Contains: Current status, relevant details, next steps

3. **Booking Reminders**
   - Sent 7 days before trip start
   - Contains: Reminder of dates, what to bring, contact info

4. **Cancellation Confirmation**
   - Sent when order cancelled
   - Contains: Refund details, cancellation policy

**Implementation:**
```csharp
public class EmailService
{
    private readonly IEmailProvider _emailProvider; // SendGrid/Resend
    
    // Methods:
    // - SendOrderConfirmation(orderId)
    // - SendStatusUpdate(orderId, newStatus)
    // - SendReminder(orderId)
    // - SendCancellationConfirmation(orderId)
}
```

## Compliance & Design Guidelines

### OpenAI ChatGPT Apps SDK Guidelines

Reference: [OpenAI App Design Guidelines](https://developers.openai.com/apps-sdk/concepts/design-guidelines)

**Key Principles:**

1. **Conversational**
   - Interactions should feel natural and fit seamlessly into ChatGPT conversation flow
   - Avoid overly structured forms; use conversational prompts
   - Example: "What dates are you planning to ski?" vs "Select check-in date: [dropdown]"

2. **Intelligent**
   - Be context-aware; remember previous conversation details
   - Anticipate user needs (e.g., suggest lessons if they're beginners)
   - Support follow-up questions naturally

3. **Simple**
   - Focus on single clear action per interaction
   - Minimize information overload
   - Present package options clearly without overwhelming detail

4. **Responsive**
   - Fast API responses (< 2 seconds for most queries)
   - Show loading states appropriately
   - Use async processing for complex operations

5. **Accessible**
   - Support screen readers
   - Provide text alternatives for images
   - Ensure keyboard navigation works

**MCP Server Positioning:**
- When user searches for skiing/ski trips → ChatGPT routes to SkiExpert MCP
- MCP server provides contextual tools based on conversation
- Responses formatted conversationally, not like a website

## Security & Compliance

### Data Security
- **Encryption**: All sensitive data encrypted at rest (database) and in transit (HTTPS/TLS)
- **PCI Compliance**: Use Stripe.js for payment handling in Vue.js frontend; never store raw card data
- **API Keys**: Store in Azure Key Vault or similar secure configuration
- **Authentication**: JWT tokens for API access (FastEndpoints auth)
- **Authorization**: Role-based access control (Customer, Admin, Partner)

### Privacy
- **GDPR Compliance**: User data deletion, privacy policy, consent management
- **Data Retention**: Define retention policies for orders, user data
- **Third-Party Sharing**: Clear disclosure of data sharing with Expedia, Amadeus, etc.

### Business Compliance
- **Travel Agent Licensing**: Research state-by-state requirements
- **Terms of Service**: Define cancellation policies, refund policies
- **Insurance**: Consider errors & omissions insurance for travel bookings

## Development Phases

### Phase 1: MVP Foundation (Weeks 1-8)
**Goal**: Basic booking flow with one lodging provider

**Deliverables:**
- Project structure setup (.NET solution with FastEndpoints)
- Database schema implementation
- Basic API endpoints (FastEndpoints)
- Expedia Rapid API integration (sandbox)
- Simple Vue.js frontend with TypeScript
- Stripe payment integration
- Order management basics
- Email notifications (order confirmations)

**Success Criteria:**
- Can search for lodging via Expedia API
- Can create an order and process payment via Stripe
- Order confirmation email sent
- Order ID can be used to retrieve order details

### Phase 2: Full Lodging Integration (Weeks 9-12)
**Goal**: Complete lodging booking experience

**Deliverables:**
- Expedia Rapid API full integration (production)
- Amadeus API integration (as alternative/complement)
- Enhanced order management
- Order modification/cancellation flows
- Refund processing via Stripe
- User portal for order viewing

### Phase 3: Ski Pass Integration (Weeks 13-20)
**Goal**: Add ski pass booking capabilities

**Deliverables:**
- Indy Pass MCP server (leverage connection)
- Indy Pass booking integration
- Ikon/Epic Pass research & initial integration
- Pass availability checking
- Pass + lodging package creation
- Pricing engine enhancements

### Phase 4: Rentals & Lessons (Weeks 21-28)
**Goal**: Complete trip package with all components

**Deliverables:**
- Rental shop integration (start with manual workflow if needed)
- Lesson booking integration
- Package builder (lodging + passes + rentals + lessons)
- Complex pricing calculations
- Complete itinerary generation

### Phase 5: ChatGPT/MCP Integration (Weeks 29-32)
**Goal**: Launch on ChatGPT platform

**Deliverables:**
- MCP server implementation for all services
- ChatGPT App submission
- Conversational flow optimization
- Discovery & search optimization
- Marketing materials

### Phase 6: Scale & Optimize (Ongoing)
**Goals**: Improve performance, add features

**Deliverables:**
- Performance optimization
- Caching strategies
- Additional resort/pass integrations
- Analytics & reporting
- Customer feedback integration

## Project Structure (Preview)

```
SkiExpert/
├── src/
│   ├── SkiExpert.Api/              # Main API Gateway (FastEndpoints)
│   ├── SkiExpert.Booking/          # Booking Service
│   ├── SkiExpert.OrderManagement/  # Order Service
│   ├── SkiExpert.Payment/          # Payment Service
│   ├── SkiExpert.Notification/     # Email Service
│   ├── SkiExpert.Integrations/     # External API integrations
│   │   ├── Expedia/
│   │   ├── Amadeus/
│   │   ├── IndyPass/
│   │   ├── IkonPass/
│   │   ├── EpicPass/
│   │   └── RentalShops/
│   ├── SkiExpert.McpServers/       # MCP Server implementations
│   ├── SkiExpert.Data/             # EF Core DbContext, entities
│   └── SkiExpert.Shared/           # Shared models, utilities
├── frontend/
│   ├── src/                        # Vue.js application source
│   │   ├── components/            # Vue components
│   │   ├── stores/                # Pinia stores
│   │   ├── views/                 # Vue views/pages
│   │   ├── composables/          # Vue composables
│   │   ├── router/                # Vue Router config
│   │   └── main.ts                # Entry point
│   ├── package.json
│   ├── tsconfig.json              # TypeScript config
│   └── vite.config.ts             # Vite config
├── tests/
│   ├── SkiExpert.Api.Tests/
│   ├── SkiExpert.Integrations.Tests/
│   └── SkiExpert.Unit.Tests/
├── docs/
│   └── api-documentation.md
├── docker/
│   └── Dockerfile
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── appsettings.json
├── appsettings.Development.json
└── README.md
```

**Note**: This structure will be finalized and created in the next phase after reviewing the technical plan.

## Risk Assessment & Mitigation

### Technical Risks

1. **API Availability**
   - **Risk**: External APIs change or become unavailable
   - **Mitigation**: Implement adapter pattern, cache API responses, have fallback providers

2. **Rate Limiting**
   - **Risk**: API rate limits exceeded during peak season
   - **Mitigation**: Implement caching, request queuing, multiple API credentials if possible

3. **Integration Complexity**
   - **Risk**: Ski pass/rental APIs may not exist or be complex
   - **Mitigation**: Start with manual workflows where needed, iterate to automation

### Business Risks

1. **Commission Rates**
   - **Risk**: Commission rates may be lower than expected
   - **Mitigation**: Negotiate favorable rates, diversify revenue sources

2. **Competition**
   - **Risk**: Major players (Expedia, Booking.com) launch ski-specific agents
   - **Mitigation**: Focus on niche expertise, superior user experience, personalization

3. **Seasonality**
   - **Risk**: Business is seasonal (winter months)
   - **Mitigation**: Expand to summer activities (hiking, mountain biking) in future

## Success Metrics

### Technical Metrics
- API response time: < 2 seconds (95th percentile)
- Uptime: 99.9%
- Order processing success rate: > 99%
- Payment success rate: > 95%

### Business Metrics
- Bookings per day (target: 25 peak, 7 off-peak)
- Average booking value: $1,500
- Conversion rate: Target 1-2% (search → booking)
- Customer retention rate: Track repeat customers

## Next Steps

1. **Review & Refine**: Review this technical plan, gather feedback, refine details
2. **Partnership Outreach**: 
   - Apply for Expedia Rapid API partnership
   - Register for Amadeus Self-Service API
   - Contact Indy Pass owner to discuss API access
   - Research Ikon/Epic Pass partnership programs
3. **Project Setup**: After plan approval, create project structure and begin Phase 1 development
4. **Legal/Compliance**: Research travel agent licensing requirements in target states
5. **Business Setup**: 
   - Register business entity
   - Open Mercury business account
   - Set up Stripe business account

## References

- [FastEndpoints Documentation](https://fastendpoints.com/) - Minimal API framework for .NET
- [Vue.js Documentation](https://vuejs.org/) - Progressive JavaScript framework
- [Vue.js with TypeScript Guide](https://vuejs.org/guide/typescript/overview.html) - TypeScript integration for Vue.js
- [Pinia State Management](https://pinia.vuejs.org/) - Official state management for Vue
- [Vite Build Tool](https://vitejs.dev/) - Next generation frontend tooling
- [Expedia Rapid API Partnership](https://partner.expediagroup.com/en-us/join-us/rapid-api)
- [Expedia Rapid API Setup Documentation](https://developers.expediagroup.com/rapid/setup)
- [Amadeus for Developers](https://developers.amadeus.com/)
- [Amadeus Quick Start Guide](https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/quick-start/)
- [OpenAI App Design Guidelines](https://developers.openai.com/apps-sdk/concepts/design-guidelines)
- [Mercury Banking](https://mercury.com/)
- [Stripe Payment Processing](https://stripe.com/docs)
- [Ski.com Reference](https://www.ski.com/) - For understanding market expectations

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Status**: Draft - Awaiting Review

