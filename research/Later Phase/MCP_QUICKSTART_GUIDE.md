# MCP Quick Start Guide: Building Your First Tool

**Goal:** Get a working MCP server with one tool running and testable in ChatGPT within 1-2 days

---

## Prerequisites

- ✅ .NET 8 SDK installed
- ✅ Visual Studio or VS Code
- ✅ Basic understanding of C# and ASP.NET
- ✅ OpenAI ChatGPT account (for testing)

---

## Step 1: Create New .NET Project (15 minutes)

### Create Solution Structure

```bash
# Create solution directory
mkdir SkiExpert
cd SkiExpert

# Create .NET solution
dotnet new sln -n SkiExpert

# Create MCP Server project
dotnet new web -n SkiExpert.Mcp
cd SkiExpert.Mcp

# Add required packages
dotnet add package ModelContextProtocol
dotnet add package FastEndpoints
dotnet add package StackExchange.Redis

# Add project to solution
cd ..
dotnet sln add SkiExpert.Mcp/SkiExpert.Mcp.csproj
```

### Project Structure

```
SkiExpert/
├── SkiExpert.sln
└── SkiExpert.Mcp/
    ├── Program.cs
    ├── Tools/
    │   └── SearchDestinationsTool.cs
    ├── Models/
    │   ├── TripPlanningSession.cs
    │   └── ResortSearchResult.cs
    └── Services/
        └── MockResortService.cs
```

---

## Step 2: Implement Basic MCP Server (30 minutes)

### Program.cs

```csharp
using FastEndpoints;
using ModelContextProtocol;

var builder = WebApplication.CreateBuilder(args);

// Add FastEndpoints
builder.Services.AddFastEndpoints();

// Add MCP Server
builder.Services.AddMcp(options =>
{
    options.ServerName = "SkiExpert";
    options.ServerVersion = "0.1.0";
    options.Description = "AI-powered ski trip planning assistant";
});

// Add services
builder.Services.AddSingleton<IResortService, MockResortService>();
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

var app = builder.Build();

// Configure MCP
app.UseMcp(mcp =>
{
    // Register your tools
    mcp.AddTool<SearchDestinationsTool>();
});

app.UseFastEndpoints();
app.Run();
```

---

## Step 3: Create Your First Tool (45 minutes)

### Models/ResortSearchResult.cs

```csharp
namespace SkiExpert.Mcp.Models;

public record ResortSearchResult
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;
    public string ImageUrl { get; init; } = string.Empty;
    public int SkiableAcres { get; init; }
    public int Lifts { get; init; }
    public decimal StartingPrice { get; init; }
    public bool IsPopular { get; init; }
    public bool IsFamilyFriendly { get; init; }
    public string Description { get; init; } = string.Empty;
}

public record SearchDestinationsRequest
{
    public string? Region { get; init; }
    public string? Dates { get; init; }
    public GroupComposition? Group { get; init; }
}

public record GroupComposition
{
    public int Adults { get; init; }
    public int Children { get; init; }
    public List<int>? ChildAges { get; init; }
}
```

### Services/MockResortService.cs

```csharp
namespace SkiExpert.Mcp.Services;

public interface IResortService
{
    Task<List<ResortSearchResult>> SearchAsync(SearchDestinationsRequest request);
}

public class MockResortService : IResortService
{
    // Mock data for testing
    private static readonly List<ResortSearchResult> MockResorts = new()
    {
        new ResortSearchResult
        {
            Id = "vail",
            Name = "Vail Mountain Resort",
            Location = "Vail, Colorado",
            ImageUrl = "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800",
            SkiableAcres = 5317,
            Lifts = 31,
            StartingPrice = 1212.50m,
            IsPopular = true,
            IsFamilyFriendly = true,
            Description = "World-class resort with legendary back bowls"
        },
        new ResortSearchResult
        {
            Id = "keystone",
            Name = "Keystone Resort",
            Location = "Keystone, Colorado",
            ImageUrl = "https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800",
            SkiableAcres = 3148,
            Lifts = 20,
            StartingPrice = 811.25m,
            IsPopular = true,
            IsFamilyFriendly = true,
            Description = "Family-friendly resort with night skiing"
        },
        new ResortSearchResult
        {
            Id = "breckenridge",
            Name = "Breckenridge Ski Resort",
            Location = "Breckenridge, Colorado",
            ImageUrl = "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
            SkiableAcres = 2908,
            Lifts = 34,
            StartingPrice = 975.00m,
            IsPopular = true,
            IsFamilyFriendly = true,
            Description = "Charming town with diverse terrain"
        },
        new ResortSearchResult
        {
            Id = "aspen",
            Name = "Aspen Snowmass",
            Location = "Aspen, Colorado",
            ImageUrl = "https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800",
            SkiableAcres = 5500,
            Lifts = 44,
            StartingPrice = 1450.00m,
            IsPopular = true,
            IsFamilyFriendly = false,
            Description = "Luxury resort with four mountains"
        },
        new ResortSearchResult
        {
            Id = "copper",
            Name = "Copper Mountain",
            Location = "Copper Mountain, Colorado",
            ImageUrl = "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800",
            SkiableAcres = 2490,
            Lifts = 23,
            StartingPrice = 750.00m,
            IsPopular = false,
            IsFamilyFriendly = true,
            Description = "Great value with naturally divided terrain"
        }
    };

    public Task<List<ResortSearchResult>> SearchAsync(SearchDestinationsRequest request)
    {
        var results = MockResorts.AsEnumerable();

        // Filter by region if specified
        if (!string.IsNullOrEmpty(request.Region))
        {
            var region = request.Region.ToLower();
            results = results.Where(r => 
                r.Location.ToLower().Contains(region) || 
                r.Name.ToLower().Contains(region));
        }

        // Filter family-friendly if children present
        if (request.Group?.Children > 0)
        {
            results = results.Where(r => r.IsFamilyFriendly);
        }

        // Sort popular first, then by price
        results = results
            .OrderByDescending(r => r.IsPopular)
            .ThenBy(r => r.StartingPrice);

        return Task.FromResult(results.Take(5).ToList());
    }
}
```

### Tools/SearchDestinationsTool.cs

```csharp
using ModelContextProtocol;
using SkiExpert.Mcp.Models;
using SkiExpert.Mcp.Services;

namespace SkiExpert.Mcp.Tools;

public class SearchDestinationsTool : McpTool
{
    private readonly IResortService _resortService;

    public SearchDestinationsTool(IResortService resortService)
    {
        _resortService = resortService;
    }

    public override string Name => "search_ski_destinations";

    public override string Description => 
        "Search for ski resorts and destinations based on location, dates, and group composition. " +
        "Returns a list of available resorts with pricing and details.";

    public override ToolParameters Parameters => new()
    {
        Type = "object",
        Properties = new Dictionary<string, ParameterProperty>
        {
            ["region"] = new()
            {
                Type = "string",
                Description = "Region or resort name (e.g., 'Colorado', 'Vail', 'French Alps')",
                Required = false
            },
            ["dates"] = new()
            {
                Type = "string",
                Description = "Desired travel dates or timeframe (e.g., 'January 15-20', 'early March')",
                Required = false
            },
            ["group"] = new()
            {
                Type = "object",
                Description = "Group composition",
                Properties = new Dictionary<string, ParameterProperty>
                {
                    ["adults"] = new() { Type = "integer", Description = "Number of adults" },
                    ["children"] = new() { Type = "integer", Description = "Number of children" },
                    ["child_ages"] = new() { Type = "array", Description = "Ages of children" }
                }
            }
        }
    };

    public override async Task<ToolResponse> ExecuteAsync(ToolRequest request)
    {
        // Parse parameters
        var searchRequest = new SearchDestinationsRequest
        {
            Region = request.Parameters?["region"]?.ToString(),
            Dates = request.Parameters?["dates"]?.ToString(),
            Group = ParseGroup(request.Parameters?["group"])
        };

        // Call service
        var results = await _resortService.SearchAsync(searchRequest);

        // Return as inline carousel
        return new ToolResponse
        {
            DisplayMode = "inline_carousel",
            Content = new
            {
                items = results.Select(r => new
                {
                    image = r.ImageUrl,
                    title = r.Name,
                    metadata = new[]
                    {
                        $"{r.SkiableAcres:N0} acres",
                        $"{r.Lifts} lifts",
                        $"From ${r.StartingPrice:N2}/night"
                    },
                    badge = r.IsPopular ? "Popular" : null,
                    actions = new[]
                    {
                        new
                        {
                            label = "View Details",
                            type = "tool_call",
                            tool = "get_resort_details",
                            parameters = new { resort_id = r.Id }
                        }
                    }
                }).ToList()
            }
        };
    }

    private GroupComposition? ParseGroup(object? groupObj)
    {
        if (groupObj is not Dictionary<string, object> groupDict)
            return null;

        return new GroupComposition
        {
            Adults = groupDict.TryGetValue("adults", out var adults) 
                ? Convert.ToInt32(adults) 
                : 0,
            Children = groupDict.TryGetValue("children", out var children) 
                ? Convert.ToInt32(children) 
                : 0,
            ChildAges = groupDict.TryGetValue("child_ages", out var ages) && ages is List<object> ageList
                ? ageList.Select(a => Convert.ToInt32(a)).ToList()
                : null
        };
    }
}
```

---

## Step 4: Configure and Test Locally (20 minutes)

### appsettings.Development.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "Redis": "localhost:6379"
  },
  "Mcp": {
    "ServerName": "SkiExpert",
    "ServerVersion": "0.1.0"
  }
}
```

### Run Locally

```bash
cd SkiExpert.Mcp
dotnet run
```

Should see:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### Test MCP Endpoint

```bash
# Test MCP server info
curl http://localhost:5000/mcp/server-info

# Should return:
{
  "name": "SkiExpert",
  "version": "0.1.0",
  "description": "AI-powered ski trip planning assistant",
  "tools": [
    {
      "name": "search_ski_destinations",
      "description": "Search for ski resorts...",
      "parameters": {...}
    }
  ]
}
```

### Test Tool Execution

```bash
# Test search tool
curl -X POST http://localhost:5000/mcp/tools/search_ski_destinations \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Colorado",
    "group": {
      "adults": 2,
      "children": 2
    }
  }'

# Should return carousel JSON with resorts
```

---

## Step 5: Deploy to Azure (1 hour)

### Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name rg-skiexpert-dev \
  --location eastus

# Create container app environment
az containerapp env create \
  --name env-skiexpert-dev \
  --resource-group rg-skiexpert-dev \
  --location eastus

# Create container app
az containerapp create \
  --name ca-skiexpert-mcp-dev \
  --resource-group rg-skiexpert-dev \
  --environment env-skiexpert-dev \
  --image mcr.microsoft.com/dotnet/samples:aspnetapp \
  --target-port 8080 \
  --ingress external \
  --cpu 0.5 \
  --memory 1.0Gi
```

### Create Dockerfile

```dockerfile
# SkiExpert.Mcp/Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["SkiExpert.Mcp/SkiExpert.Mcp.csproj", "SkiExpert.Mcp/"]
RUN dotnet restore "SkiExpert.Mcp/SkiExpert.Mcp.csproj"
COPY . .
WORKDIR "/src/SkiExpert.Mcp"
RUN dotnet build "SkiExpert.Mcp.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SkiExpert.Mcp.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SkiExpert.Mcp.dll"]
```

### Build and Deploy

```bash
# Build image
docker build -t skiexpert-mcp:latest -f SkiExpert.Mcp/Dockerfile .

# Tag for Azure Container Registry (create ACR first if needed)
az acr create \
  --resource-group rg-skiexpert-dev \
  --name acrskiexpertdev \
  --sku Basic

# Login to ACR
az acr login --name acrskiexpertdev

# Tag and push
docker tag skiexpert-mcp:latest acrskiexpertdev.azurecr.io/skiexpert-mcp:latest
docker push acrskiexpertdev.azurecr.io/skiexpert-mcp:latest

# Update container app
az containerapp update \
  --name ca-skiexpert-mcp-dev \
  --resource-group rg-skiexpert-dev \
  --image acrskiexpertdev.azurecr.io/skiexpert-mcp:latest
```

### Get App URL

```bash
az containerapp show \
  --name ca-skiexpert-mcp-dev \
  --resource-group rg-skiexpert-dev \
  --query properties.configuration.ingress.fqdn

# Returns something like:
# "ca-skiexpert-mcp-dev.niceocean-12345.eastus.azurecontainerapps.io"
```

---

## Step 6: Register with OpenAI (30 minutes)

### 1. Go to OpenAI Platform
- Visit https://platform.openai.com
- Navigate to "Apps" or "ChatGPT Apps"

### 2. Create New App
- Click "Create App"
- Fill in details:
  - **App Name:** SkiExpert
  - **Description:** AI-powered ski trip planning assistant
  - **Category:** Travel
  - **MCP Server URL:** `https://your-azure-url.azurecontainerapps.io`

### 3. Configure App Metadata

```json
{
  "name": "SkiExpert",
  "description": "Plan your perfect ski trip with personalized recommendations for resorts, lodging, lift tickets, lessons, and equipment rentals.",
  "version": "0.1.0",
  "icon_url": "https://your-domain.com/icon.png",
  "privacy_policy_url": "https://your-domain.com/privacy",
  "terms_of_service_url": "https://your-domain.com/terms",
  "support_email": "support@skiexpert.com",
  "mcp_server_url": "https://your-azure-url.azurecontainerapps.io",
  "capabilities": {
    "search": true,
    "booking": true,
    "notifications": false
  }
}
```

### 4. Test in ChatGPT

- Open ChatGPT
- Enable your SkiExpert app (in dev mode)
- Try a query:

```
You: "I want to plan a ski trip to Colorado"

ChatGPT should call your search_ski_destinations tool
and display the carousel of resorts!
```

---

## Step 7: Verify It's Working (15 minutes)

### Test Conversation Flow

```
Test 1: Basic search
─────────────────────
You: "Show me ski resorts in Colorado"

Expected: ChatGPT calls search_ski_destinations
Result: Carousel with 5 Colorado resorts

Test 2: With group info
─────────────────────────
You: "I want to ski with my family - 2 adults and 2 kids"

Expected: ChatGPT calls search with family flag
Result: Only family-friendly resorts shown

Test 3: View details
──────────────────────
You: "Tell me about Keystone"

Expected: ChatGPT calls get_resort_details (you haven't built this yet)
Result: Error or fallback (expected at this stage)
```

### Check Logs

```bash
# View Azure container app logs
az containerapp logs show \
  --name ca-skiexpert-mcp-dev \
  --resource-group rg-skiexpert-dev \
  --follow
```

Look for:
- ✅ Tool calls being received
- ✅ Search parameters being parsed
- ✅ Responses being returned
- ❌ Any errors or exceptions

---

## Next Steps: Adding More Tools

### Tool #2: Get Resort Details

Create `Tools/GetResortDetailsTool.cs`:

```csharp
public class GetResortDetailsTool : McpTool
{
    public override string Name => "get_resort_details";
    
    public override string Description => 
        "Get detailed information about a specific ski resort";
    
    public override ToolParameters Parameters => new()
    {
        Properties = new Dictionary<string, ParameterProperty>
        {
            ["resort_id"] = new()
            {
                Type = "string",
                Description = "Resort ID",
                Required = true
            }
        }
    };
    
    public override async Task<ToolResponse> ExecuteAsync(ToolRequest request)
    {
        var resortId = request.Parameters["resort_id"].ToString();
        var resort = await _resortService.GetByIdAsync(resortId);
        
        // Return as inline card
        return new ToolResponse
        {
            DisplayMode = "inline_card",
            Content = new
            {
                title = resort.Name,
                image = resort.ImageUrl,
                sections = new[]
                {
                    new
                    {
                        heading = "Resort Details",
                        items = new[]
                        {
                            $"{resort.SkiableAcres:N0} skiable acres",
                            $"{resort.Lifts} lifts",
                            $"Elevation: {resort.BaseElevation:N0}' - {resort.SummitElevation:N0}'",
                            $"Vertical drop: {resort.VerticalDrop:N0}'"
                        }
                    },
                    new
                    {
                        heading = "Terrain",
                        items = new[]
                        {
                            $"Beginner: {resort.BeginnerPercent}%",
                            $"Intermediate: {resort.IntermediatePercent}%",
                            $"Advanced: {resort.AdvancedPercent}%",
                            $"Expert: {resort.ExpertPercent}%"
                        }
                    }
                },
                actions = new[]
                {
                    new
                    {
                        label = "Check Availability",
                        type = "tool_call",
                        tool = "check_availability",
                        parameters = new { resort_id = resortId },
                        style = "primary"
                    }
                }
            }
        };
    }
}
```

### Tool #3: Check Availability

Create `Tools/CheckAvailabilityTool.cs`:

```csharp
public class CheckAvailabilityTool : McpTool
{
    public override string Name => "check_availability";
    
    public override string Description => 
        "Check availability and pricing for a resort on specific dates";
    
    // ... implement similar pattern
}
```

---

## Common Issues & Solutions

### Issue: MCP server not found
**Solution:** 
- Check URL is publicly accessible
- Verify HTTPS (required by OpenAI)
- Test with `curl https://your-url/mcp/server-info`

### Issue: Tool not being called
**Solution:**
- Check tool description is clear
- Verify parameter definitions
- Look at ChatGPT conversation history to see what it's trying to do
- Add more specific keywords to description

### Issue: Response not displaying correctly
**Solution:**
- Validate JSON response format
- Check display_mode is valid ("inline_card", "inline_carousel", "fullscreen")
- Verify all required fields are present
- Test response JSON with OpenAI's validator

### Issue: Authentication errors
**Solution:**
- Add authentication to MCP endpoints if required
- Configure API keys in OpenAI app settings
- Use Azure AD or similar for production

---

## Development Workflow

### Daily Development Loop

1. **Morning:** Plan which tool to implement
2. **Code:** Build tool with mock data
3. **Test locally:** Verify with curl/Postman
4. **Deploy:** Push to Azure
5. **Test in ChatGPT:** Try real conversations
6. **Iterate:** Refine based on results
7. **Evening:** Update documentation

### Recommended Iteration Order

1. ✅ **Week 1:** `search_ski_destinations` (DONE in this guide)
2. **Week 2:** `get_resort_details` + `check_availability`
3. **Week 3:** `get_package_options` + package builder
4. **Week 4:** `book_package` + Stripe integration
5. **Week 5:** `get_order_status` + `modify_booking`
6. **Week 6:** Polish, error handling, edge cases

---

## Monitoring & Debugging

### Add Application Insights

```csharp
// In Program.cs
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
});
```

### Log Every Tool Call

```csharp
public override async Task<ToolResponse> ExecuteAsync(ToolRequest request)
{
    _logger.LogInformation(
        "Tool {ToolName} called with parameters: {Parameters}",
        Name,
        JsonSerializer.Serialize(request.Parameters)
    );
    
    try
    {
        var result = await ProcessRequest(request);
        
        _logger.LogInformation(
            "Tool {ToolName} succeeded, returning {ResultType}",
            Name,
            result.DisplayMode
        );
        
        return result;
    }
    catch (Exception ex)
    {
        _logger.LogError(
            ex,
            "Tool {ToolName} failed with error: {Error}",
            Name,
            ex.Message
        );
        throw;
    }
}
```

### Track Metrics

- Tool call frequency
- Response times
- Error rates
- Conversation completion rates
- Booking conversion rates

---

## Success Checklist

After completing this guide, you should have:

- [x] Working .NET MCP server
- [x] One functional tool (`search_ski_destinations`)
- [x] Deployed to Azure
- [x] Registered with OpenAI
- [x] Tested in ChatGPT
- [x] Seen a carousel display correctly
- [x] Logging and monitoring in place
- [x] Understanding of how to add more tools

---

## Resources

**Documentation:**
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [.NET MCP SDK](https://github.com/modelcontextprotocol/dotnet-sdk)
- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk)
- [FastEndpoints Docs](https://fastendpoints.com/)

**Examples:**
- [MCP Example Apps](https://github.com/modelcontextprotocol/examples)
- [ChatGPT App Gallery](https://chatgpt.com/apps)

**Support:**
- OpenAI Developer Forum
- MCP GitHub Issues
- Stack Overflow (tag: model-context-protocol)

---

## What's Next?

Once you have this working:

1. **Add more tools** - Build out the complete tool set
2. **Integrate real APIs** - Replace mock data with Expedia API
3. **Add session management** - Track conversation state in Redis
4. **Implement booking flow** - Add Stripe payment integration
5. **Enhance responses** - Richer cards with more details
6. **Add error handling** - Graceful failures and retries
7. **Optimize performance** - Caching, parallel calls
8. **Polish conversation flow** - Test with real users

**Remember:** Start simple, iterate quickly, test in ChatGPT constantly.

---

**Ready to build?** Follow these steps in order and you'll have your first MCP tool working within a day or two!

Good luck! 🎿

