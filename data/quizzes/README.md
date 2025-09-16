# CME Quiz Management

This directory contains the quiz management system for the MHT Assessment app, including popular CME quizzes and merge utilities.

## Files Structure

```
/data/quizzes/
├── README.md                       # This file
├── seed_popular_quizzes.json      # Popular quiz content
└── /scripts/quizzes/
    ├── merge_seed_quizzes.js      # Non-destructive merge script
    └── merge-summary.json         # Last merge operation summary
```

## Popular Quizzes

The `seed_popular_quizzes.json` file contains 9 topic-focused quizzes covering key MHT concepts:

1. **Menopause Basics** - Definition, staging, laboratory tests
2. **HRT Indications & Contraindications** - Evidence-based indications and safety
3. **Cardiovascular Risk & HRT** - ASCVD basics and risk stratification
4. **VTE Risk & Wells Score** - Thromboembolism risk assessment
5. **Osteoporosis & FRAX Interpretation** - Bone health and fracture risk
6. **Breast Cancer Risk Screening** - Gail and Tyrer-Cuzick model basics
7. **Drug Interactions & HRT** - Common medication interactions
8. **Counseling & Shared Decision Making** - Patient communication strategies
9. **Emergency Scenarios & Referrals** - Acute care and referral guidelines

## Merge Script Usage

### Adding Popular Quizzes

To merge popular quizzes into the main CME content:

```bash
cd /app
node scripts/quizzes/merge_seed_quizzes.js merge
```

This will:
- Create a backup of existing content (`cme-content.backup.json`)
- Merge popular quizzes without overwriting existing content
- Generate `cme-content-merged.json` with combined content
- Create a summary report in `scripts/quizzes/merge-summary.json`

### Rollback Changes

If you need to revert to the original content:

```bash
cd /app
node scripts/quizzes/merge_seed_quizzes.js rollback
```

### Merge Behavior

**Non-Destructive Merging:**
- Existing quiz IDs are preserved
- Conflicting IDs get versioned suffixes (e.g., `quiz-id-v1-0-0`)
- Original modules remain unchanged
- Popular quizzes are added as a separate section

**Output Structure:**
```json
{
  "version": "original-version-popular-new-version",
  "modules": [...], // Original modules preserved
  "popularQuizzes": {
    "category": "Popular CME",
    "totalQuizzes": 9,
    "quizzes": [...] // New popular quizzes
  },
  "metadata": {
    "totalModules": 15, // Original + popular
    "totalCredits": 10.5,
    "popularQuizzesAdded": 9,
    "mergedAt": "2025-01-16T00:00:00Z"
  }
}
```

## Adding New Quizzes

### Quiz Format

Each quiz follows this structure:

```json
{
  "id": "unique-quiz-id",
  "version": "1.0.0",
  "title": "Quiz Title",
  "description": "Brief description",
  "category": "Popular CME",
  "tags": ["tag1", "tag2"],
  "estimatedMinutes": 15,
  "passingScore": 80,
  "timeLimit": null,
  "difficulty": "Beginner|Intermediate|Advanced",
  "questions": [
    {
      "id": "question-id",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Detailed explanation..."
    }
  ]
}
```

### Steps to Add New Quiz

1. **Edit seed file:** Add your quiz to `seed_popular_quizzes.json`
2. **Update metadata:** Increment version and update totals
3. **Run merge:** Execute the merge script
4. **Test:** Verify quiz appears in CME dashboard
5. **Commit:** Save changes to version control

### Best Practices

- **Unique IDs:** Always use unique quiz IDs to avoid conflicts
- **Versioning:** Follow semantic versioning (1.0.0, 1.1.0, 2.0.0)
- **Question Quality:** Include detailed explanations with references
- **Difficulty Balance:** Mix beginner, intermediate, and advanced questions
- **Testing:** Validate all questions before merging

## Quiz Categories & Tagging

Use consistent tags for better organization:

- **Clinical:** `menopause`, `HRT`, `cardiovascular`, `osteoporosis`
- **Skills:** `assessment`, `counseling`, `decision-making`
- **Safety:** `contraindications`, `drug-interactions`, `emergency`
- **Tools:** `ASCVD`, `FRAX`, `Wells`, `Gail`, `Tyrer-Cuzick`

## Testing

### Unit Tests

Run quiz validation tests:

```bash
cd /app
npm test __tests__/CmeQuizAnswerValidation.test.ts
```

### Manual Testing

1. Navigate to CME Dashboard
2. Verify "Popular CME" section appears
3. Test quiz selection and completion
4. Verify answer feedback is immediate and correct
5. Check accessibility with screen reader

## Troubleshooting

### Common Issues

**Quiz not appearing:**
- Check merge script output for errors
- Verify quiz ID doesn't conflict with existing content
- Ensure merged content file exists

**Answer validation bug:**
- Run unit tests to verify fix
- Check for rapid clicking behavior
- Verify accessibility announcements

**Performance issues:**
- Check for excessive re-renders
- Verify debouncing is working (150ms delay)
- Monitor memory usage with large quiz sets

### Debug Commands

```bash
# Check merged content structure
cat /app/assets/cme-content-merged.json | jq '.popularQuizzes.quizzes | length'

# Verify quiz IDs
cat /app/assets/cme-content-merged.json | jq '.popularQuizzes.quizzes[].id'

# Check merge summary
cat /app/scripts/quizzes/merge-summary.json
```

## Version History

- **v1.0.0** - Initial popular quiz implementation
- **v1.1.0** - Added answer validation bug fixes
- **v1.2.0** - Enhanced accessibility and UI improvements

## Contributing

When contributing new quizzes:

1. Follow the established quiz format
2. Include evidence-based content with references
3. Test thoroughly before submitting
4. Update documentation as needed
5. Run merge script to validate integration

For questions or issues, refer to the main project documentation or create an issue in the project repository.