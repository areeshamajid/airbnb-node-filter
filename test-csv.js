const data = require('./data');
console.log('Testing CSV loader...');

async function test() {
  const listings = await data.loadListings();
  console.log('✅ Test complete:', listings.length, 'listings');
  process.exit(0);
}

test();
