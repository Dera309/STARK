#!/usr/bin/env node

/**
 * Environment Variable Validation Script for STARK Application
 * This script validates that all required environment variables are set
 */

const REQUIRED_VARS = [
  'PORT',
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'CLIENT_URL'
];

const OPTIONAL_VARS = [
  'VITE_API_URL',
  'VITE_SOCKET_URL',
  'VITE_TAWK_PROPERTY_ID',
  'VITE_TAWK_WIDGET_ID'
];

const PLACEHOLDER_PATTERNS = [
  /your-/,
  /example\.com/,
  /placeholder/,
  /_here$/
];

let errors = 0;
let warnings = 0;

function checkVariable(name, isRequired = true) {
  const value = process.env[name];

  if (!value) {
    if (isRequired) {
      console.error(`✗ ${name} is not set (REQUIRED)`);
      errors++;
    } else {
      console.warn(`⚠  ${name} is not set (OPTIONAL)`);
      warnings++;
    }
    return false;
  }

  // Check if it's a placeholder value
  const isPlaceholder = PLACEHOLDER_PATTERNS.some(pattern => pattern.test(value));
  if (isPlaceholder) {
    console.warn(`⚠  ${name} is set but appears to be a placeholder: ${value}`);
    if (isRequired) {
      errors++;
    } else {
      warnings++;
    }
    return false;
  }

  console.log(`✓ ${name} is set`);
  return true;
}

function checkSecurity() {
  console.log('\nPerforming Security Checks:');

  // Check JWT secret strength
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    if (jwtSecret.length < 32) {
      console.error('✗ JWT_SECRET is too short (minimum 32 characters)');
      errors++;
    } else {
      console.log('✓ JWT_SECRET is sufficiently long');
    }
  }

  // Check if NODE_ENV is production
  if (process.env.NODE_ENV === 'production') {
    console.log('✓ NODE_ENV is set to production');
  } else {
    console.warn('⚠  NODE_ENV is not set to production');
    warnings++;
  }

  // Check if using HTTPS URLs in production
  if (process.env.NODE_ENV === 'production') {
    const apiUrl = process.env.VITE_API_URL || '';
    const socketUrl = process.env.VITE_SOCKET_URL || '';
    const clientUrl = process.env.CLIENT_URL || '';

    if (!apiUrl.startsWith('https://')) {
      console.error('✗ VITE_API_URL should use HTTPS in production');
      errors++;
    }
    if (!socketUrl.startsWith('https://') && !socketUrl.startsWith('wss://')) {
      console.error('✗ VITE_SOCKET_URL should use HTTPS/WSS in production');
      errors++;
    }
    if (!clientUrl.startsWith('https://')) {
      console.error('✗ CLIENT_URL should use HTTPS in production');
      errors++;
    }
  }
}

function main() {
  console.log('Validating environment variables...\n');

  console.log('Checking Server Environment Variables:');
  REQUIRED_VARS.forEach(varName => checkVariable(varName, true));

  console.log('\nChecking Client Environment Variables:');
  OPTIONAL_VARS.forEach(varName => checkVariable(varName, false));

  checkSecurity();

  console.log('\n================================');
  if (errors === 0 && warnings === 0) {
    console.log('✓ All environment variables are properly configured!');
    process.exit(0);
  } else if (errors === 0) {
    console.warn(`⚠  Found ${warnings} warning(s). Review before deploying.`);
    process.exit(0);
  } else {
    console.error(`✗ Found ${errors} error(s) and ${warnings} warning(s). Please fix before deploying.`);
    process.exit(1);
  }
}

main();
