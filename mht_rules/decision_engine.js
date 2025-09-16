const fs = require('fs');
const path = require('path');

function loadJSON(name){
  return JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
}

const risk_thresholds = loadJSON('risk_thresholds.json');
const drug_interactions = loadJSON('drug_interactions.json');
const treatment_rules = loadJSON('treatment_rules.json');

function categorizeRisk(value, thresholds){
  if (value === null || value === undefined) return 'low';
  if (value >= thresholds.high) return 'high';
  if (value >= thresholds.intermediate) return 'intermediate';
  return 'low';
}

function containsAny(list, item){
  if (!Array.isArray(list)) return false;
  return list.indexOf(item) !== -1;
}

function matchCondition(cond, input){
  for (const k of Object.keys(cond)){
    const val = cond[k];
    if (k === 'symptom_severity' && typeof val === 'object'){
      if (val.lte !== undefined && !(input.symptom_severity <= val.lte)) return false;
      if (val.gte !== undefined && !(input.symptom_severity >= val.gte)) return false;
      continue;
    }
    if (k === 'meds_include'){
      if (!containsAny(input.meds, val)) return false;
      continue;
    }
    if (k === 'therapy_selected'){
      if (Array.isArray(val)){
        if (!val.includes(input.therapy_selected)) return false;
      } else {
        if (input.therapy_selected !== val) return false;
      }
      continue;
    }
    if (typeof val === 'boolean'){
      if ((input[k] === true) !== val) return false;
      continue;
    }
    if (k.endsWith('_category') || k.endsWith('category')){
      if (input[k] !== val) return false;
      continue;
    }
    if (input[k] !== val) return false;
  }
  return true;
}

function evaluate(input){
  input.ASCVD_category = categorizeRisk(input.ASCVD, risk_thresholds.ASCVD);
  input.Framingham_category = categorizeRisk(input.Framingham || input.Framingham_score, risk_thresholds.Framingham);
  input.Gail_category = categorizeRisk(input.Gail, risk_thresholds.Gail);
  input.TyrerCuzick_category = categorizeRisk(input.TyrerCuzick, risk_thresholds.TyrerCuzick);
  input.Wells_category = categorizeRisk(input.Wells, risk_thresholds.Wells);
  input.FRAX_category = categorizeRisk(input.FRAX, risk_thresholds.FRAX);

  let warnings = [];
  let accumulated = [];

  for (const r of treatment_rules.contraindication){
    if (matchCondition(r.condition, input)){
      return {
        primary: r.action.recommendation,
        suitability: r.action.suitability,
        rationale: r.action.rationale,
        warnings
      };
    }
  }

  for (const r of treatment_rules.high_risk){
    if (matchCondition(r.condition, input)){
      accumulated.push(r.action);
      warnings.push(r.id);
    }
  }

  for (const med of input.meds || []){
    const medInfo = drug_interactions.drugClasses[med];
    if (!medInfo) continue;
    const interactions = medInfo.interactions || {};
    for (const k of Object.keys(interactions)){
      if (input.therapy_selected && (input.therapy_selected === k || input.therapy_selected === k.replace('_',''))){
        accumulated.push({ recommendation: 'Interaction: ' + interactions[k], suitability: 'Use with caution', rationale: 'Medication interaction detected: ' + med + ' -> ' + interactions[k] });
        warnings.push('interaction_' + med + '_' + k);
      }
    }
    if (med === 'anticoagulants' && (input.therapy_selected && input.therapy_selected.startsWith('estrogen'))){
      accumulated.push({ recommendation: 'Avoid systemic estrogen; prefer non-hormonal or consult specialist', suitability: 'Contraindicated', rationale: 'Anticoagulant present increases bleeding risk with systemic estrogen.' });
      warnings.push('anticoagulant_interaction');
    }
    if (med === 'anticonvulsants' && input.therapy_selected === 'estrogen_oral'){
      accumulated.push({ recommendation: 'Estrogen efficacy may be reduced; consider transdermal or adjust plan', suitability: 'Use with caution', rationale: 'Anticonvulsant may reduce oral estrogen levels.' });
      warnings.push('anticonvulsant_interaction');
    }
  }

  for (const r of treatment_rules.moderate_risk){
    if (matchCondition(r.condition, input)){
      accumulated.push(r.action);
    }
  }

  for (const r of treatment_rules.default){
    if (matchCondition(r.condition, input)){
      accumulated.push(r.action);
    }
  }

  const priority = { 'Contraindicated': 3, 'Use with caution': 2, 'Suitable': 1, 'Suitable (for osteoporosis therapy)': 1 };
  accumulated.sort((a,b)=> (priority[b.suitability]||0) - (priority[a.suitability]||0));
  const chosen = accumulated.length ? accumulated[0] : { recommendation: 'No specific recommendation', suitability: 'Suitable', rationale: 'No rules matched specifically.' };

  return {
    primary: chosen.recommendation,
    suitability: chosen.suitability,
    rationale: chosen.rationale,
    warnings
  };
}

module.exports = { evaluate };
