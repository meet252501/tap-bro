/**
 * Master Test Orchestrator for Tap-Bro
 * 
 * Runs all 6 specialized QA & Security test suites:
 * 1. Unit & Engine Logic Suite (scripts/test-unit.js)
 * 2. Strix-Style OWASP Security Audit (scripts/strix-audit.js)
 * 3. Tabletop QR Code & NFC Route Suite (scripts/test-qr.js)
 * 4. Diner Multi-Language & Tone Suite (scripts/test-diner-languages.js)
 * 5. Restaurant Manager Portal E2E (scripts/test-manager.js)
 * 6. Real Human-User End-to-End Simulation (scripts/human-tester.js)
 */

const { spawn } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  magenta: '\x1b[35m',
};

const suites = [
  { name: 'Unit & Engine Logic', script: 'scripts/test-unit.js', desc: 'DB Schemas, Rate Limiter, URL Resolver, Linguistic Engine' },
  { name: 'Strix OWASP Security Audit', script: 'scripts/strix-audit.js', desc: 'OWASP Headers, Brute-Force Defense, AI Quotas, Auth Guards' },
  { name: 'Tabletop QR & NFC Targets', script: 'scripts/test-qr.js', desc: '600px PNG Generation, Public Domain Routing, Error Boundaries' },
  { name: 'Diner Multilingual Engine', script: 'scripts/test-diner-languages.js', desc: 'Multi-Language, Multi-Tone, Template Sanitization, Counters' },
  { name: 'Restaurant Manager Portal', script: 'scripts/test-manager.js', desc: 'Manager Login, NFC Tabletop URL, Profile & Menu Sync' },
  { name: 'Real Human-User E2E Journey', script: 'scripts/human-tester.js', desc: 'Admin Login ➔ Invite ➔ Email Button ➔ Mobile Setup ➔ Diner Review' },
];

function runScript(scriptPath) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, BASE_URL: 'http://localhost:3000', TARGET_URL: 'http://localhost:3000' }
    });

    child.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      resolve({ code, duration });
    });

    child.on('error', (err) => {
      resolve({ code: 1, duration: 0, error: err.message });
    });
  });
}

async function runMasterTestSuite() {
  console.log(`\n${colors.bold}${colors.magenta}╔══════════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}║        TAP-BRO COMPREHENSIVE QA & END-TO-END MASTER SUITE            ║${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}╚══════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  const results = [];
  let allPassed = true;

  for (let i = 0; i < suites.length; i++) {
    const suite = suites[i];
    console.log(`\n${colors.bold}${colors.yellow}======================================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.yellow} [${i + 1}/${suites.length}] RUNNING: ${suite.name} (${suite.desc})${colors.reset}`);
    console.log(`${colors.bold}${colors.yellow}======================================================================${colors.reset}`);

    const res = await runScript(suite.script);
    const passed = res.code === 0;
    if (!passed) allPassed = false;

    results.push({
      ...suite,
      passed,
      duration: res.duration
    });
  }

  // Final Executive Scorecard
  console.log(`\n\n${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}                TAP-BRO FINAL QA EXECUTIVE SCORECARD                  ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════════════${colors.reset}\n`);

  results.forEach((r, idx) => {
    const status = r.passed
      ? `${colors.green}${colors.bold}✓ PASSED${colors.reset}`
      : `${colors.red}${colors.bold}✗ FAILED${colors.reset}`;
    console.log(`  ${idx + 1}. [${status}] ${colors.bold}${r.name.padEnd(30)}${colors.reset} (${r.duration}s)`);
    console.log(`     ${colors.yellow}↳ ${r.desc}${colors.reset}`);
  });

  console.log(`\n${colors.bold}${colors.cyan}──────────────────────────────────────────────────────────────────────${colors.reset}`);
  if (allPassed) {
    console.log(`${colors.bold}${colors.green}  🎉 100% PRODUCTION VERIFIED: ALL 6 SPECIALIZED SUITES PASSED!        ${colors.reset}`);
    console.log(`${colors.bold}${colors.green}  Tap-Bro is completely robust, secure, and human-tested.              ${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}──────────────────────────────────────────────────────────────────────\n${colors.reset}`);
    process.exit(0);
  } else {
    console.error(`${colors.bold}${colors.red}  ❌ QUALITY GATE FAILED: One or more test suites did not pass.        ${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}──────────────────────────────────────────────────────────────────────\n${colors.reset}`);
    process.exit(1);
  }
}

runMasterTestSuite();
