#!/bin/sh
# Git Pre-commit Hook - Siddhi Kabel Corp Safety Check
echo "Running pre-commit repository safety check..."

# 1. Block staged .env files
STAGED_ENV=$(git diff --cached --name-only | grep -E '(^|/)\.env(\..+)?$' | grep -v '\.env\.example$')
if [ -n "$STAGED_ENV" ]; then
  echo "\033[31m[SAFETY ERROR] Staged environment file detected:\033[0m"
  echo "$STAGED_ENV"
  echo "\033[31mCommit rejected to protect sensitive credentials. Unstage with 'git reset HEAD <file>'\033[0m"
  exit 1
fi

# 2. Block staged certificates and private keys
STAGED_CERTS=$(git diff --cached --name-only | grep -E '\.(pem|key|pfx|pkcs12)$')
if [ -n "$STAGED_CERTS" ]; then
  echo "\033[31m[SAFETY ERROR] Staged private key / certificate file detected:\033[0m"
  echo "$STAGED_CERTS"
  echo "\033[31mCommit rejected to protect secrets.\033[0m"
  exit 1
fi

# 3. Run node safety checker script
if command -v node >/dev/null 2>&1; then
  node scripts/check-safety.js
  STATUS=$?
  if [ $STATUS -ne 0 ]; then
    echo "\033[31m[SAFETY ERROR] Repository safety verification failed (exit code $STATUS). Commit aborted.\033[0m"
    exit 1
  fi
fi

exit 0
