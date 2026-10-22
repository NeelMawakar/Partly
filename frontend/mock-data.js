// Mock data for the Partly frontend. Listings, landlords and addresses are made up.
window.MOCK = {
  intake: {
    budget: 2400,
    destination: "Northeastern University, 360 Huntington Ave, Boston",
    moveIn: "2026-12-01",
    maxCommute: 35,
    beds: 1,
  },
  weights: { price: 35, commute: 35, reviews: 20, moveIn: 10 },
  listings: [
    {
      id: "L1", title: "Sunny 1BR near the Fens", address: "84 Peterborough St, Apt 3", area: "Fenway",
      rent: 2295, beds: 1, baths: 1, sqft: 610, source: "RentGrid", available: "2026-11-25",
      commute: 12, route: "Walk 12 min", reviews: 4.6, reviewCount: 38,
      reviewQuote: "Landlord fixes things the same week. Quiet building, lots of grad students.",
      amenities: ["Heat included", "Laundry in building", "Pets OK"],
      landlord: "Back Bay Residential", outreach: "booked",
    },
    {
      id: "L2", title: "Renovated 1BR, Mission Hill", address: "17 Calumet St, Unit 2", area: "Mission Hill",
      rent: 2150, beds: 1, baths: 1, sqft: 540, source: "CampusLets", available: "2026-12-01",
      commute: 16, route: "Green E line, 2 stops + 6 min walk", reviews: 4.1, reviewCount: 22,
      reviewQuote: "Great value. Street gets loud on weekends during the semester.",
      amenities: ["Dishwasher", "Hardwood floors"],
      landlord: "Calumet Properties", outreach: "replied",
    },
    {
      id: "L3", title: "Studio with bay window", address: "212 Hemenway St, Apt 5", area: "Fenway",
      rent: 1895, beds: 0, baths: 1, sqft: 410, source: "RentGrid", available: "2026-12-01",
      commute: 9, route: "Walk 9 min", reviews: 3.7, reviewCount: 51,
      reviewQuote: "Location is unbeatable but radiators are hit or miss.",
      amenities: ["Heat included", "Laundry in building"],
      landlord: "Hemenway Mgmt", outreach: "sent",
    },
    {
      id: "L4", title: "1BR in a triple-decker", address: "9 Wyman St, 2nd floor", area: "Jamaica Plain",
      rent: 2050, beds: 1, baths: 1, sqft: 700, source: "ListLocal", available: "2026-12-15",
      commute: 27, route: "Orange line, 4 stops + 9 min walk", reviews: 4.8, reviewCount: 14,
      reviewQuote: "Owner lives downstairs and is super responsive. Big kitchen.",
      amenities: ["Backyard", "Parking", "Pets OK"],
      landlord: "M. Alvarez (owner)", outreach: "booked",
    },
    {
      id: "L5", title: "Modern 1BR with gym", address: "1 Lansdowne Sq, #1408", area: "Kenmore",
      rent: 3150, beds: 1, baths: 1, sqft: 690, source: "RentGrid", available: "2026-11-15",
      commute: 18, route: "Green line, 3 stops + 5 min walk", reviews: 4.3, reviewCount: 67,
      reviewQuote: "Pricey, but management is professional and the gym is great.",
      amenities: ["Gym", "Doorman", "In-unit laundry"],
      landlord: "Lansdowne Living", outreach: "none",
    },
    {
      id: "L6", title: "Garden-level 1BR", address: "45 Saint Botolph St, Unit G", area: "South End",
      rent: 2380, beds: 1, baths: 1, sqft: 580, source: "CampusLets", available: "2026-12-01",
      commute: 14, route: "Walk 14 min", reviews: 3.9, reviewCount: 19,
      reviewQuote: "Cozy but a bit dark. Good neighbors.",
      amenities: ["Dishwasher", "Pets OK"],
      landlord: "Botolph Realty", outreach: "noreply",
    },
    {
      id: "L7", title: "Shared 2BR, room available", address: "120 Brookline Ave, Apt 7", area: "Longwood",
      rent: 1450, beds: 1, baths: 1, sqft: 900, source: "ListLocal", available: "2026-12-01",
      commute: 21, route: "Bus 47, 3 stops + 4 min walk", reviews: 4.0, reviewCount: 9,
      reviewQuote: "Roommates are med students and very tidy.",
      amenities: ["Furnished", "Utilities included"],
      landlord: "Longwood Sublets", outreach: "sent",
    },
    {
      id: "L8", title: "Spacious 1BR, Brighton", address: "33 Chiswick Rd, Apt 1", area: "Brighton",
      rent: 1980, beds: 1, baths: 1, sqft: 720, source: "RentGrid", available: "2026-12-01",
      commute: 41, route: "Green B line + 57 bus", reviews: 4.4, reviewCount: 30,
      reviewQuote: "Lots of space for the price, commute is the trade-off.",
      amenities: ["Parking", "Laundry in building"],
      landlord: "Chiswick Partners", outreach: "none",
    },
  ],
  messages: {
    L1: [
      { from: "partly", at: "2026-10-20T14:02:00", text: "Hi, I'm interested in 84 Peterborough St, Apt 3 for a Dec 1 move-in. Is it still available, and could I see it this week?" },
      { from: "landlord", at: "2026-10-20T16:40:00", text: "Yes, still available. Thursday at 5:30pm works." },
      { from: "partly", at: "2026-10-20T16:41:00", text: "Thursday at 5:30pm is confirmed. See you then." },
    ],
    L2: [
      { from: "partly", at: "2026-10-21T09:15:00", text: "Hello, is the 1BR at 17 Calumet St available for December 1? I'd love to schedule a viewing." },
      { from: "landlord", at: "2026-10-21T18:22:00", text: "It is. I can do Saturday morning or Monday after 4." },
    ],
    L3: [
      { from: "partly", at: "2026-10-22T10:05:00", text: "Hi, I'm looking at the studio at 212 Hemenway St for Dec 1. Could I schedule a viewing?" },
    ],
    L4: [
      { from: "partly", at: "2026-10-19T12:00:00", text: "Hi, is the 2nd floor unit at 9 Wyman St available mid-December? I'd like to visit." },
      { from: "landlord", at: "2026-10-19T19:30:00", text: "Yes! Come by Friday at 6pm." },
      { from: "partly", at: "2026-10-19T19:31:00", text: "Friday at 6pm is confirmed. Thank you!" },
    ],
    L6: [
      { from: "partly", at: "2026-10-17T11:20:00", text: "Hello, is the garden-level unit at 45 Saint Botolph St still open for Dec 1?" },
      { from: "partly", at: "2026-10-20T11:20:00", text: "Following up on my note about 45 Saint Botolph St. Is it still available?" },
    ],
    L7: [
      { from: "partly", at: "2026-10-22T13:45:00", text: "Hi, is the room at 120 Brookline Ave still available for December?" },
    ],
  },
  viewings: [
    { listing: "L1", at: "2026-10-23T17:30:00" },
    { listing: "L4", at: "2026-10-24T18:00:00" },
    { listing: "L2", at: "2026-10-25T10:30:00", tentative: true },
  ],
};
