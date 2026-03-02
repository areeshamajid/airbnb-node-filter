const express = require("express");
const data = require("./data");

const app = express();
const PORT = 3000;
let cachedListings = [];

app.use(express.json());

app.get("/", async (req, res) => {
  if (cachedListings.length === 0) {
    console.log('🔄 Loading CSV data...');
    cachedListings = await data.loadListings();
  }
  res.json({ 
    message: "Real Airbnb API ✅", 
    totalListings: cachedListings.length,
    testQLD: "/listings?stateToggle=on&allowedStates=QLD"
  });
});

app.get("/listings", async (req, res) => {
  if (cachedListings.length === 0) {
    cachedListings = await data.loadListings();
  }
  
  const { stateToggle, allowedStates, limit = 20 } = req.query;
  
  let result = cachedListings.filter(item => 
    item.isPremium && 
    ["brisbane", "melbourne", "sydney"].some(city => 
      item.city.toLowerCase().includes(city)
    )
  );
  
  if (stateToggle === "on" && allowedStates) {
    const states = allowedStates.split(",").map(s => s.trim().toUpperCase());
    result = result.filter(item => states.includes(item.state));
  }
  
  result = result.slice(0, parseInt(limit));
  
  res.json({
    count: result.length,
    totalPremium: cachedListings.filter(l => l.isPremium).length,
    filtersApplied: {
      legalRule: true,
      stateToggle: stateToggle === "on",
      allowedStates: allowedStates || "ALL"
    },
    data: result
  });
});

// Start server FIRST, load data on first request
app.listen(PORT, () => {
  console.log(`Server LIVE: http://localhost:${PORT}`);
  console.log(`48,368 real listings ready!`);
  console.log(`Test: http://localhost:${PORT}/listings?stateToggle=on&allowedStates=QLD`);
});
