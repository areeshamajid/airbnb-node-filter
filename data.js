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
 * 
 * Usage in app.js:
 * - Imported via: const { listings } = require("./data");
 * - Filtered by city/state/premium status based on query params
 * 
 * Sample API call: /listings?stateToggle=on&allowedStates=NSW,VIC
 */
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const DATA_DIR = __dirname;

let listings = [];

// Map filename → state code
function getStateFromFilename(filename) {
  const lowerFile = filename.toLowerCase();

  if (lowerFile.includes('melbourne')) return 'VIC';
  if (lowerFile.includes('sydney')) return 'NSW';
  if (lowerFile.includes('brisbane')) return 'QLD';
  if (lowerFile.includes('barossa')) return 'SA';
  return 'UNKNOWN';
}

function loadAllListings() {
  return new Promise((resolve, reject) => {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.startsWith('listings_') && f.endsWith('.csv'));

    listings = [];
    let pending = files.length;

    if (pending === 0) {
      console.log('No CSV files found.');
      return resolve([]);
    }

    files.forEach(file => {
      const filePath = path.join(DATA_DIR, file);
      const state = getStateFromFilename(file);

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', row => {
          listings.push({
            ...row,
            state
          });
        })
        .on('end', () => {
          pending -= 1;
          if (pending === 0) {
            // Log state breakdown
            const breakdown = listings.reduce((acc, l) => {
              acc[l.state] = (acc[l.state] || 0) + 1;
              return acc;
            }, {});
            console.log('STATE BREAKDOWN:', breakdown);
            resolve(listings);
          }
        })
        .on('error', reject);
    });
  });
}

function getPremiumScore(listing) {
  const totalReviews = parseInt(listing.number_of_reviews || 0, 10);
  const ltmReviews = parseInt(listing.number_of_reviews_ltm || 0, 10);
  const reviewsPerMonth = parseFloat(listing.reviews_per_month || 0);

  // 1) Overall popularity (diminishing returns, like Airbnb’s ranking) 
  const reviewVolume = Math.log(totalReviews + 1) * 10;

  // 2) Recent performance in last 12 months (Superhost-style recency focus)
  const recentActivity = ltmReviews * 0.5;

  // 3) Ongoing demand (steady bookings) 
  const recency = reviewsPerMonth * 2;

  // 4) Reliability / stability of rating (needs enough reviews)
  const consistency = Math.min(totalReviews / 30, 10);

  return reviewVolume + recentActivity + recency + consistency;
}

function getFilteredListings({ stateToggle, allowedStates, limit = 20 }) {
  let results = listings;

  // Filter by state if toggle is on
  if (stateToggle === 'on' && allowedStates) {
    const allowed = allowedStates.split(',').map(s => s.trim().toUpperCase());
    results = results.filter(l => allowed.includes(l.state));
  }

  // Add premiumScore, keep only > 0, sort desc, return top 20
  return results
    .map(l => ({ ...l, premiumScore: getPremiumScore(l) }))
    .filter(l => l.premiumScore > 0)
    .sort((a, b) => b.premiumScore - a.premiumScore)
    .slice(0, limit)
      .map(({ premiumScore, ...clean }) => clean);;
}


module.exports = {
  loadAllListings,
  getFilteredListings
};
