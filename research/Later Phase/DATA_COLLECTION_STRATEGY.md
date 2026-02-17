# Data Collection Strategy: Ski.com Fields → Conversational Flow

**Purpose**: Map ski.com's proven form fields to SkiExpert's conversational data collection approach

---

## Overview

Ski.com's form captures all necessary information through a 6-step process. SkiExpert will collect the same data **conversationally** through natural dialogue with ChatGPT, making the experience feel effortless while ensuring we capture every critical data point.

---

## Data Model: Complete Session State

```typescript
interface TripPlanningSession {
  // Metadata
  session_id: string;
  user_id?: string;
  created_at: Date;
  updated_at: Date;
  conversation_stage: 'discovery' | 'browsing' | 'customizing' | 'booking' | 'confirmed';
  
  // Step 1: Destination (CRITICAL - Required for search)
  destination: {
    primary_destination?: string;        // "Vail", "Colorado", "French Alps"
    destination_type?: 'resort' | 'region' | 'country';
    user_description?: string;           // Freeform: "somewhere good for beginners"
    inferred_resorts?: string[];        // ChatGPT can suggest based on description
  };
  
  // Step 2: Dates (CRITICAL - Required for availability)
  dates: {
    start_date?: Date;
    end_date?: Date;
    date_range_text?: string;           // "January", "early February", "MLK weekend"
    flexible: boolean;                   // Default: false
    flexibility_days?: number;           // How many days flexible (+/- 3 days)
  };
  
  // Step 3: Group Composition (CRITICAL - Affects pricing and recommendations)
  group_composition: {
    adults_18_plus: number;              // Default: 1 (assume at least the user)
    seniors_65_plus: number;             // Default: 0
    children_0_5: number;                // Default: 0
    children_6_12: number;               // Default: 0
    children_13_17: number;              // Default: 0
    total_travelers?: number;            // Calculated
  };
  
  // Step 4: Accommodation Preferences (PROGRESSIVE - Collect as needed)
  accommodation: {
    budget_preferences: {
      budget_value: boolean;             // Default: false
      budget_midrange: boolean;          // Default: true (assume middle)
      budget_luxury: boolean;            // Default: false
    };
    property_types: {
      property_hotel: boolean;           // Default: true
      property_condo: boolean;           // Default: true
      property_chalet: boolean;          // Default: false
      property_vacation_rental: boolean; // Default: false
    };
    room_setup: {
      room_studio: boolean;              // Infer from group size
      room_1bedroom: boolean;            // Infer from group size
      room_suite: boolean;               // Infer from group size
      room_multiple_rooms: boolean;      // Infer from group size
    };
    proximity_to_slopes: 'ski_in_out' | 'walking_distance' | 'shuttle_route' | 'no_preference';
    amenities: {
      hot_tub: boolean;
      pool: boolean;
      spa: boolean;
      kitchen: boolean;
      fireplace: boolean;
      gym: boolean;
      pet_friendly: boolean;
    };
  };
  
  // Step 5: Extras (PROGRESSIVE - Ask when showing packages)
  extras: {
    lift_tickets: boolean;               // Default: true (core offering)
    flights: boolean;                    // Default: false
    transfers: boolean;                  // Default: false (airport to resort)
    rental_car: boolean;                 // Default: false
    gear_rentals: boolean;               // Infer from skill level
    lessons: boolean;                    // Infer from skill level
    
    // Flight details (only if flights: true)
    departure_airport?: string;
    preferred_airline?: string;
    
    // Lesson details (only if lessons: true)
    lesson_skill_levels?: {
      beginner: number;                  // Number of people
      intermediate: number;
      advanced: number;
    };
    lesson_type_preference?: 'private' | 'group' | 'no_preference';
  };
  
  // Step 6: Contact Info (REQUIRED ONLY AT BOOKING)
  contact_info?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    consent_contact: boolean;            // Must be true to book
    additional_notes?: string;
  };
  
  // Derived/Inferred Data
  inferred_data: {
    skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
    trip_purpose?: 'family_vacation' | 'romantic_getaway' | 'group_trip' | 'solo_adventure';
    budget_range?: {
      min: number;
      max: number;
    };
    special_needs?: string[];            // E.g., "accessible rooms", "childcare"
  };
  
  // Package Selection
  selected_package?: {
    package_id: string;
    resort_id: string;
    resort_name: string;
    lodging: any;
    lift_tickets: any;
    lessons: any;
    rentals: any;
    total_price: number;
  };
}
```

---

## Data Collection Timing Matrix

| Field Category | Timing | Method | Required For | Default Value |
|----------------|--------|--------|--------------|---------------|
| **Destination** | Immediate | Explicit ask | Search | None |
| **Dates** | Immediate | Explicit ask | Search | None |
| **Group composition** | Immediate | Explicit ask | Search/Pricing | 1 adult |
| **Budget tier** | Progressive | Infer/ask | Display options | Midrange |
| **Property type** | Progressive | Default/infer | Display options | Hotel, Condo |
| **Room setup** | Progressive | Infer from group | Display options | Auto-calculated |
| **Proximity** | Progressive | Infer/ask | Filter options | No preference |
| **Amenities** | Optional | Infer/ask | Filter options | None |
| **Lift tickets** | Progressive | Default | Package | True |
| **Flights** | Progressive | Ask | Package | False |
| **Gear rentals** | Progressive | Infer | Package | Based on skill |
| **Lessons** | Progressive | Infer | Package | Based on skill |
| **Contact info** | Booking time | Explicit ask | Booking | None |

---

## Conversational Collection Patterns

### Pattern 1: Explicit Ask (Direct Question)

**Used for:** Critical fields needed immediately (destination, dates, group)

```
ChatGPT: "Where would you like to go skiing?"
User: "Colorado"

[Captures: destination.primary_destination = "Colorado"]

ChatGPT: "Great choice! Colorado has amazing resorts. When are you planning 
to visit?"
User: "Second week of January"

[Captures: dates.date_range_text = "second week of January", 
           dates parsed to Jan 8-15, 2025]

ChatGPT: "Perfect! How many people will be in your group?"
User: "4 - me, my wife, and our 2 kids who are 8 and 10"

[Captures: adults_18_plus = 2, children_6_12 = 2]
```

### Pattern 2: Contextual Inference

**Used for:** Information implied in user's message

```
User: "I'm a beginner and want to learn to ski with my family"

[Infers: 
 - inferred_data.skill_level = "beginner"
 - extras.lessons = true
 - extras.gear_rentals = true
 - inferred_data.trip_purpose = "family_vacation"
]

ChatGPT: "Wonderful! Since you're learning to ski, I'll make sure to include 
beginner lessons and equipment rentals in your package options."
```

### Pattern 3: Smart Defaults with Confirmation

**Used for:** Reasonable assumptions that can be corrected

```
[Internal: Group = 2 adults + 2 children → room_1bedroom = true]

ChatGPT: "Based on your group size, I'm looking at one-bedroom 
accommodations. Does that work, or would you prefer separate rooms?"

User: "One bedroom is fine"
[Confirms: room_setup.room_1bedroom = true]

OR

User: "We'd prefer two separate rooms"
[Updates: room_setup.room_multiple_rooms = true]
```

### Pattern 4: Progressive Disclosure

**Used for:** Non-critical preferences collected as conversation progresses

```
[After showing initial resort options]

ChatGPT: "I've found some great options. To narrow it down, what's most 
important to you?"

User: "We'd like to be close to the slopes and have a hot tub"

[Captures: 
 - proximity_to_slopes = "ski_in_out" OR "walking_distance"
 - amenities.hot_tub = true
]

ChatGPT refines search with these filters
```

### Pattern 5: Optional Follow-up

**Used for:** Nice-to-have information

```
ChatGPT: "Are there any other amenities that are must-haves for your stay? 
(Optional - I can show you options either way)"

User: "Not really"
[No changes to amenities]

OR

User: "A kitchen would be great for making breakfast"
[Captures: amenities.kitchen = true]
```

---

## Conversation Flow Examples

### Example 1: Experienced Skier, Knows Destination

```
User: "I want to book a trip to Vail for 4 people in February"

ChatGPT: "Excellent! Vail is a world-class resort. Let me get a few details:
• What dates in February work for you?
• Who will be joining you?"

User: "Feb 10-14, and it's me and 3 friends, all adults"

[Captured:
 - destination.primary_destination = "Vail"
 - destination.destination_type = "resort"
 - dates.start_date = "2025-02-10"
 - dates.end_date = "2025-02-14"
 - adults_18_plus = 4
]

ChatGPT calls: check_availability({
  resort: "vail",
  dates: "2025-02-10 to 2025-02-14",
  group: { adults: 4 }
})

[MCP returns packages with:
 - Lift tickets included (default)
 - No lessons (adults, no mention of skill level)
 - No rentals (assume experienced = own equipment)
]

ChatGPT: "I found several packages at Vail for Feb 10-14:

[CAROUSEL DISPLAYED]
Budget Package: $5,200 total ($1,300/person)
Standard Package: $7,600 total ($1,900/person)  
Premium Package: $10,400 total ($2,600/person)

All packages include 4-night lodging and 4-day lift tickets. Would you 
like to see details on any of these?"

User: "Show me the standard package"

[Display inline card with full details]

ChatGPT: "This package includes:
✓ 4 nights at Vail Mountain Lodge (ski-in/ski-out)
✓ 2 hotel rooms with 2 queen beds each
✓ 4-day Vail lift tickets for 4 adults
✓ Daily breakfast

Total: $7,600
Per person: $1,900

Would you like to book this package, or customize anything?"

User: "Actually, we'll need ski rentals too"

[Updates: extras.gear_rentals = true]

ChatGPT calls: customize_package({ add_rentals: true })

ChatGPT: "I've added 4-day ski rental packages (skis, boots, poles).
New total: $8,120 ($2,030/person)

Ready to book?"

User: "Yes, let's do it"

[Proceed to collect contact info]
```

### Example 2: Beginner Family, Flexible Destination

```
User: "I want to take my family on a ski trip but we've never skied before. 
Not sure where to go."

[Inferred:
 - inferred_data.skill_level = "beginner"
 - extras.lessons = true (likely needed)
 - extras.gear_rentals = true (likely needed)
 - destination.user_description = "family, beginners, need recommendations"
]

ChatGPT: "Wonderful! Skiing is such a fun family activity. I'll help you 
find a beginner-friendly resort. Let me ask a few questions:

• When are you hoping to go?
• How many people in your family?
• Do you have a region in mind, or would you like recommendations?"

User: "Sometime in January, we're flexible on dates. There's 4 of us - me, 
my wife, and our 2 kids (8 and 10). Maybe Colorado?"

[Captured:
 - dates.date_range_text = "January"
 - dates.flexible = true
 - adults_18_plus = 2
 - children_6_12 = 2
 - destination.primary_destination = "Colorado"
 - inferred_data.trip_purpose = "family_vacation"
]

ChatGPT calls: search_ski_destinations({
  region: "Colorado",
  dates: "January",
  group: { adults: 2, children: 2, child_ages: [8, 10] },
  preferences: { 
    skill_level: "beginner",
    includes_lessons: true,
    family_friendly: true
  }
})

ChatGPT: "Perfect! Since your family is new to skiing, I'll focus on 
beginner-friendly resorts with great lesson programs. Here are my top 
recommendations:

[CAROUSEL with 5 family-friendly resorts]

Each package includes:
✓ Lodging
✓ Lift tickets
✓ Beginner lessons for all 4
✓ Equipment rentals

Which resort looks most interesting?"

User: "What about Keystone?"

ChatGPT calls: get_resort_details({ 
  resort_id: "keystone",
  session_context: session
})

ChatGPT: "Keystone is an excellent choice for families! It's known for:
🏔️ Wide, gentle beginner slopes
👨‍👩‍👧‍👦 Fantastic kids' programs
🎿 Patient, experienced instructors
🏘️ Village with restaurants and shops

Here's a package for your family:

[INLINE CARD]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Keystone Family Beginner Package
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Image of resort]

Package Includes:
✓ 4 nights - River Run Village (1-bedroom condo)
  • Full kitchen (save money on meals!)
  • Walking distance to slopes
  
✓ 4-day lift tickets for 4 people
  • Beginner area access
  
✓ Ski lessons (2 days):
  • 2-hour group lessons for kids (ages 8 & 10)
  • 2-hour adult group lessons
  • All equipment included with lessons
  
✓ Additional 2-day equipment rentals:
  • Skis, boots, poles, helmets for all

Pricing:
Total: $3,490
Per person: $872.50

[Customize] [Book Now]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The package includes lessons for the first 2 days, so you can practice 
on your own for the last 2 days. How does this look?"

User: "Looks great! One question - what if we want a hot tub?"

[Captures: amenities.hot_tub = true]

ChatGPT calls: customize_package({ add_amenity: "hot_tub" })

ChatGPT: "Good news! I can upgrade you to a condo with a private hot tub 
for an additional $220 (total: $3,710). Want to add that?"

User: "Yes please"

ChatGPT: "Perfect! Updated package:
Total: $3,710 ($927.50/person)

Ready to book? I'll need your contact information to proceed."

[Collect contact info for booking]
```

### Example 3: User Provides Everything Upfront

```
User: "I need to book a ski trip to Breckenridge for 6 adults from Dec 20-27. 
We're all experienced skiers. Need 3 hotel rooms, prefer ski-in/ski-out, 
want lift tickets but we have our own gear. Budget is around $10k total."

[Captured in one message:
 - destination.primary_destination = "Breckenridge"
 - destination.destination_type = "resort"
 - dates.start_date = "2024-12-20"
 - dates.end_date = "2024-12-27"
 - dates.flexible = false
 - adults_18_plus = 6
 - inferred_data.skill_level = "advanced"
 - accommodation.room_setup.room_multiple_rooms = true (3 rooms)
 - accommodation.proximity_to_slopes = "ski_in_out"
 - extras.lift_tickets = true
 - extras.gear_rentals = false
 - inferred_data.budget_range = { min: 9000, max: 11000 }
]

ChatGPT: "Got it! Let me find you the perfect package:
✓ Breckenridge Resort
✓ Dec 20-27 (7 nights)
✓ 6 adults (experienced skiers)
✓ 3 hotel rooms
✓ Ski-in/ski-out
✓ 7-day lift tickets included
✓ No equipment rentals
✓ Budget: ~$10,000

[Searches and displays results]

I found 2 options within your budget:

[CAROUSEL]

Option 1: One Ski Hill Place
• Ski-in/ski-out hotel
• 3 deluxe rooms
• 7-day lift tickets (6 people)
Total: $9,850
[View Details]

Option 2: Grand Colorado on Peak 8
• Ski-in/ski-out resort
• 3 hotel rooms
• 7-day lift tickets (6 people)
• Access to pool & hot tubs
Total: $10,200
[View Details]

Which one interests you?"

[Continue with selection and booking]
```

---

## Missing Information Handling Strategies

### Strategy 1: Request Minimum Viable Information

**Only ask for what's ABSOLUTELY NEEDED to show results**

Minimum to show resort options:
- ✅ Destination (or willingness to hear suggestions)
- ✅ Approximate dates or timeframe
- ✅ Group size (at least rough estimate)

Can be inferred or defaulted:
- ❌ Exact dates (can show general availability)
- ❌ Budget tier (show range)
- ❌ Property type (show multiple)
- ❌ Room configuration (calculate from group)
- ❌ Amenities (show all, let them filter)

```
User: "I want to go skiing in January"

ChatGPT: "Exciting! A few quick questions:
• Where would you like to go? (Or I can suggest popular spots)
• How many people?"

User: "Just me"

[Enough info to show options!]
ChatGPT calls: search_ski_destinations({
  dates: "January",
  group: { adults: 1 },
  // Show variety of destinations
})

ChatGPT: "Here are some great solo ski destinations for January:

[CAROUSEL with diverse options at different price points]
```

### Strategy 2: Show Options, Then Refine

**Don't wait for perfect information - show something, then filter**

```
User: "I want to ski in Colorado with my family"

[Missing: dates, group details]

ChatGPT: "Great! To show you the best options, I need to know:
• When are you thinking of going?
• How many in your family?"

User: "4 of us, not sure on dates yet"

ChatGPT: "No problem! Let me show you some popular family resorts in 
Colorado, and we can check availability once you pick your dates:

[Show resort options with general info]

When you have dates in mind, I can check real-time availability and pricing."
```

### Strategy 3: Graceful Assumption with Confirmation

**Make smart assumption, state it clearly, allow correction**

```
User: "Find me a ski trip for 2 adults in Utah"

[Missing: dates, preferences]

ChatGPT: "I'll look for options in Utah for 2 adults. A few things I'm 
assuming - let me know if I should adjust:

• Timing: Mid-January to late February (best snow)
• Budget: Mid-range accommodations
• Trip length: 4-5 days
• Includes lift tickets

Sound about right, or would you like different criteria?"

User: "Actually, we want luxury, and we're going over New Year's"

[Updates: budget_luxury = true, dates = "New Year's"]
```

---

## Field-Specific Collection Approaches

### Destination Collection

**Scenarios:**
1. **User knows exact resort**: "I want to go to Vail"
   - Capture directly
   
2. **User knows region**: "I want to go to Colorado"
   - Show resorts in that region
   
3. **User doesn't know**: "I want to go skiing somewhere"
   - Ask: "Do you have a region in mind? (US West, Northeast, Canada, Europe)"
   - OR: "What's important to you?" → recommend based on preferences

**Example Collection:**
```typescript
if (message.includes(knownResortNames)) {
  session.destination.primary_destination = extractResortName(message);
  session.destination.destination_type = 'resort';
} else if (message.includes(knownRegions)) {
  session.destination.primary_destination = extractRegion(message);
  session.destination.destination_type = 'region';
} else {
  // Ask for clarification
  return "Where would you like to go? You can name a specific resort (like Vail) 
  or a region (like Colorado), or I can make recommendations.";
}
```

### Date Collection

**Scenarios:**
1. **Specific dates**: "January 15-20"
   - Parse exact dates
   - Set flexible = false
   
2. **General timeframe**: "early March" / "spring break"
   - Parse to approximate date range
   - Set flexible = true
   - Ask if specific dates are important
   
3. **No dates yet**: "not sure"
   - Show general information
   - Prompt to check availability when they decide

**Example Collection:**
```typescript
const datePatterns = [
  /January (\d+)-(\d+)/,  // "January 15-20"
  /(early|mid|late) (January|February|...)/,  // "early March"
  /spring break/,  // "spring break"
  /over (Thanksgiving|Christmas|New Year's)/  // holidays
];

if (matchesSpecificDates) {
  session.dates.start_date = parseDate(match);
  session.dates.flexible = false;
} else if (matchesGeneralTimeframe) {
  session.dates.date_range_text = match;
  session.dates.flexible = true;
  // Ask: "Do you need specific dates, or are you flexible?"
}
```

### Group Composition Collection

**Scenarios:**
1. **Explicit breakdown**: "2 adults and 2 kids, ages 8 and 10"
   - Parse exactly
   
2. **General mention**: "my family of 4"
   - Ask for breakdown: "How many adults and children?"
   
3. **Implied from context**: "me and my wife and our teenager"
   - Infer: 2 adults, 1 teen (13-17)
   - Confirm: "So 2 adults and 1 teenager - is that right?"

**Example Collection:**
```typescript
const groupPatterns = {
  adults: /(\d+) adults?/,
  children: /(\d+) (kids?|children)/,
  ages: /ages? (\d+)(?: and (\d+))?/
};

// Parse and categorize by age
if (age <= 5) session.group_composition.children_0_5++;
else if (age <= 12) session.group_composition.children_6_12++;
else if (age <= 17) session.group_composition.children_13_17++;

// Always confirm total
return `Got it - ${totalPeople} people: ${breakdown}. Is that correct?`;
```

### Budget Collection (Subtle Approach)

**Avoid asking directly about budget - it's awkward**

Instead:
1. **Infer from word choice**: "budget-friendly" → value, "nice place" → midrange, "luxury" → luxury
2. **Show range**: Display packages at different price points, see what they gravitate toward
3. **Filter by price**: After showing options, ask "Do you want to see options in a specific price range?"

**Example:**
```
[Show carousel with value, midrange, luxury options]

ChatGPT: "I'm showing you a range of options. If you want to focus on a 
specific price range, just let me know."

User: "Show me more like the middle one"
[Infers: budget_midrange = true]
```

### Amenities Collection (Optional Enhancement)

**Don't ask about every amenity - overwhelms user**

Instead:
1. **Ask open-ended**: "Any must-have amenities?"
2. **Infer from context**: Family with young kids → look for pool
3. **Offer after showing options**: "I can filter for hot tub if that's important"

```
ChatGPT: "Are there any must-have amenities for your stay? (Optional)"

User: "Hot tub and kitchen would be great"
[Captures: hot_tub = true, kitchen = true]

ChatGPT refines results
```

---

## Contact Information Collection (Booking Phase)

**ONLY collect at booking time - not before**

```
User: "Yes, let's book it"

ChatGPT: "Perfect! To complete your booking, I need:
• Your full name
• Email address
• Phone number

(Your information is secure and only used for booking confirmation)"

User: "John Smith, john@email.com, 555-1234"

ChatGPT: "Thanks John! Just to confirm:
• Name: John Smith
• Email: john@email.com
• Phone: 555-1234

Is this correct?"

User: "Yes"

[Set consent_contact = true implicitly since they're booking]

ChatGPT: "Great! I'm processing your booking now..."
```

**Privacy Note:**
- State explicitly how data is used
- Don't collect contact info for browsing
- Ensure consent_contact is properly tracked

---

## Validation & Error Handling

### Handling Incomplete Information

```typescript
function canShowResortOptions(session: TripPlanningSession): boolean {
  return (
    session.destination.primary_destination !== undefined &&
    session.group_composition.total_travelers > 0
    // Dates optional - can show general options
  );
}

function canCheckAvailability(session: TripPlanningSession): boolean {
  return (
    session.destination.primary_destination !== undefined &&
    session.dates.start_date !== undefined &&
    session.dates.end_date !== undefined &&
    session.group_composition.total_travelers > 0
  );
}

function canBookPackage(session: TripPlanningSession): boolean {
  return (
    canCheckAvailability(session) &&
    session.selected_package !== undefined &&
    session.contact_info !== undefined &&
    session.contact_info.consent_contact === true
  );
}
```

### Handling Ambiguous Input

```
User: "I want to go skiing next month"

ChatGPT internal logic:
- "next month" is ambiguous (current date: Nov 6)
- Could mean December

ChatGPT: "Just to clarify - you're thinking of December? And did you have 
specific dates in mind, or just sometime that month?"

User: "Yeah December, probably mid-month"

[Captures: dates.date_range_text = "mid-December", 
           dates parsed to Dec 10-20 range approximately]
```

### Handling Conflicting Information

```
User: "I want a luxury stay under $2000"

[Conflict: luxury typically > $2000]

ChatGPT: "I want to make sure I understand - you're looking for high-end 
accommodations, but keeping the total trip cost around $2000? That might 
be challenging depending on the resort. Would you like to:

• See the best accommodations within $2000
• See luxury options (which may be over $2000)
• Adjust your budget for luxury"

User: "Show me the best within $2000"

[Updates: budget_midrange = true (realistic for $2000)]
```

---

## Summary: Data Collection Best Practices

### ✅ DO:
1. **Ask for essentials first** - destination, dates, group size
2. **Infer when possible** - use context clues from conversation
3. **Use smart defaults** - assume reasonable preferences
4. **Confirm assumptions** - state them clearly, allow corrections
5. **Collect progressively** - gather details as conversation evolves
6. **Keep it conversational** - avoid form-like questioning
7. **Show options early** - don't wait for perfect information
8. **Validate naturally** - confirm details in natural language

### ❌ DON'T:
1. **Don't ask everything upfront** - overwhelming and unnatural
2. **Don't use form language** - "Please select from the following options"
3. **Don't block progress** - show what you can with available info
4. **Don't ask for preferences prematurely** - wait until relevant
5. **Don't collect contact info early** - only at booking time
6. **Don't repeat questions** - track what's already been asked
7. **Don't make users think too hard** - provide easy defaults
8. **Don't forget context** - remember previous conversation

---

## Implementation Checklist

- [ ] Create `TripPlanningSession` model with all ski.com fields
- [ ] Implement session state management (Redis-backed)
- [ ] Build natural language parsers for common patterns
- [ ] Define validation rules for each field
- [ ] Create inference rules for implicit data
- [ ] Implement smart default logic
- [ ] Build confirmation mechanisms
- [ ] Design error messages for missing/invalid data
- [ ] Test conversation flows for each scenario
- [ ] Monitor which fields are commonly missing
- [ ] Iterate on collection strategies based on user data

---

**Next Step:** Create MCP tool specifications that implement these collection strategies

