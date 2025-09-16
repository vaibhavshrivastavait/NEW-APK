const fs = require('fs');

// Load the drug interactions JSON
const drugData = JSON.parse(fs.readFileSync('./assets/rules/drug_interactions.json', 'utf8'));

// Extract main medicines
const mainMedicines = new Set();
const optionalMedicines = new Set();

drugData.pairs.forEach(pair => {
  mainMedicines.add(pair.main);
  pair.optionals.forEach(optional => {
    optionalMedicines.add(optional.drug);
  });
});

console.log('='.repeat(60));
console.log('MAIN MEDICINES EXTRACTED FROM drug_interactions.json');
console.log('='.repeat(60));
console.log(`Total: ${mainMedicines.size} main medicines\n`);

const sortedMainMedicines = Array.from(mainMedicines).sort();
sortedMainMedicines.forEach((medicine, index) => {
  console.log(`${(index + 1).toString().padStart(2, ' ')}. ${medicine}`);
});

console.log('\n' + '='.repeat(60));
console.log('OPTIONAL MEDICINES EXTRACTED FROM drug_interactions.json');
console.log('='.repeat(60));
console.log(`Total: ${optionalMedicines.size} optional medicines\n`);

const sortedOptionalMedicines = Array.from(optionalMedicines).sort();
sortedOptionalMedicines.forEach((medicine, index) => {
  console.log(`${(index + 1).toString().padStart(2, ' ')}. ${medicine}`);
});

console.log('\n' + '='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));
console.log(`Main medicines: ${mainMedicines.size}`);
console.log(`Optional medicines: ${optionalMedicines.size}`);
console.log(`Total unique medicines: ${mainMedicines.size + optionalMedicines.size}`);

// Export as arrays for easy copying
console.log('\n' + '='.repeat(60));
console.log('MAIN MEDICINES ARRAY (for copying)');
console.log('='.repeat(60));
console.log('[');
sortedMainMedicines.forEach((medicine, index) => {
  const comma = index < sortedMainMedicines.length - 1 ? ',' : '';
  console.log(`  "${medicine}"${comma}`);
});
console.log(']');

console.log('\n' + '='.repeat(60));
console.log('OPTIONAL MEDICINES ARRAY (for copying)');
console.log('='.repeat(60));
console.log('[');
sortedOptionalMedicines.forEach((medicine, index) => {
  const comma = index < sortedOptionalMedicines.length - 1 ? ',' : '';
  console.log(`  "${medicine}"${comma}`);
});
console.log(']');