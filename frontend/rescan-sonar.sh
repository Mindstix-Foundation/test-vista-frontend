#!/bin/bash

# Run SonarQube scan with token
sonar -Dsonar.host.url=http://localhost:9000 -Dsonar.token=sqp_14301f0ff325dcbf3dfd3e535cd177c2a870814a

echo "Scan complete. View results at http://localhost:9000/dashboard?id=test-vista-fe" 