#!/bin/bash

echo "Running TypeScript type check..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "TypeScript check failed. Please fix the errors before committing."
  exit 1
fi

echo "TypeScript check passed!"

echo "Running ESLint check..."
npx eslint .
if [ $? -ne 0 ]; then
  echo "ESLint check failed. Please fix the errors before committing."
  exit 1
fi

echo "ESLint check passed!"
exit 0
