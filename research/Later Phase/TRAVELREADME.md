# SkiExpert

> AI-powered ski trip planning application for ChatGPT

Plan your perfect ski vacation through natural conversation. SkiExpert helps you find the best resorts, book lodging, arrange lift tickets, schedule lessons, and rent equipment—all through a simple chat with ChatGPT.

---

## 🎿 What is SkiExpert?

SkiExpert is a specialized travel agent application built as a ChatGPT app, focused exclusively on mountain ski trips. Simply tell ChatGPT where and when you want to ski, and SkiExpert will:

- 🏔️ **Find the perfect resort** based on your preferences
- 🏨 **Book lodging** at competitive rates
- 🎫 **Arrange lift tickets** (Ikon, Epic, Indy, or resort-specific)
- 🎿 **Schedule ski lessons** for beginners or advanced skiers
- ⛷️ **Rent equipment** from local shops
- 📧 **Manage your booking** with email confirmations and updates

All through a natural conversation—no forms, no complicated booking flows.

---

## 💡 How It Works

### Simple Conversation, Complete Trip

```
You: "I want to plan a ski trip to Colorado in January"

SkiExpert: "Great! When in January, and how many people?"

You: "Mid-January, 4 people - me, my wife, and 2 kids (ages 8 and 10)"

SkiExpert: [Shows carousel of family-friendly Colorado resorts]

You: "Tell me about Keystone"

SkiExpert: [Shows complete package with lodging, tickets, lessons]

You: "Book it!"

SkiExpert: [Creates booking, processes payment, sends confirmation]
```

### Built for ChatGPT

SkiExpert lives inside ChatGPT using the Model Context Protocol (MCP):
- **No separate app to download** - Use ChatGPT as usual
- **Natural conversation** - Just chat like you would with a travel agent
- **Smart recommendations** - Understands your preferences and needs
- **Complete packages** - Everything bundled together

---

## 🏗️ Architecture

SkiExpert is built as an MCP server that ChatGPT calls to provide ski trip planning capabilities.

### Technology Stack

**Backend:**
- .NET 8 with C#
- FastEndpoints (API framework)
- Model Context Protocol SDK
- Entity Framework Core
- Redis (session management)

**Integrations:**
- Expedia Rapid API (lodging)
- Amadeus API (flights, alternative lodging)
- Indy Pass, Ikon Pass, Epic Pass (ski passes)
- Stripe (payments)
- Resend (email notifications)

**Infrastructure:**
- Azure Container Apps
- Azure SQL Database / PostgreSQL
- Azure Redis Cache
- Application Insights

### How It Works Technically

```
ChatGPT ← MCP Protocol → SkiExpert MCP Server
                              ↓
                        Business Logic
                              ↓
                    External API Integrations
                    (Expedia, Ski Passes, etc.)
                              ↓
                          Database
```

ChatGPT handles all UI rendering. SkiExpert provides structured data that ChatGPT displays as beautiful cards and carousels.

---

## 🚀 Getting Started

### Prerequisites

- .NET 8 SDK
- Docker (optional, for local development)
- Azure account (for deployment)
- API keys for:
  - Expedia Rapid API
  - Stripe
  - Resend or SendGrid

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/SkiExpert.git
cd SkiExpert

# Restore dependencies
dotnet restore

# Set up configuration
cp appsettings.Development.json.example appsettings.Development.json
# Edit with your API keys

# Run database migrations
dotnet ef database update --project src/SkiExpert.Data

# Start Redis (using Docker)
docker run -d -p 6379:6379 redis:latest

# Run application
cd src/SkiExpert.Mcp
dotnet run
```

The MCP server will be available at `http://localhost:5000`

### Testing with ChatGPT

1. Register your app at [OpenAI Platform](https://platform.openai.com)
2. Configure your MCP server URL
3. Enable the app in ChatGPT settings
4. Start chatting: "I want to plan a ski trip"

---

## 📖 Documentation

- **[TECHNICAL_PLAN.md](TECHNICAL_PLAN.md)** - Complete technical specification
- **[Targets.md](Targets.md)** - Business targets and metrics
- **[research/](research/)** - Architecture research and analysis

### Key Concepts

**MCP Tools:** Functions that ChatGPT can call
- `search_ski_destinations` - Find resorts
- `get_resort_details` - Get detailed info
- `check_availability` - Check dates and pricing
- `book_package` - Create booking
- `get_order_status` - Track orders

**Display Modes:** How content appears in ChatGPT
- **Inline Cards** - Single items (package details)
- **Inline Carousels** - Multiple options (resort choices)
- **Fullscreen** - Rich experiences (interactive maps)

**Session State:** Conversation context stored in Redis
- User preferences
- Search history
- Selected options
- Booking progress

---

## 🎯 Features

### Current (Phase 1)
- ✅ Search ski resorts by location
- ✅ View detailed resort information
- ✅ Check availability and pricing
- ✅ Book lodging packages

### Coming Soon (Phase 2-3)
- 🔜 Ski pass integration (Indy, Ikon, Epic)
- 🔜 Complete trip packages
- 🔜 Equipment rental booking
- 🔜 Ski lesson scheduling

### Roadmap (Phase 4+)
- 🔮 Flight booking
- 🔮 Car rental integration
- 🔮 Group trip planning
- 🔮 Season pass management

---

## 💼 Business Model

SkiExpert generates revenue through commissions on bookings:

| Service | Commission Rate | Provider |
|---------|----------------|----------|
| Lodging | 8-15% | Expedia/Amadeus |
| Ski Passes | 5-10% | Indy/Ikon/Epic |
| Lessons | 10-15% | Resorts |
| Equipment Rentals | 10-15% | Rental shops |

**Target Metrics:**
- Average booking value: $1,500
- Peak season: 25 bookings/day
- Off-season: 7 bookings/day

---

## 🛠️ Development

### Project Structure

```
src/
├── SkiExpert.Mcp/         # MCP Server (main app)
├── SkiExpert.Core/        # Business logic
├── SkiExpert.Data/        # Database access
├── SkiExpert.Integrations/# External APIs
├── SkiExpert.Payment/     # Stripe integration
└── SkiExpert.Notifications/# Email service

tests/
├── SkiExpert.Mcp.Tests/
├── SkiExpert.Core.Tests/
└── SkiExpert.Integration.Tests/
```

### Key Services

**PackageBuilderService:** Creates complete trip packages
**PricingEngine:** Calculates total costs and commissions
**SessionManager:** Manages conversation state
**BookingService:** Handles order creation and management

### Development Workflow

1. Create feature branch
2. Implement MCP tool or service
3. Write unit tests
4. Test in ChatGPT locally
5. Create pull request
6. Deploy to staging
7. Test in production ChatGPT environment
8. Merge to main

---

## 🧪 Testing

### Unit Tests
```bash
dotnet test tests/SkiExpert.Core.Tests/
```

### Integration Tests
```bash
dotnet test tests/SkiExpert.Integration.Tests/
```

### MCP Tool Testing
```bash
# Test tool directly
curl -X POST http://localhost:5000/mcp/tools/search_ski_destinations \
  -H "Content-Type: application/json" \
  -d '{"region": "Colorado", "group": {"adults": 2}}'
```

### ChatGPT Testing
1. Enable dev app in ChatGPT
2. Test conversation flows
3. Verify display modes render correctly
4. Check booking flow end-to-end

---

## 🚀 Deployment

### Azure Container Apps

```bash
# Build image
docker build -t skiexpert:latest .

# Tag for ACR
docker tag skiexpert:latest acrskiexpert.azurecr.io/skiexpert:latest

# Push to registry
docker push acrskiexpert.azurecr.io/skiexpert:latest

# Deploy to Azure
az containerapp update \
  --name ca-skiexpert \
  --resource-group rg-skiexpert \
  --image acrskiexpert.azurecr.io/skiexpert:latest
```

### Environment Variables

Required configuration:
```bash
ConnectionStrings__Database=<sql-connection-string>
ConnectionStrings__Redis=<redis-connection-string>
Expedia__ApiKey=<expedia-key>
Expedia__Secret=<expedia-secret>
Stripe__ApiKey=<stripe-key>
Stripe__WebhookSecret=<stripe-webhook-secret>
Resend__ApiKey=<resend-key>
```

---

## 📊 Monitoring

### Application Insights

Dashboard tracks:
- Tool call frequency
- Response times
- Error rates
- Booking conversion rates
- Revenue metrics

### Alerts

- Response time > 5 seconds
- Error rate > 1%
- Payment failure rate > 5%
- API integration failures

### Logging

Structured logging with Serilog:
```csharp
_logger.LogInformation(
    "Tool {ToolName} executed in {Duration}ms",
    toolName,
    duration
);
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards

- Follow C# coding conventions
- Write unit tests for business logic
- Document public APIs
- Update README for new features

---

## 📄 License

Copyright © 2025 SkiExpert. All rights reserved.

---

## 📞 Support

- **Email:** support@skiexpert.com
- **Documentation:** [Technical Plan](TECHNICAL_PLAN.md)
- **Issues:** [GitHub Issues](https://github.com/yourusername/SkiExpert/issues)

---

## 🙏 Acknowledgments

Built with:
- [OpenAI ChatGPT Apps SDK](https://developers.openai.com/apps-sdk)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [FastEndpoints](https://fastendpoints.com/)
- [Stripe](https://stripe.com/)
- Expedia Rapid API
- Amadeus for Developers

---

**Ready to hit the slopes? 🎿**

Start planning your perfect ski trip at [ChatGPT](https://chatgpt.com) - just ask for SkiExpert!

