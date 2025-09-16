#!/bin/bash

# Quick test of GitHub authentication
echo "🔍 Testing GitHub Authentication"
echo "================================"

# Use the same credentials from your example
export GITHUB_USERNAME="vaibhavshrivastavait"
export GITHUB_EMAIL="vaibhavshrivastavait@gmail.com"
export GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"
export GITHUB_REPO="mht-assessment-android-app"
export GITHUB_FULLNAME="vaibhav shrivastava"

echo "Testing GitHub API with your token..."
echo ""

# Test the API call
auth_test=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user)

echo "API Response:"
echo "$auth_test"
echo ""

if echo "$auth_test" | grep -q "login"; then
    username=$(echo "$auth_test" | grep -o '"login":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Authentication successful for user: $username"
    
    if [[ "$username" != "$GITHUB_USERNAME" ]]; then
        echo "⚠️  Username mismatch: Token belongs to '$username' but you specified '$GITHUB_USERNAME'"
    else
        echo "✅ Username matches"
    fi
else
    echo "❌ Authentication failed or invalid response"
fi

echo ""
echo "Testing repository access..."
repo_test=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/vaibhavshrivastavait/mht-assessment-android-app")

if echo "$repo_test" | grep -q '"full_name"'; then
    echo "✅ Repository exists and is accessible"
elif echo "$repo_test" | grep -q "Not Found"; then
    echo "❌ Repository not found"
else
    echo "❓ Repository status unclear"
    echo "Response: $repo_test"
fi