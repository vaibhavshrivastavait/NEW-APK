const fs = require('fs');
const path = require('path');
const engine = require('./decision_engine.js');
const examples = JSON.parse(fs.readFileSync(path.join(__dirname,'examples.json'),'utf8'));

function printResult(id, input, out){
  console.log('---', id, '---');
  console.log('therapy_selected:', input.therapy_selected, 'meds:', input.meds);
  console.log('Primary:', out.primary);
  console.log('Suitability:', out.suitability);
  console.log('Rationale:', out.rationale);
  if (out.warnings && out.warnings.length) console.log('Warnings:', out.warnings.join(', '));
  console.log('');
}

for (const ex of examples){
  const res = engine.evaluate(ex.input);
  printResult(ex.id, ex.input, res);
}
