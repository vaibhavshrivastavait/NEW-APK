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

console.log('=== MAIN MEDICINES (13 total) ===');
Array.from(mainMedicines).sort().forEach((medicine, index) => {
  console.log(`${index + 1}. ${medicine}`);
});

console.log('\n=== OPTIONAL MEDICINES (25 total) ===');
Array.from(optionalMedicines).sort().forEach((medicine, index) => {
  console.log(`${index + 1}. ${medicine}`);
});

// Display name mapping for medicines
const displayNames = {
  // Main medicines
  'hormone_estradiol': 'Estrogen HRT',
  'hormone_progesterone': 'Progesterone HRT', 
  'hormone_testosterone': 'Testosterone HRT',
  'tibolone': 'Tibolone',
  'raloxifene': 'Raloxifene (SERM)',
  'bazedoxifene': 'Bazedoxifene',
  'gabapentin': 'Gabapentin',
  'pregabalin': 'Pregabalin',
  'clonidine': 'Clonidine',
  'paroxetine': 'Paroxetine (SSRI)',
  'venlafaxine': 'Venlafaxine (SNRI)',
  'alendronate': 'Alendronate (Bisphosphonate)',
  'risedronate': 'Risedronate (Bisphosphonate)',
  
  // Optional medicines
  'warfarin': 'Warfarin',
  'ibuprofen': 'Ibuprofen',
  'aspirin': 'Aspirin',
  'clopidogrel': 'Clopidogrel',
  'heparin': 'Heparin',
  'rivaroxaban': 'Rivaroxaban',
  'apixaban': 'Apixaban',
  'simvastatin': 'Simvastatin',
  'atorvastatin': 'Atorvastatin',
  'levothyroxine': 'Levothyroxine',
  'metformin': 'Metformin',
  'amlodipine': 'Amlodipine',
  'lisinopril': 'Lisinopril',
  'insulin': 'Insulin',
  'morphine': 'Morphine',
  'oxycodone': 'Oxycodone',
  'tramadol': 'Tramadol',
  'alcohol': 'Alcohol',
  'lorazepam': 'Lorazepam',
  'diazepam': 'Diazepam',
  'propranolol': 'Propranolol',
  'metoprolol': 'Metoprolol',
  'verapamil': 'Verapamil',
  'diltiazem': 'Diltiazem',
  'tricyclic_antidepressants': 'Tricyclic Antidepressants',
  'tamoxifen': 'Tamoxifen',
  'linezolid': 'Linezolid',
  'calcium': 'Calcium Supplements',
  'iron': 'Iron Supplements',
  'magnesium': 'Magnesium Supplements',
  'cholestyramine': 'Cholestyramine'
};

console.log('\n=== MAIN MEDICINES WITH DISPLAY NAMES ===');
Array.from(mainMedicines).sort().forEach((medicine, index) => {
  console.log(`${index + 1}. ${medicine} -> "${displayNames[medicine]}"`);
});

console.log('\n=== OPTIONAL MEDICINES WITH DISPLAY NAMES ===');
Array.from(optionalMedicines).sort().forEach((medicine, index) => {
  console.log(`${index + 1}. ${medicine} -> "${displayNames[medicine]}"`);
});

console.log(`\nTotal: ${mainMedicines.size} main medicines, ${optionalMedicines.size} optional medicines`);