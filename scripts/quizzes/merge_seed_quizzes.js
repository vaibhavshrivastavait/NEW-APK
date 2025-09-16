#!/usr/bin/env node

/**
 * Quiz Merge Script - Non-destructive integration of popular CME quizzes
 * Version: 1.0.0
 * Purpose: Safely merge popular quiz content without overwriting existing quizzes
 */

const fs = require('fs');
const path = require('path');

// Configuration
const EXISTING_CME_PATH = path.join(__dirname, '../../assets/cme-content.json');
const POPULAR_QUIZZES_PATH = path.join(__dirname, '../../data/quizzes/seed_popular_quizzes.json');
const OUTPUT_PATH = path.join(__dirname, '../../assets/cme-content-merged.json');
const BACKUP_PATH = path.join(__dirname, '../../assets/cme-content.backup.json');

/**
 * Main merge function
 */
async function mergeQuizzes() {
  try {
    console.log('🔄 Starting quiz merge process...');
    
    // Load existing CME content
    const existingContent = JSON.parse(fs.readFileSync(EXISTING_CME_PATH, 'utf8'));
    console.log(`📚 Loaded existing CME content: ${existingContent.modules.length} modules`);
    
    // Load popular quizzes seed data
    const popularQuizzes = JSON.parse(fs.readFileSync(POPULAR_QUIZZES_PATH, 'utf8'));
    console.log(`🌟 Loaded popular quizzes: ${popularQuizzes.popularQuizzes.length} quizzes`);
    
    // Create backup of existing content
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(existingContent, null, 2));
    console.log(`💾 Created backup at: ${BACKUP_PATH}`);
    
    // Initialize merged content
    const mergedContent = {
      ...existingContent,
      version: `${existingContent.version}-popular-${popularQuizzes.version}`,
      lastUpdated: new Date().toISOString(),
      metadata: {
        ...(existingContent.metadata || {}),
        popularQuizzesAdded: popularQuizzes.popularQuizzes.length,
        mergedAt: new Date().toISOString()
      }
    };
    
    // Add popular quizzes section
    mergedContent.popularQuizzes = {
      ...popularQuizzes.metadata,
      quizzes: []
    };
    
    // Process each popular quiz
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const quiz of popularQuizzes.popularQuizzes) {
      const existingQuizId = findExistingQuiz(existingContent, quiz.id);
      
      if (existingQuizId) {
        // Create versioned ID to avoid conflicts
        const versionedId = createVersionedId(quiz.id, quiz.version);
        console.log(`⚠️  Quiz ID '${quiz.id}' exists, creating version: '${versionedId}'`);
        
        mergedContent.popularQuizzes.quizzes.push({
          ...quiz,
          id: versionedId,
          originalId: quiz.id,
          conflictResolution: 'versioned'
        });
        addedCount++;
      } else {
        // Safe to add with original ID
        mergedContent.popularQuizzes.quizzes.push({
          ...quiz,
          conflictResolution: 'none'
        });
        addedCount++;
      }
    }
    
    // Update totals
    mergedContent.metadata.totalModules = (existingContent.modules?.length || 0) + addedCount;
    mergedContent.metadata.totalCredits = (existingContent.metadata?.totalCredits || 0) + 
                                          (popularQuizzes.metadata.totalQuizzes * 0.5); // 0.5 credits per quiz
    
    // Write merged content
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mergedContent, null, 2));
    
    // Generate summary report
    const summary = {
      timestamp: new Date().toISOString(),
      existingModules: existingContent.modules?.length || 0,
      popularQuizzesAdded: addedCount,
      quizzesSkipped: skippedCount,
      totalModules: mergedContent.metadata.totalModules,
      totalCredits: mergedContent.metadata.totalCredits,
      backupCreated: BACKUP_PATH,
      mergedContentPath: OUTPUT_PATH
    };
    
    console.log('\n✅ Quiz merge completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Existing modules: ${summary.existingModules}`);
    console.log(`   • Popular quizzes added: ${summary.popularQuizzesAdded}`);
    console.log(`   • Total modules: ${summary.totalModules}`);
    console.log(`   • Total credits: ${summary.totalCredits}`);
    console.log(`   • Merged content saved to: ${OUTPUT_PATH}`);
    
    // Save summary report
    const summaryPath = path.join(__dirname, 'merge-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`   • Summary report: ${summaryPath}`);
    
    return summary;
    
  } catch (error) {
    console.error('❌ Error during quiz merge:', error);
    throw error;
  }
}

/**
 * Check if quiz ID already exists in content
 */
function findExistingQuiz(content, quizId) {
  // Check in modules
  if (content.modules) {
    for (const module of content.modules) {
      if (module.id === quizId) {
        return module.id;
      }
    }
  }
  
  // Check in existing popular quizzes (if any)
  if (content.popularQuizzes?.quizzes) {
    for (const quiz of content.popularQuizzes.quizzes) {
      if (quiz.id === quizId || quiz.originalId === quizId) {
        return quiz.id;
      }
    }
  }
  
  return null;
}

/**
 * Create versioned ID for conflicting quizzes
 */
function createVersionedId(originalId, version) {
  const versionSuffix = version.replace(/\./g, '-');
  return `${originalId}-v${versionSuffix}`;
}

/**
 * Rollback function to restore from backup
 */
function rollback() {
  try {
    if (fs.existsSync(BACKUP_PATH)) {
      fs.copyFileSync(BACKUP_PATH, EXISTING_CME_PATH);
      console.log('✅ Rollback completed - restored original content');
    } else {
      console.log('⚠️  No backup found to rollback from');
    }
  } catch (error) {
    console.error('❌ Error during rollback:', error);
  }
}

// CLI handling
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'merge':
      mergeQuizzes().catch(process.exit);
      break;
    case 'rollback':
      rollback();
      break;
    default:
      console.log('Usage:');
      console.log('  node merge_seed_quizzes.js merge    - Merge popular quizzes');
      console.log('  node merge_seed_quizzes.js rollback - Rollback to backup');
      break;
  }
}

module.exports = { mergeQuizzes, rollback };