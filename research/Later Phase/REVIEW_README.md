# SkiExpert: AI-Powered Ski Trip Planning

**A ChatGPT app for booking complete ski trip packages**

---

## 📋 Document Index

This repository contains comprehensive planning and review documentation for the SkiExpert application.

### 🚀 Start Here

1. **[EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)** ⭐ **READ THIS FIRST**
   - Quick overview of critical findings
   - Architecture changes required
   - Impact analysis (cost, timeline, team)
   - 10-15 minute read

### 📚 Core Documentation

2. **[TECHNICAL_PLAN_REVIEW.md](TECHNICAL_PLAN_REVIEW.md)** - Detailed architectural review
   - Complete analysis of original plan vs. OpenAI requirements
   - Display mode specifications
   - Revised architecture diagrams
   - Compliance requirements
   - 45-60 minute read

3. **[DATA_COLLECTION_STRATEGY.md](DATA_COLLECTION_STRATEGY.md)** - Conversational data collection
   - Ski.com form fields mapped to chat flow
   - Collection timing strategies
   - Example conversation flows
   - Field-specific approaches
   - 30-45 minute read

4. **[MCP_QUICKSTART_GUIDE.md](MCP_QUICKSTART_GUIDE.md)** - Implementation guide
   - Step-by-step setup instructions
   - Code examples for first MCP tool
   - Deployment to Azure
   - Testing in ChatGPT
   - 1-2 hours to implement

5. **[technicalplan.md](technicalplan.md)** - Original plan (for reference)
   - Initial architecture (needs revision)
   - Business model (still valid)
   - API integration strategy (still valid)
   - Reference only - do not follow frontend sections

6. **[Targets.md](Targets.md)** - Business targets
   - Revenue projections
   - Booking targets
   - Commission structures

---

## 🎯 Quick Start Path

### If you have 15 minutes:
→ Read **[EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)**

### If you have 1 hour:
→ Read **EXECUTIVE_SUMMARY.md**  
→ Skim **TECHNICAL_PLAN_REVIEW.md** (sections 1-4)  
→ Review architecture diagrams

### If you have half a day:
→ Read **EXECUTIVE_SUMMARY.md**  
→ Read **TECHNICAL_PLAN_REVIEW.md** in full  
→ Review **DATA_COLLECTION_STRATEGY.md**  
→ Start **MCP_QUICKSTART_GUIDE.md** implementation

### Ready to build:
→ Follow **MCP_QUICKSTART_GUIDE.md** step-by-step  
→ Reference **DATA_COLLECTION_STRATEGY.md** for conversation design  
→ Use **TECHNICAL_PLAN_REVIEW.md** for architectural decisions

---

## 🚨 Critical Findings Summary

### The Original Plan Was Wrong About:
- ❌ **Frontend Architecture** - No Vue.js or React needed
- ❌ **Application Flow** - Not multi-step forms
- ❌ **UI Development** - ChatGPT renders all UI
- ❌ **Deployment Model** - Not a separate web app

### The Correct Architecture:
- ✅ **MCP Server** - .NET backend exposing tools
- ✅ **Conversational Flow** - Natural language data collection
- ✅ **Display Modes** - Inline cards/carousels rendered by ChatGPT
- ✅ **ChatGPT Integration** - App lives inside ChatGPT

### Impact:
- **Timeline:** 2-3 weeks faster ⚡
- **Cost:** ~40% reduction 💰
- **Complexity:** Significantly simpler 📉
- **UX:** Better user experience 🎯

---

## 📊 What Changed

### Removed from Plan:
```diff
- Vue.js 3 with TypeScript
- Pinia state management  
- Tailwind CSS
- Vite build tool
- Frontend developers
- UI/UX design work
- Multi-step forms
- Frontend hosting/CDN
```

### Added to Plan:
```diff
+ MCP Server implementation
+ Display mode response formatters
+ Conversational state management
+ Natural language data collection
+ Structured JSON responses
+ ChatGPT native UI integration
```

---

## 🏗️ Architecture Overview

### Simplified Architecture

```
┌──────────────────────────────┐
│       ChatGPT (UI)           │ ← User interacts here
└──────────────┬───────────────┘
               │ MCP Protocol
┌──────────────▼───────────────┐
│  SkiExpert MCP Server (.NET) │ ← You build this
│  • search_ski_destinations   │
│  • get_resort_details         │
│  • book_package               │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│    Business Logic            │
│  • Package Builder           │
│  • Pricing Engine            │
│  • Booking System            │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│    External APIs             │
│  • Expedia  • Ski Passes     │
│  • Stripe   • Email          │
└──────────────────────────────┘
```

**Key Insight:** There is NO separate frontend. ChatGPT IS the frontend.

---

## 💬 User Experience Example

```
User: "I want to plan a ski trip to Colorado in January"

ChatGPT: "Great! How many people will be going?"

User: "4 people - me, my wife, and 2 kids (ages 8 and 10)"

[ChatGPT calls: search_ski_destinations()]
↓
[SkiExpert MCP returns carousel data]
↓
[ChatGPT renders beautiful carousel]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   [Vail]         [Keystone]      [Breckenridge]
  $4,850          $3,245           $3,890
  [View]          [View]           [View]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User: "Tell me about Keystone"

[ChatGPT calls: get_resort_details("keystone")]
↓
[Displays inline card with full details]
↓
User can book directly from card
```

**Everything displayed above is rendered by ChatGPT using your JSON responses.**

---

## 🛠️ Technology Stack (Revised)

### What You're Actually Building

**Backend Only:**
- .NET 8
- FastEndpoints
- Model Context Protocol SDK
- Entity Framework Core
- Redis (session management)
- Stripe.NET
- SendGrid/Resend

**Frontend:**
- ChatGPT (provided by OpenAI)
- *That's literally it*

**Infrastructure:**
- Azure Container Apps
- Azure SQL / PostgreSQL
- Azure Redis Cache
- Application Insights

---

## 📅 Development Phases (Revised)

### Phase 1: MCP Foundation (Weeks 1-6)
- ✅ Basic MCP server
- ✅ 3 core tools (search, details, availability)
- ✅ Inline cards & carousels
- ✅ Mock data

**Deliverable:** Working ChatGPT app with search

### Phase 2: Booking Flow (Weeks 7-12)
- ✅ Stripe integration
- ✅ Order management
- ✅ Email notifications
- ✅ Complete data collection

**Deliverable:** End-to-end booking works

### Phase 3: Ski Pass Integration (Weeks 13-18)
- ✅ Indy Pass API
- ✅ Ikon/Epic Pass
- ✅ Complete packages

**Deliverable:** Full trip packages

### Phase 4: Polish & Launch (Weeks 19-24)
- ✅ Rental/lesson integration
- ✅ Performance optimization
- ✅ Public launch

**Deliverable:** Production-ready app

---

## 📖 Key Concepts

### Display Modes

**Inline Cards** - Single-purpose widgets
```json
{
  "display_mode": "inline_card",
  "content": {
    "title": "Vail Package",
    "image": "...",
    "actions": [{"label": "Book Now"}]
  }
}
```

**Inline Carousels** - Multiple options
```json
{
  "display_mode": "inline_carousel",
  "content": {
    "items": [
      {"title": "Vail", "image": "..."},
      {"title": "Keystone", "image": "..."}
    ]
  }
}
```

**Fullscreen** - Rich experiences
```json
{
  "display_mode": "fullscreen",
  "content": {
    "type": "interactive_map",
    "map_data": {...}
  }
}
```

### MCP Tools

Tools are functions ChatGPT can call:

```csharp
public class SearchDestinationsTool : McpTool
{
    public override string Name => "search_ski_destinations";
    
    public override string Description => 
        "Search for ski resorts based on location and preferences";
    
    public override async Task<ToolResponse> ExecuteAsync(ToolRequest request)
    {
        // Your logic here
        return new ToolResponse { /* carousel data */ };
    }
}
```

### Conversational Data Collection

Instead of forms, collect data through natural conversation:

```
ChatGPT: "Where would you like to go?"
User: "Colorado"
[Captured: destination = "Colorado"]

ChatGPT: "When are you thinking?"
User: "January, we're flexible"
[Captured: dates = "January", flexible = true]

ChatGPT: "How many people?"
User: "4 - me, my wife, and 2 kids"
[Captured: adults = 2, children = 2]

[Now can search with all needed info]
```

---

## ✅ Action Items

### This Week
1. [ ] Read EXECUTIVE_SUMMARY.md
2. [ ] Review TECHNICAL_PLAN_REVIEW.md
3. [ ] Study MCP protocol basics
4. [ ] Accept architectural changes
5. [ ] Plan team structure (backend-focused)

### Next Week
1. [ ] Follow MCP_QUICKSTART_GUIDE.md
2. [ ] Build first tool (search_destinations)
3. [ ] Deploy to Azure
4. [ ] Test in ChatGPT
5. [ ] Iterate based on results

### Month 1
1. [ ] Implement 5 core tools
2. [ ] Integrate Expedia API (sandbox)
3. [ ] Build session management
4. [ ] Create database schema
5. [ ] Test complete search flow

---

## 🎓 Learning Resources

### Must Read
- [OpenAI App Design Guidelines](https://developers.openai.com/apps-sdk/concepts/design-guidelines)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [.NET MCP SDK](https://github.com/modelcontextprotocol/dotnet-sdk)

### Recommended
- [FastEndpoints Documentation](https://fastendpoints.com/)
- [Stripe .NET Library](https://stripe.com/docs/api?lang=dotnet)
- [Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/)

---

## 🤝 Need Help?

### Questions About...
- **Architecture:** See TECHNICAL_PLAN_REVIEW.md
- **Data Collection:** See DATA_COLLECTION_STRATEGY.md
- **Implementation:** See MCP_QUICKSTART_GUIDE.md
- **Business Model:** See Targets.md

### Common Questions

**Q: Do we really not need React/Vue?**  
A: Correct. ChatGPT renders everything. You just return JSON.

**Q: How do we customize the UI?**  
A: You don't. ChatGPT controls UI. You control content and structure.

**Q: What about our frontend developers?**  
A: They can transition to backend, or work on admin tools, or other projects.

**Q: Is this actually simpler?**  
A: Yes. One codebase, one deployment, no frontend complexity.

**Q: Can we add a web UI later?**  
A: Yes, but it's separate from the ChatGPT app. Most users will use ChatGPT.

---

## 📈 Success Metrics

### Technical
- API response time < 2s
- 99.9% uptime
- 99%+ order success rate

### Business  
- 25 bookings/day (peak season)
- 7 bookings/day (off-season)
- $1,500 average booking value
- 1-2% conversion rate

---

## 🎿 Let's Build This!

You have everything you need:

1. ✅ **Business model** - Commission-based, validated
2. ✅ **Data fields** - Ski.com proven structure
3. ✅ **API strategy** - Expedia, ski passes, rentals
4. ✅ **Architecture** - Correct for OpenAI Apps SDK
5. ✅ **Implementation guide** - Step-by-step instructions

**Next Step:** Read EXECUTIVE_SUMMARY.md and let's get started!

---

## 📝 Version History

- **v1.0** (Nov 6, 2025) - Initial technical plan
- **v2.0** (Nov 6, 2025) - Architecture review and corrections
  - Removed Vue.js frontend
  - Added MCP server architecture
  - Revised user journey
  - Added data collection strategy
  - Created implementation guide

---

**Questions? Comments? Ready to build?**

Start with the [Executive Summary](EXECUTIVE_SUMMARY.md) →

