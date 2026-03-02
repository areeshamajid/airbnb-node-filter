/**
 * data.js - Airbnb Listings Data Source
 * ====================================
 * 
 * Purpose: 
 * - Contains sample Airbnb listing data that simulates a backend database
 * - Each listing has: id, city, state, premium status, and title
 * - Used by app.js to demonstrate jurisdiction-based filtering
 * 
 * Key Features:
 * - Melbourne/Sydney premium listings (for legal rule testing)
 * - NSW/VIC listings (for state toggle testing)  
 * - SA/WA listings (blocked unless jurisdiction toggle allows)
 * 
 * Usage in app.js:
 * - Imported via: const { listings } = require("./data");
 * - Filtered by city/state/premium status based on query params
 * 
 * Sample API call: /listings?stateToggle=on&allowedStates=NSW,VIC
 */

const listings = [
  {id: 1, city: "Sydney", state: "NSW", isPremium: true, title: "Premium Harbour View"},
  {id: 2, city: "Melbourne", state: "VIC", isPremium: true, title: "Premium CBD Loft"},
  {id: 3, city: "Adelaide", state: "SA", isPremium: false, title: "Budget Adelaide"},
  {id: 4, city: "Perth", state: "WA", isPremium: true, title: "Premium Beach House"}
];
module.exports = { listings };
