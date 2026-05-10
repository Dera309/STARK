#!/bin/bash

# Environment Variable Validation Script for STARK Application
# This script validates that all required environment variables are set

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

echo "Validating environment variables..."

# Function to check if variable is set and not empty
check_var() {
  local var_name=$1
  local var_value=${!var_name}
  local is_required=$2

  if [ -z "$var_value" ]; then
    if [ "$is_required" = "required" ]; then
      echo -e "${RED}✗${NC} $var_name is not set (REQUIRED)"
      ERRORS=$((ERRORS + 1))
    else
      echo -e "${YELLOW}⚠${NC}  $var_name is not set (OPTIONAL)"
    fi
  else
    # Check if it's a placeholder value
    if [[ "$var_value" =~ (your-|example\.com|placeholder) ]]; then
      echo -e "${YELLOW}⚠${NC}  $var_name is set but appears to be a placeholder"
      if [ "$is_required" = "required" ]; then
        ERRORS=$((ERRORS + 1))
      fi
    else
      echo -e "${GREEN}✓${NC} $var_name is set"
    fi
  fi
}

# Server variables
echo ""
echo "Checking Server Environment Variables:"
check_var "PORT" "required"
check_var "NODE_ENV" "required"
check_var "MONGODB_URI" "required"
check_var "JWT_SECRET" "required"
check_var "JWT_EXPIRES_IN" "required"
check_var "EMAIL_HOST" "required"
check_var "EMAIL_PORT" "required"
check_var "EMAIL_USER" "required"
check_var "EMAIL_PASS" "required"
check_var "CLIENT_URL" "required"

# Client variables (if checking client)
if [ "$CHECK_CLIENT" = "true" ]; then
  echo ""
  echo "Checking Client Environment Variables:"
  check_var "VITE_API_URL" "required"
  check_var "VITE_SOCKET_URL" "required"
  check_var "VITE_TAWK_PROPERTY_ID" "optional"
  check_var "VITE_TAWK_WIDGET_ID" "optional"
fi

# Security checks
echo ""
echo "Performing Security Checks:"

# Check JWT secret strength
if [ ! -z "$JWT_SECRET" ]; then
  if [ ${#JWT_SECRET} -lt 32 ]; then
    echo -e "${RED}✗${NC} JWT_SECRET is too short (minimum 32 characters)"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}✓${NC} JWT_SECRET is sufficiently long"
  fi
fi

# Check if NODE_ENV is production
if [ "$NODE_ENV" = "production" ]; then
  echo -e "${GREEN}✓${NC} NODE_ENV is set to production"
else
  echo -e "${YELLOW}⚠${NC}  NODE_ENV is not set to production"
fi

# Summary
echo ""
echo "================================"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}All required environment variables are properly configured!${NC}"
  exit 0
else
  echo -e "${RED}Found $ERRORS error(s). Please fix before deploying to production.${NC}"
  exit 1
fi
