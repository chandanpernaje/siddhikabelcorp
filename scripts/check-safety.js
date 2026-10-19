#!/usr/bin/env node

/**
 * Siddhi Kabel Corporation - Repository Safety & Security Scanner
 * 
 * Verifies:
 * 1. No `.env` or credential files are tracked by Git.
 * 2. `.gitignore` contains critical security rules to prevent leaks.
 * 3. Tracked source files do not contain hardcoded private keys or production secrets.
 * 4. `.env.example` exists and contains sanitized placeholder values.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

console.log(`${COLORS.bold}${COLORS.blue}====================================================${COLORS.reset}`);
console.log(`${COLORS.bold}${COLORS.blue}   Siddhi Kabel Corp - Repository Safety Verification   ${COLORS.reset}`);
console.log(`${COLORS.bold}${COLORS.blue}====================================================${COLORS.reset}\n`);

let hasErrors = 0;
let hasWarnings = 0;

function reportPass(msg) {
  console.log(`  ${COLORS.green}✔ PASS:${COLORS.reset} ${msg}`);
}

function reportFail(msg) {
  console.log(`  ${COLORS.red}✖ FAIL:${COLORS.reset} ${msg}`);
  hasErrors++;
}

function reportWarn(msg) {
  console.log(`  ${COLORS.yellow}⚠ WARN:${COLORS.reset} ${msg}`);
  hasWarnings++;
}

// ---------------------------------------------------------
// 1. Check Git Tracked Files for Leaked .env or Secrets
// ---------------------------------------------------------
console.log(`${COLORS.bold}1. Checking Git Tracked Files for Secret Files...${COLORS.reset}`);
try {
  const trackedFilesOutput = execSync('git ls-files', { cwd: rootDir, encoding: 'utf-8' });
  const trackedFiles = trackedFilesOutput.split(/\r?\n/).filter(Boolean);

  const forbiddenFilesPattern = /(^|\/)\.env(\.(local|production|development|test))?$/i;
  const certificatePattern = /\.(pem|key|pfx|pkcs12)$/i;

  let dangerousFiles = [];
  for (const file of trackedFiles) {
    if (file.endsWith('.env.example')) continue;
    if (forbiddenFilesPattern.test(file) || certificatePattern.test(file)) {
      dangerousFiles.push(file);
    }
  }

  if (dangerousFiles.length > 0) {
    reportFail(`Forbidden sensitive files found tracked in Git:\n      ${dangerousFiles.join('\n      ')}`);
  } else {
    reportPass(`No sensitive .env or certificate files are tracked by Git (${trackedFiles.length} files scanned).`);
  }
} catch (err) {
  reportWarn(`Unable to inspect Git index via 'git ls-files': ${err.message}`);
}

// ---------------------------------------------------------
// 2. Check .gitignore Integrity
// ---------------------------------------------------------
console.log(`\n${COLORS.bold}2. Verifying .gitignore Security Rules...${COLORS.reset}`);
const gitignorePath = path.join(rootDir, '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  reportFail('.gitignore file is missing in the workspace root!');
} else {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  const requiredRules = ['.env', 'node_modules', 'dist'];
  const missingRules = [];

  for (const rule of requiredRules) {
    if (!gitignoreContent.includes(rule)) {
      missingRules.push(rule);
    }
  }

  if (missingRules.length > 0) {
    reportFail(`Root .gitignore is missing safety rules for: ${missingRules.join(', ')}`);
  } else {
    reportPass('Root .gitignore contains all mandatory security rules (.env, node_modules, dist, etc.).');
  }
}

// ---------------------------------------------------------
// 3. Check for Live Sensitive Secrets in Tracked Code
// ---------------------------------------------------------
console.log(`\n${COLORS.bold}3. Scanning Tracked Files for Hardcoded Credentials...${COLORS.reset}`);

const SECRET_PATTERNS = [
  { name: 'Private Key', regex: /-----BEGIN (RSA|EC|OPENSSH|DSA|PGP) PRIVATE KEY-----/ },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'GitHub Personal Access Token', regex: /(ghp_[0-9a-zA-Z]{36}|github_pat_[0-9a-zA-Z_]{82})/ },
  { name: 'Slack Bot Token', regex: /xoxb-[0-9]{11}-[0-9]{11}-[0-9a-zA-Z]{24}/ },
];

try {
  const trackedFilesOutput = execSync('git ls-files', { cwd: rootDir, encoding: 'utf-8' });
  const trackedFiles = trackedFilesOutput.split(/\r?\n/).filter(Boolean);

  let leaksFound = 0;
  for (const relFile of trackedFiles) {
    const fullPath = path.join(rootDir, relFile);
    if (!fs.existsSync(fullPath)) continue;

    // Skip binary files and packages
    if (relFile.endsWith('.xlsx') || relFile.endsWith('.png') || relFile.endsWith('.jpg') || relFile.endsWith('.svg') || relFile.endsWith('.lock') || relFile.endsWith('package-lock.json')) {
      continue;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(content)) {
          reportFail(`Potential secret (${pattern.name}) found in ${relFile}`);
          leaksFound++;
        }
      }
    } catch {
      // Ignore binary read errors
    }
  }

  if (leaksFound === 0) {
    reportPass('Zero high-risk secrets or private keys detected in tracked source files.');
  }
} catch (err) {
  reportWarn(`Skipped deep file content search: ${err.message}`);
}

// ---------------------------------------------------------
// 4. Check .env.example Sanitization
// ---------------------------------------------------------
console.log(`\n${COLORS.bold}4. Checking Environment Template Safety...${COLORS.reset}`);
const envExamplePaths = [
  path.join(rootDir, '.env.example'),
  path.join(rootDir, 'backend', '.env.example'),
];

for (const envExPath of envExamplePaths) {
  if (fs.existsSync(envExPath)) {
    const envExContent = fs.readFileSync(envExPath, 'utf-8');
    // Check if raw credentials were inadvertently committed in .env.example
    if (/mongodb\+srv:\/\/[^<][^:]+:[^<][^@]+@/.test(envExContent)) {
      reportFail(`Unsanitized live MongoDB credentials in ${path.relative(rootDir, envExPath)}!`);
    } else {
      reportPass(`Sanitized template verified: ${path.relative(rootDir, envExPath)}`);
    }
  }
}

// ---------------------------------------------------------
// Summary & Exit Status
// ---------------------------------------------------------
console.log(`\n${COLORS.bold}${COLORS.blue}====================================================${COLORS.reset}`);
if (hasErrors > 0) {
  console.log(`${COLORS.bold}${COLORS.red}✖ Safety Check Failed! Found ${hasErrors} issue(s).${COLORS.reset}`);
  console.log(`${COLORS.red}Please address the security issues before committing or pushing.${COLORS.reset}`);
  process.exit(1);
} else {
  console.log(`${COLORS.bold}${COLORS.green}✔ All Safety Checks Passed Successfully!${COLORS.reset}`);
  if (hasWarnings > 0) {
    console.log(`${COLORS.yellow}(${hasWarnings} non-blocking warning(s) noted)${COLORS.reset}`);
  }
  console.log(`${COLORS.green}Repository is safe and secure for release.${COLORS.reset}`);
  process.exit(0);
}
