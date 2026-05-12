const express = require('express');
const { loadAllListings, getFilteredListings } = require('./data');

const app = express();
const cors = require('cors');
app.use(cors());
const PORT = 3000;

let dataLoaded = false;

// Load data once on server start
loadAllListings()
  .then(() => {
    dataLoaded = true;
    console.log('All listings loaded into memory.');
  })
  .catch(err => {
    console.error('Error loading listings:', err);
  });

app.get('/', (req, res) => {
  res.send(
    '<h1>Airbnb Premium Listings API</h1>' +
    '<p>Use <code>/listings?stateToggle=on&allowedStates=vic</code> etc.</p>'
  );
});

app.get('/listings', (req, res) => {
  if (!dataLoaded) {
    return res.status(503).json({ error: 'Data is still loading, try again in a few seconds.' });
  }

  const { stateToggle, allowedStates, limit } = req.query;
  

  const listings = getFilteredListings({
    stateToggle,
    allowedStates,
    limit: limit ? parseInt(limit, 10) : (stateToggle === 'on' ? 20 : 100)
  });

  res.json({
    count: listings.length,
    stateToggle: stateToggle || 'off',
    allowedStates: allowedStates || null,
    listings
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
