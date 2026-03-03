const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const states = {
  1: { name: 'Melbourne (VIC)', url: 'http://localhost:3000/listings?stateToggle=on&allowedStates=vic' },
  2: { name: 'Sydney (NSW)',    url: 'http://localhost:3000/listings?stateToggle=on&allowedStates=nsw' },
  3: { name: 'Brisbane (QLD)',  url: 'http://localhost:3000/listings?stateToggle=on&allowedStates=qld' },
  4: { name: 'Barossa Valley (SA)', url: 'http://localhost:3000/listings?stateToggle=on&allowedStates=sa' },
  5: { name: 'NSW + VIC Combo', url: 'http://localhost:3000/listings?stateToggle=on&allowedStates=nsw,vic' },
  6: { name: 'All Premium Listings', url: 'http://localhost:3000/listings' },
  0: { name: 'Exit', url: null }
};

function showMenu() {
  console.clear();
  console.log('Airbnb Filter API CLI\n');
  console.log('Select state (1-6) or 0 to exit:');
  console.log('='.repeat(50));

  Object.entries(states).forEach(([key, { name }]) => {
    console.log(`  ${key}. ${name}`);
  });
  console.log('='.repeat(50));
  rl.question('Enter number: ', handleInput);
}

function handleInput(answer) {
  const choice = states[answer];

  if (choice && choice.url) {
    console.log('\nAPI URL:\n');
    console.log(choice.url);
    console.log(`\nExpected: Premium ${choice.name} listings`);
    console.log('\nCopy this URL into your browser to see results.\n');
    console.log('Press Enter to return to menu...');
    rl.question('', showMenu);
  } else if (answer === '0') {
    console.log('\nBye!');
    rl.close();
  } else {
    console.log('\nInvalid choice. Try 0-6.');
    console.log('Press Enter...');
    rl.question('', showMenu);
  }
}

console.log('Airbnb State Filter CLI');
console.log('Make sure server is running: npm start\n');
rl.question('Ready? (Press Enter)', () => {
  showMenu();
});
