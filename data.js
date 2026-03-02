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
const csv = require('csv-parser');

async function loadListings() {
  const allListings = [];
  const csvFiles = [
    'listings_brisbane.csv',    // QLD
    'listings_melbourne.csv',   // VIC  
    'listings_sydney.csv',      // NSW
    'listings_sunshine.csv'     // QLD (Sunshine Coast)
  ];

  for (const file of csvFiles) {
    if (fs.existsSync(file)) {
      console.log(`Loading ${file}...`);
      const cityListings = [];
      
      await new Promise((resolve, reject) => {
        fs.createReadStream(file)
          .pipe(csv())
          .on('data', (row) => {
            const listing = {
              id: parseInt(row.id) || 0,
              city: row.city || row.neighbourhood || row.name?.substring(0, 50) || 'Unknown',
              state: getStateFromFilename(file),
              isPremium: parseFloat(row.price || 0) > 200,
              title: row.name || `${row.room_type || 'Entire home'} in ${row.neighbourhood || 'Unknown'}`,
              price: parseFloat(row.price || 0),
              room_type: row.room_type || 'Entire home'
            };
            cityListings.push(listing);
          })
          .on('end', () => {
            console.log(`${cityListings.length} from ${file}`);
            allListings.push(...cityListings);
            resolve();
          })
          .on('error', reject);
      });
    } else {
      console.log(`${file} missing`);
    }
  }
  
  console.log(`Total: ${allListings.length} listings!`);
  return allListings;
}

function getStateFromFilename(filename) {
  if (filename.includes('melbourne')) return 'VIC';
  if (filename.includes('sydney')) return 'NSW';
  if (filename.includes('brisbane') || filename.includes('sunshine')) return 'QLD';
  return 'UNKNOWN';
}

// EXPORT - this was the issue
module.exports.loadListings = loadListings;
