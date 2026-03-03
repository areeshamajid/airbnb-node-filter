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

function getFilteredListings({ stateToggle, allowedStates, limit = 20 }) {
  let results = listings;

  if (stateToggle === 'on' && allowedStates) {
    const allowed = allowedStates.split(',').map(s => s.trim().toUpperCase());
    results = results.filter(l => allowed.includes(l.state));
  }

  return results.slice(0, limit);
}

module.exports = {
  loadAllListings,
  getFilteredListings
};
