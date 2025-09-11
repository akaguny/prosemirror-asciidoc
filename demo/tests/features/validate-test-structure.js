#!/usr/bin/env node

/**
 * Test Structure Validation Script
 *
 * Validates that the test architecture meets all requirements:
 * - Directory structure compliance
 * - File naming conventions
 * - Test coverage completeness
 * - Configuration validation
 * - Feature traceability
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestStructureValidator {
  constructor() {
    this.baseDir = path.join(__dirname);
    this.errors = [];
    this.warnings = [];
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  error(message) {
    this.errors.push(message);
    this.results.failed++;
    this.log(message, 'error');
  }

  warning(message) {
    this.warnings.push(message);
    this.results.warnings++;
    this.log(message, 'warning');
  }

  success(message) {
    this.results.passed++;
    this.log(message, 'success');
  }

  // Check if path exists
  pathExists(filePath) {
    return fs.existsSync(path.join(this.baseDir, filePath));
  }

  // Read file content
  readFile(filePath) {
    try {
      return fs.readFileSync(path.join(this.baseDir, filePath), 'utf8');
    } catch (e) {
      return null;
    }
  }

  // Get directory contents
  readDir(dirPath) {
    try {
      return fs.readdirSync(path.join(this.baseDir, dirPath));
    } catch (e) {
      return [];
    }
  }

  // Validate directory structure
  validateDirectoryStructure() {
    this.log('Validating directory structure...');

    const requiredDirs = [
      'block-level',
      'block-level/code-blocks',
      'block-level/headings',
      'block-level/lists',
      'block-level/paragraphs',
      'inline',
      'inline/formatting',
      'inline/links',
      'composite',
      'composite/bidirectional-sync',
      'composite/mixed-content',
      'composite/nested-structures',
      'regression',
      'shared',
      'shared/utils',
      'shared/config',
      'shared/page-objects'
    ];

    for (const dir of requiredDirs) {
      if (this.pathExists(dir)) {
        this.success(`Directory exists: ${dir}`);
      } else {
        this.error(`Missing required directory: ${dir}`);
      }
    }
  }

  // Validate test files
  validateTestFiles() {
    this.log('Validating test files...');

    const expectedTestFiles = [
      'block-level/code-blocks/code-blocks.spec.ts',
      'block-level/headings/headings.spec.ts',
      'block-level/lists/lists.spec.ts',
      'block-level/paragraphs/paragraphs.spec.ts',
      'inline/formatting/formatting.spec.ts',
      'inline/links/links.spec.ts',
      'composite/bidirectional-sync/bidirectional-sync.spec.ts',
      'composite/mixed-content/mixed-content.spec.ts',
      'composite/nested-structures/nested-structures.spec.ts',
      'regression/regression.spec.ts'
    ];

    for (const file of expectedTestFiles) {
      if (this.pathExists(file)) {
        this.success(`Test file exists: ${file}`);
        this.validateTestFileContent(file);
      } else {
        this.error(`Missing test file: ${file}`);
      }
    }
  }

  // Validate test file content
  validateTestFileContent(filePath) {
    const content = this.readFile(filePath);
    if (!content) {
      this.error(`Cannot read test file: ${filePath}`);
      return;
    }

    // Check for required test structure elements
    const checks = [
      { pattern: /describe\(.*Feature/, name: 'Feature describe block' },
      { pattern: /testWithEditor/, name: 'testWithEditor usage' },
      { pattern: /ContentValidator/, name: 'ContentValidator usage' },
      { pattern: /TestDataProvider/, name: 'TestDataProvider usage' },
      { pattern: /beforeEach/, name: 'beforeEach setup' },
      { pattern: /afterEach/, name: 'afterEach cleanup' }
    ];

    for (const check of checks) {
      if (check.pattern.test(content)) {
        this.success(`✓ ${check.name} found in ${filePath}`);
      } else {
        this.warning(`⚠️ ${check.name} missing in ${filePath}`);
      }
    }

    // Check for feature matrix comments
    if (content.includes('Feature Matrix:')) {
      this.success(`✓ Feature matrix documentation found in ${filePath}`);
    } else {
      this.warning(`⚠️ Feature matrix documentation missing in ${filePath}`);
    }

    // Check for regression markers
    if (content.includes('Regression Markers:')) {
      this.success(`✓ Regression markers found in ${filePath}`);
    } else {
      this.warning(`⚠️ Regression markers missing in ${filePath}`);
    }
  }

  // Validate utility files
  validateUtilityFiles() {
    this.log('Validating utility files...');

    const requiredUtils = [
      'shared/utils/TestDataProvider.ts',
      'shared/utils/ContentValidator.ts',
      'shared/utils/test-helpers.ts',
      'shared/utils/test-config.ts',
      'shared/utils/assertion-helpers.ts',
      'shared/utils/content-generators.ts',
      'shared/utils/TestDataProvider.ts'
    ];

    for (const file of requiredUtils) {
      if (this.pathExists(file)) {
        this.success(`Utility file exists: ${file}`);
        this.validateUtilityFileContent(file);
      } else {
        this.error(`Missing utility file: ${file}`);
      }
    }
  }

  // Validate utility file content
  validateUtilityFileContent(filePath) {
    const content = this.readFile(filePath);
    if (!content) {
      this.error(`Cannot read utility file: ${filePath}`);
      return;
    }

    // Check for exports
    if (content.includes('export')) {
      this.success(`✓ Exports found in ${filePath}`);
    } else {
      this.warning(`⚠️ No exports found in ${filePath}`);
    }

    // Check for class definitions
    if (content.includes('class ') || content.includes('export class')) {
      this.success(`✓ Class definition found in ${filePath}`);
    } else {
      this.warning(`⚠️ No class definition found in ${filePath}`);
    }
  }

  // Validate page objects
  validatePageObjects() {
    this.log('Validating page objects...');

    const pageObjectFiles = this.readDir('shared/page-objects');
    if (pageObjectFiles.length === 0) {
      this.warning('No page object files found');
      return;
    }

    for (const file of pageObjectFiles) {
      if (file.endsWith('.ts')) {
        this.success(`Page object file found: ${file}`);
        const filePath = `shared/page-objects/${file}`;
        const content = this.readFile(filePath);

        if (content && content.includes('class ')) {
          this.success(`✓ Page object class found in ${file}`);
        } else {
          this.warning(`⚠️ Page object class missing in ${file}`);
        }
      }
    }
  }

  // Validate feature coverage
  validateFeatureCoverage() {
    this.log('Validating feature coverage...');

    const features = [
      { name: 'Headings', file: 'block-level/headings/headings.spec.ts' },
      { name: 'Lists', file: 'block-level/lists/lists.spec.ts' },
      { name: 'Formatting', file: 'inline/formatting/formatting.spec.ts' },
      { name: 'Links', file: 'inline/links/links.spec.ts' },
      { name: 'Bidirectional Sync', file: 'composite/bidirectional-sync/bidirectional-sync.spec.ts' },
      { name: 'Code Blocks', file: 'block-level/code-blocks/code-blocks.spec.ts' },
      { name: 'Paragraphs', file: 'block-level/paragraphs/paragraphs.spec.ts' },
      { name: 'Mixed Content', file: 'composite/mixed-content/mixed-content.spec.ts' },
      { name: 'Nested Structures', file: 'composite/nested-structures/nested-structures.spec.ts' }
    ];

    for (const feature of features) {
      if (this.pathExists(feature.file)) {
        const content = this.readFile(feature.file);
        if (content && content.includes(feature.name)) {
          this.success(`✓ ${feature.name} feature test coverage verified`);
        } else {
          this.warning(`⚠️ ${feature.name} feature test may be incomplete`);
        }
      } else {
        this.error(`Missing feature test file: ${feature.file}`);
      }
    }
  }

  // Validate README documentation
  validateDocumentation() {
    this.log('Validating documentation...');

    if (this.pathExists('README.md')) {
      this.success('README.md exists');
      const content = this.readFile('README.md');

      const requiredSections = [
        'Feature Matrix',
        'Content Model Mapping',
        'Demo App Coverage Analysis',
        'Regression Markers Catalog',
        'Test Organization Overview',
        'Execution Guidelines',
        'Feature Traceability',
        'Test Coverage Analysis',
        'Maintenance Guidelines',
        'CI/CD Integration'
      ];

      for (const section of requiredSections) {
        if (content && content.includes(`## ${section}`)) {
          this.success(`✓ Documentation section found: ${section}`);
        } else {
          this.error(`Missing documentation section: ${section}`);
        }
      }
    } else {
      this.error('README.md is missing');
    }
  }

  // Generate validation report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST STRUCTURE VALIDATION REPORT');
    console.log('='.repeat(60));

    console.log(`\n📊 Summary:`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️ Warnings: ${this.results.warnings}`);

    if (this.errors.length > 0) {
      console.log(`\n❌ Errors (${this.errors.length}):`);
      this.errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️ Warnings (${this.warnings.length}):`);
      this.warnings.forEach((warning, i) => console.log(`  ${i + 1}. ${warning}`));
    }

    const overallStatus = this.results.failed === 0 ? '✅ PASSED' : '❌ FAILED';
    console.log(`\n🎯 Overall Status: ${overallStatus}`);

    if (this.results.failed === 0) {
      console.log('\n🎉 All validation checks passed! The test structure meets all requirements.');
    } else {
      console.log(`\n⚠️ ${this.results.failed} validation checks failed. Please review and fix the issues above.`);
    }

    console.log('='.repeat(60));
  }

  // Run all validations
  async run() {
    console.log('🚀 Starting Test Structure Validation...\n');

    this.validateDirectoryStructure();
    this.validateTestFiles();
    this.validateUtilityFiles();
    this.validatePageObjects();
    this.validateFeatureCoverage();
    this.validateDocumentation();

    this.generateReport();

    // Exit with appropriate code
    process.exit(this.results.failed === 0 ? 0 : 1);
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new TestStructureValidator();
  validator.run().catch(console.error);
}

export default TestStructureValidator;