#!/bin/bash

# Pre-Deployment Verification Script for STARK Application
# This script performs all necessary checks before deployment

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

echo "================================"
echo "STARK Pre-Deployment Verification"
echo "================================"
echo ""

# Function to print check result
print_result() {
  local status=$1
  local message=$2
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  
  if [ "$status" = "pass" ]; then
    echo -e "${GREEN}✓${NC} $message"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
  elif [ "$status" = "fail" ]; then
    echo -e "${RED}✗${NC} $message"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
  else
    echo -e "${YELLOW}⚠${NC}  $message"
    WARNINGS=$((WARNINGS + 1))
  fi
}

# 1. Environment Variables Check
echo "1. Checking Environment Variables..."
echo "-----------------------------------"

if [ -f "server/.env" ]; then
  print_result "pass" "Server .env file exists"
  
  # Check for required variables
  if grep -q "MONGODB_URI=" server/.env; then
    print_result "pass" "MONGODB_URI is set"
  else
    print_result "fail" "MONGODB_URI is not set"
  fi
  
  if grep -q "JWT_SECRET=" server/.env; then
    JWT_SECRET=$(grep "JWT_SECRET=" server/.env | cut -d '=' -f2)
    if [ ${#JWT_SECRET} -ge 32 ]; then
      print_result "pass" "JWT_SECRET is sufficiently long"
    else
      print_result "fail" "JWT_SECRET is too short (min 32 chars)"
    fi
  else
    print_result "fail" "JWT_SECRET is not set"
  fi
else
  print_result "fail" "Server .env file does not exist"
fi

if [ -f "client/.env" ]; then
  print_result "pass" "Client .env file exists"
  
  if grep -q "VITE_API_URL=" client/.env; then
    print_result "pass" "VITE_API_URL is set"
  else
    print_result "fail" "VITE_API_URL is not set"
  fi
else
  print_result "fail" "Client .env file does not exist"
fi

echo ""

# 2. Build Verification
echo "2. Verifying Builds..."
echo "----------------------"

echo "Building server..."
if cd server && npm run build > /dev/null 2>&1; then
  print_result "pass" "Server builds successfully"
  cd ..
else
  print_result "fail" "Server build failed"
fi

echo "Building client..."
if cd client && npm run build > /dev/null 2>&1; then
  print_result "pass" "Client builds successfully"
  cd ..
else
  print_result "fail" "Client build failed"
fi

echo ""

# 3. Dependency Check
echo "3. Checking Dependencies..."
echo "-----------------------------"

echo "Running npm audit on server..."
cd server
if npm audit --audit-level=high > /dev/null 2>&1; then
  print_result "pass" "No high-severity vulnerabilities in server"
else
  print_result "warn" "Server has high-severity vulnerabilities (run npm audit)"
fi
cd ..

echo "Running npm audit on client..."
cd client
if npm audit --audit-level=high > /dev/null 2>&1; then
  print_result "pass" "No high-severity vulnerabilities in client"
else
  print_result "warn" "Client has high-severity vulnerabilities (run npm audit)"
fi
cd ..

echo ""

# 4. Code Quality Check
echo "4. Checking Code Quality..."
echo "---------------------------"

echo "Running TypeScript check on server..."
cd server
if npx tsc --noEmit > /dev/null 2>&1; then
  print_result "pass" "Server TypeScript compilation successful"
else
  print_result "fail" "Server TypeScript compilation failed"
fi
cd ..

echo "Running TypeScript check on client..."
cd client
if npx tsc --noEmit > /dev/null 2>&1; then
  print_result "pass" "Client TypeScript compilation successful"
else
  print_result "fail" "Client TypeScript compilation failed"
fi
cd ..

echo ""

# 5. Test Check
echo "5. Running Tests..."
echo "-------------------"

echo "Running server tests..."
cd server
if npm test > /dev/null 2>&1; then
  print_result "pass" "Server tests pass"
else
  print_result "warn" "Server tests not configured or failed"
fi
cd ..

echo "Running client tests..."
cd client
if npm test > /dev/null 2>&1; then
  print_result "pass" "Client tests pass"
else
  print_result "warn" "Client tests not configured or failed"
fi
cd ..

echo ""

# 6. Configuration Check
echo "6. Checking Configuration..."
echo "----------------------------"

if [ -f "server/.env" ]; then
  if grep -q "NODE_ENV=production" server/.env; then
    print_result "pass" "NODE_ENV is set to production"
  else
    print_result "warn" "NODE_ENV is not set to production"
  fi
  
  if grep -q "CLIENT_URL=" server/.env; then
    CLIENT_URL=$(grep "CLIENT_URL=" server/.env | cut -d '=' -f2)
    if [[ "$CLIENT_URL" == https://* ]]; then
      print_result "pass" "CLIENT_URL uses HTTPS"
    else
      print_result "warn" "CLIENT_URL should use HTTPS in production"
    fi
  fi
fi

echo ""

# 7. Security Check
echo "7. Security Checks..."
echo "--------------------"

# Check for hardcoded secrets
if grep -r "password\|secret\|api_key" server/src --include="*.ts" --include="*.js" | grep -v "node_modules" | grep -v "JWT_SECRET\|EMAIL_PASS\|MONGODB_URI" > /dev/null 2>&1; then
  print_result "warn" "Potential hardcoded secrets found (review manually)"
else
  print_result "pass" "No obvious hardcoded secrets found"
fi

# Check for .env in git
if git ls-files | grep -q "\.env"; then
  print_result "fail" ".env files are tracked in git (should be in .gitignore)"
else
  print_result "pass" ".env files are not tracked in git"
fi

echo ""

# 8. Infrastructure Check
echo "8. Infrastructure Checks..."
echo "---------------------------"

if command -v docker &> /dev/null; then
  print_result "pass" "Docker is installed"
else
  print_result "warn" "Docker is not installed (required for deployment)"
fi

if command -v docker-compose &> /dev/null; then
  print_result "pass" "Docker Compose is installed"
else
  print_result "warn" "Docker Compose is not installed (required for deployment)"
fi

echo ""

# 9. Documentation Check
echo "9. Documentation Checks..."
echo "--------------------------"

if [ -f "DEPLOYMENT.md" ]; then
  print_result "pass" "DEPLOYMENT.md exists"
else
  print_result "warn" "DEPLOYMENT.md not found"
fi

if [ -f "README.md" ]; then
  print_result "pass" "README.md exists"
else
  print_result "warn" "README.md not found"
fi

echo ""

# 10. Backup Check
echo "10. Backup Configuration..."
echo "---------------------------"

if [ -f "scripts/backup-mongodb.sh" ]; then
  print_result "pass" "Backup script exists"
  if [ -x "scripts/backup-mongodb.sh" ]; then
    print_result "pass" "Backup script is executable"
  else
    print_result "warn" "Backup script is not executable"
  fi
else
  print_result "warn" "Backup script not found"
fi

echo ""

# Summary
echo "================================"
echo "Summary"
echo "================================"
echo "Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
echo -e "${RED}Failed: $FAILED_CHECKS${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
  if [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready for deployment.${NC}"
    exit 0
  else
    echo -e "${YELLOW}⚠  All critical checks passed, but there are $WARNINGS warning(s).${NC}"
    echo "Review warnings before proceeding with deployment."
    exit 0
  fi
else
  echo -e "${RED}✗ $FAILED_CHECKS critical check(s) failed. Please fix before deploying.${NC}"
  exit 1
fi
