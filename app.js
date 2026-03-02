/**
 * app.js - Airbnb Filter API Server (Node.js + Express)
 * =========================================================
 * 
 * Purpose:
 * - Express.js web server that serves Airbnb listings with jurisdiction filtering
 * - Implements business rules: "Premium houses only in Melbourne/Sydney"
 * - Supports frontend toggles: stateToggle, allowedStates, premiumOnly
 * 
 * Key Features:
 * - GET / - Health check endpoint
 * - GET /listings - Main endpoint with multi-layer filtering:
 *   1. Legal rule filter (Melbourne/Sydney + premium only)
 *   2. Jurisdiction toggle (NSW/VIC only when stateToggle=on)
 *   3. Optional premium-only filter
 * 
 * API Examples:
 * - http://localhost:3000/listings                    → Premium Melbourne/Sydney only
 * - http://localhost:3000/listings?stateToggle=on&allowedStates=NSW,VIC  → NSW/VIC premium only
 * 
 * Data Flow:
 * 1. Frontend sends query params (stateToggle=on, allowedStates="NSW,VIC")
 * 2. Backend loads listings from data.js
 * 3. Applies legal filter → jurisdiction filter → premium filter
 * 4. Returns JSON: { count: X, data: [...] }
 * 
 * Project Structure:
 * - data.js → Sample Airbnb listings database
 * - app.js  → Express server + filtering logic
 * - package.json → Dependencies (express)
 */

const express = require("express");
const { listings } = require("./data");

const app = express();
const PORT = 3000;

// Enable JSON parsing for query params
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.send("Airbnb Filter API is running ");
});

// Main listings endpoint with jurisdiction filtering
app.get("/listings", (req, res) => {
  // Get frontend toggle params
  const { stateToggle, allowedStates, premiumOnly } = req.query;
  
  // Step 1: LEGAL RULE - Only premium houses in Melbourne/Sydney
  let result = listings.filter(item => 
    ["Melbourne", "Sydney"].includes(item.city) && item.isPremium
  );
  
  // Step 2: JURISDICTION TOGGLE - NSW/VIC only if switch is ON
  if (stateToggle === "on" && allowedStates) {
    const allowedStatesArray = allowedStates
      .split(",")
      .map(state => state.trim().toUpperCase());
    
    result = result.filter(item => 
      allowedStatesArray.includes(item.state.toUpperCase())
    );
  }
  
  // Step 3: EXTRA PREMIUM FILTER (demo purposes)
  if (premiumOnly === "true") {
    result = result.filter(item => item.isPremium === true);
  }
  
  // Send filtered results to frontend
  res.json({
    count: result.length,
    data: result,
    filtersApplied: {
      legalRule: true,
      stateToggle: stateToggle === "on",
      premiumOnly: premiumOnly === "true"
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Test endpoints:`);
  console.log(`   http://localhost:${PORT}/`);
  console.log(`   http://localhost:${PORT}/listings?stateToggle=on&allowedStates=NSW,VIC`);
});
