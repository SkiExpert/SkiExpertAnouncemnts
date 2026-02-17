# Executive Summary: Technical Plan Review

**Date:** November 6, 2025  
**For:** SkiExpert Development Team  
**Re:** OpenAI Apps SDK Architecture Review

---

## 🚨 Critical Finding

**Your technical plan fundamentally misunderstands how OpenAI Apps SDK works.**

**Current Plan Says:**
- Build Vue.js frontend
- Create multi-step form flow
- Deploy separate web application

**Reality:**
- ❌ **NO separate frontend needed**
- ❌ **NO Vue.js, React, or any frontend framework**
- ✅ **Apps live INSIDE ChatGPT**
- ✅ **ChatGPT renders all UI**
- ✅ **Your backend provides structured JSON responses**

---

## What This Means

### You Are Building:
1. **.NET MCP Server** - Exposes tools ChatGPT can call
2. **Structured Response Formatters** - Returns data ChatGPT renders as cards/carousels
3. **Business Logic** - Package building, pricing, booking
4. **API Integrations** - Expedia, ski passes, rentals
5. **Conversational State Management** - Tracks user conversation

### You Are NOT Building:
1. ~~Vue.js frontend~~
2. ~~React components~~
3. ~~Custom UI/UX~~
4. ~~Multi-step forms~~
5. ~~Frontend routing~~

---

## Impact Analysis

### 💰 Cost Impact: **REDUCED by ~40%**
- No frontend developers needed
- No UI/UX design work
- No frontend hosting/CDN
- No frontend build pipeline
- Simpler architecture = lower maintenance

### ⏱️ Timeline Impact: **FASTER by 2-3 weeks**
- Removing Vue.js work: **-4 to 6 weeks**
- Adding MCP learning curve: **+2 to 3 weeks**
- **Net savings: 2-3 weeks to MVP**

### 👥 Team Impact: **Backend-focused**
- Need: .NET developers
- Need: API integration specialists
- Need: Conversational design thinking
- Don't need: Frontend developers
- Don't need: UI/UX designers (ChatGPT provides UI)

---

## How OpenAI Apps SDK Actually Works

### User Experience Flow

```
┌────────────────────────────────────────────────────────┐
│                     ChatGPT App                         │
│                                                         │
│  User: "I want to plan a ski trip to Colorado"        │
│                                                         │
│  ChatGPT: "Great! When would you like to go?"         │
│                                                         │
│  User: "January 15-20, 4 people"                       │
│                                                         │
│  [ChatGPT calls your MCP tool: search_destinations()]  │
│                                                         │
│  ┌─────────────────────────────────────────────┐      │
│  │ ✨ Inline Carousel (ChatGPT renders this)    │      │
│  │                                              │      │
│  │  [Vail]    [Keystone]    [Breckenridge]    │      │
│  │  $4,850    $3,245        $3,890             │      │
│  │  [View]    [View]        [View]             │      │
│  └─────────────────────────────────────────────┘      │
│                                                         │
│  User: "Tell me about Keystone"                        │
│                                                         │
│  [ChatGPT calls: get_resort_details("keystone")]      │
│                                                         │
│  ┌─────────────────────────────────────────────┐      │
│  │ ✨ Inline Card (ChatGPT renders this)        │      │
│  │                                              │      │
│  │  Keystone Resort Package                    │      │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━            │      │
│  │  [Resort Image]                             │      │
│  │                                              │      │
│  │  Includes:                                  │      │
│  │  ✓ 4 nights lodging                        │      │
│  │  ✓ 4-day lift tickets (4 people)           │      │
│  │  ✓ Kids lessons included                   │      │
│  │                                              │      │
│  │  Total: $3,245                              │      │
│  │                                              │      │
│  │  [Customize] [Book Now]                     │      │
│  └─────────────────────────────────────────────┘      │
│                                                         │
│  User: "Book it"                                       │
│                                                         │
│  [ChatGPT calls: book_package()]                       │
└────────────────────────────────────────────────────────┘

All UI above is rendered by ChatGPT.
Your backend just returns structured JSON data.
```

### Technical Flow

```
┌──────────────┐
│   ChatGPT    │ ← User interacts here
└──────┬───────┘
       │
       │ MCP Protocol
       │ (Tool Calls)
       ▼
┌─────────────────────────┐
│  Your .NET MCP Server   │ ← You build this
│                         │
│  Tools:                 │
│  • search_destinations  │
│  • get_resort_details   │
│  • book_package         │
│                         │
│  Returns JSON:          │
│  {                      │
│    "display_mode":      │
│      "inline_carousel", │
│    "content": {...}     │
│  }                      │
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Your Business Logic    │
│  • Expedia API          │
│  • Ski Pass APIs        │
│  • Pricing Engine       │
│  • Booking System       │
└─────────────────────────┘
```

---

## The Ski.com Data Fields ✅

Your ski.com form fields are **excellent** and should be used. But they must be collected **conversationally**, not as a form.

### Form Approach (Wrong):
```
Step 1: [Dropdown] Select destination
Step 2: [Date picker] Choose dates
Step 3: [Dropdowns] Select group composition
...
```

### Conversational Approach (Correct):
```
ChatGPT: "Where would you like to go skiing?"
User: "Colorado, maybe Vail or Keystone"

ChatGPT: "Great! When are you thinking of going?"
User: "Mid-January, we're flexible on exact dates"

ChatGPT: "Perfect! How many people?"
User: "4 - me, my wife, and our 2 kids (ages 8 and 10)"

[All the same data collected, but naturally]
```

**See `DATA_COLLECTION_STRATEGY.md` for complete mapping.**

---

## Required Changes to Technical Plan

### ❌ Remove Entirely:
- Vue.js 3 with TypeScript
- Pinia state management
- Tailwind CSS
- Vite build tool
- All frontend-related sections
- Multi-step form descriptions

### ✅ Add/Expand:
- MCP Server implementation (using `ModelContextProtocol` NuGet package)
- Display mode response formatters (inline cards, carousels, fullscreen)
- Conversational state management (Redis-backed sessions)
- Natural language data collection strategies
- Tool definitions for ChatGPT integration
- Structured response schemas

### 🔄 Revise:
- User journey (conversational, not form-based)
- Architecture diagram (remove frontend layer)
- Development phases (MCP integration from day 1, not phase 5)
- Project structure (no `frontend/` directory)

---

## Updated Architecture

```
┌────────────────────────────────────────────┐
│           ChatGPT (renders UI)              │
└────────────────┬───────────────────────────┘
                 │ MCP Protocol
┌────────────────▼───────────────────────────┐
│      SkiExpert MCP Server (.NET 8)         │
│                                             │
│  Tools exposed to ChatGPT:                 │
│  • search_ski_destinations                 │
│  • get_resort_details                      │
│  • check_availability                      │
│  • book_package                            │
│  • get_order_status                        │
│                                             │
│  Session Management (Redis)                │
│  Response Formatters (cards/carousels)     │
└────────────────┬───────────────────────────┘
                 │
┌────────────────▼───────────────────────────┐
│         Business Logic Layer               │
│  • Package Builder                         │
│  • Pricing Engine                          │
│  • Booking Service                         │
│  • Payment Service (Stripe)                │
│  • Notification Service (Email)            │
└────────────────┬───────────────────────────┘
                 │
┌────────────────▼───────────────────────────┐
│        API Integration Layer               │
│  • Expedia Rapid API                       │
│  • Amadeus API                             │
│  • Indy Pass API                           │
│  • Ikon/Epic Pass APIs                     │
│  • Rental Shop APIs                        │
└────────────────┬───────────────────────────┘
                 │
┌────────────────▼───────────────────────────┐
│           Data Layer                       │
│  • SQL Server / PostgreSQL                 │
│  • Redis (caching + sessions)              │
└────────────────────────────────────────────┘
```

**Key Difference:** No frontend layer. ChatGPT IS the frontend.

---

## Technology Stack (Revised)

### Backend (THE ENTIRE APPLICATION)
- **Framework:** .NET 8 with FastEndpoints
- **MCP SDK:** `ModelContextProtocol` NuGet package
- **ORM:** Entity Framework Core
- **Caching:** Redis (sessions + API caching)
- **Payments:** Stripe.NET
- **Email:** Resend or SendGrid
- **Logging:** Serilog + Application Insights

### Frontend
- **ChatGPT** (provided by OpenAI)
- That's it. Seriously.

### Infrastructure
- **Hosting:** Azure Container Apps
- **Database:** Azure SQL or PostgreSQL
- **Cache:** Azure Redis Cache
- **Monitoring:** Application Insights

---

## Revised Development Roadmap

### Phase 1: MCP Foundation (Weeks 1-6)
**Goal:** Basic working ChatGPT app

**Deliverables:**
- ✅ .NET 8 MCP server setup
- ✅ 3 core tools:
  - `search_ski_destinations`
  - `get_resort_details`
  - `check_availability`
- ✅ Inline card & carousel formatters
- ✅ Expedia API integration (sandbox)
- ✅ Redis session management
- ✅ Basic database schema
- ✅ ChatGPT app registration

**Success:** User can search resorts and view details through ChatGPT

### Phase 2: Booking Flow (Weeks 7-12)
**Goal:** End-to-end booking capability

**Deliverables:**
- ✅ Booking tools:
  - `book_package`
  - `get_order_status`
  - `modify_booking`
- ✅ Stripe payment integration
- ✅ Order management system
- ✅ Email notifications
- ✅ Webhook handlers
- ✅ Complete data collection (all ski.com fields)

**Success:** User can book and pay for complete ski trip

### Phase 3: Ski Pass Integration (Weeks 13-18)
**Goal:** Add ski pass booking

**Deliverables:**
- ✅ Indy Pass API integration
- ✅ Ikon/Epic Pass research & integration
- ✅ Pass availability checking
- ✅ Pass + lodging packages

**Success:** Offer complete packages with passes

### Phase 4: Polish & Scale (Weeks 19-24)
**Goal:** Production-ready, optimized

**Deliverables:**
- ✅ Rental shop integrations
- ✅ Lesson booking
- ✅ Performance optimization
- ✅ Comprehensive error handling
- ✅ Analytics & monitoring
- ✅ Marketing & launch prep

**Success:** Public launch on ChatGPT

---

## Compliance & Best Practices

### OpenAI App Design Principles

1. **✅ Conversational** - Natural dialogue, not forms
2. **✅ Intelligent** - Context-aware, anticipates needs
3. **✅ Simple** - Single clear action per interaction
4. **✅ Responsive** - Fast, lightweight
5. **✅ Accessible** - Works for all users

### Display Mode Usage

**Inline Cards** - Use for:
- Single package display
- Order confirmation
- Resort details

**Inline Carousels** - Use for:
- 3-8 resort options
- Package tier selection
- Lodging alternatives

**Fullscreen** - Use for:
- Interactive maps
- Detailed itinerary builder
- Complex customization

**DON'T use cards for:**
- Long content
- Complex forms
- Ads/promotions

---

## Action Items

### Immediate (This Week)
1. ✅ **Accept this architecture** - Fundamentally different from original plan
2. 📚 **Study MCP Protocol** - Review .NET SDK documentation
3. 🎯 **Review ski.com data mapping** - See `DATA_COLLECTION_STRATEGY.md`
4. 📝 **Update technical plan** - Remove frontend, add MCP details
5. 🧪 **Prototype simple MCP server** - Hello World with 1 tool

### Next Week
1. 🏗️ **Set up project structure** - .NET solution, MCP server project
2. 🔧 **Implement first tool** - `search_ski_destinations` with mock data
3. 🎨 **Create response formatters** - Inline carousel formatter
4. 🧪 **Test with ChatGPT** - Register app, test tool calling
5. 📊 **Design session state model** - Based on ski.com fields

### Month 1
1. 🌐 **Integrate Expedia API** - Real lodging search
2. 💾 **Set up Redis** - Session management
3. 🗄️ **Create database** - Orders, bookings, users
4. 🔄 **Build 3 core tools** - Search, details, availability
5. 🎯 **Test complete flow** - Search → browse → view details

---

## Key Takeaways

### ✅ Good News
- **Simpler architecture** - Just backend, no frontend
- **Faster development** - 2-3 weeks time savings
- **Lower cost** - No frontend team needed
- **Better UX** - Native ChatGPT experience
- **Easier maintenance** - One codebase instead of two

### ⚠️ Mind Shifts Required
- **Think conversationally** - Not forms and buttons
- **ChatGPT renders UI** - You provide data, not HTML/CSS
- **Progressive disclosure** - Collect info naturally over time
- **Trust ChatGPT** - It handles conversation flow intelligently
- **Backend-first** - That's literally all you're building

### 📚 Study These
1. [OpenAI App Design Guidelines](https://developers.openai.com/apps-sdk/concepts/design-guidelines)
2. [Model Context Protocol Spec](https://modelcontextprotocol.io/)
3. [.NET MCP SDK](https://github.com/modelcontextprotocol/dotnet-sdk)
4. `TECHNICAL_PLAN_REVIEW.md` (detailed analysis)
5. `DATA_COLLECTION_STRATEGY.md` (ski.com field mapping)

---

## Questions to Consider

1. **Do we have .NET developers?** (Critical)
2. **Are we comfortable with conversational design?** (Different skillset)
3. **Can we iterate on conversation flows?** (Requires testing and refinement)
4. **Do we understand MCP protocol?** (Learning curve ~2-3 weeks)
5. **Are we ready to abandon traditional web app thinking?** (Mental shift)

---

## Bottom Line

Your business model is solid. Your API integration strategy is good. Your ski.com data fields are excellent.

**But you're building the wrong type of application.**

OpenAI Apps SDK doesn't support traditional web apps. It supports **conversational experiences** that live **inside ChatGPT**.

This is actually **BETTER** for you:
- ✅ Simpler to build
- ✅ Faster to market
- ✅ Lower cost
- ✅ Better user experience
- ✅ Native ChatGPT integration

**You just need to rebuild your mental model of what you're building.**

---

## Next Steps

1. **Read the detailed review** - `TECHNICAL_PLAN_REVIEW.md`
2. **Study data collection** - `DATA_COLLECTION_STRATEGY.md`
3. **Prototype MCP server** - Start with hello world
4. **Update technical plan** - Remove frontend, embrace MCP
5. **Begin Phase 1** - Build that first working tool

**Questions?** Review the detailed documents or ask for clarification.

---

**Review Completed:** November 6, 2025  
**Status:** Critical architecture changes identified  
**Recommendation:** Revise plan and proceed with MCP-first architecture  
**Estimated Impact:** 2-3 weeks faster, 40% cost reduction, better UX

