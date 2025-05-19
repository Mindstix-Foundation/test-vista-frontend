#!/bin/bash

# Instructions:
# 1. Open SonarQube in your browser at http://localhost:9000
# 2. Log in with your credentials
# 3. Generate a token:
#    - Go to My Account > Security > Generate Tokens
#    - Name it something like "test-vista-scan"
#    - Click Generate
#    - Copy the generated token
# 4. Run this script with:
#    ./run-sonar-scan.sh YOUR_TOKEN

if [ -z "$1" ]; then
  echo "Error: No token provided"
  echo "Usage: ./run-sonar-scan.sh YOUR_SONAR_TOKEN"
  exit 1
fi

TOKEN=$1

echo "Running SonarQube scan with provided token..."
npx sonar-scanner -Dsonar.token=$TOKEN

echo "Scan complete. View results at http://localhost:9000/dashboard?id=test-vista-fe" 