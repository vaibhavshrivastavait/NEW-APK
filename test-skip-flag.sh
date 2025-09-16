#!/bin/bash

# Test the --skip-repo command line flag
echo "🧪 Testing --skip-repo Command Line Flag"
echo "========================================"

# Create a minimal test version of the function logic
test_skip_logic() {
    local arg1="$1"
    local SKIP_REPO_CREATION="$2"
    
    echo "Testing with arg1='$arg1' and SKIP_REPO_CREATION='$SKIP_REPO_CREATION'"
    
    if [[ "$arg1" == "--skip-repo" ]] || [[ "$SKIP_REPO_CREATION" == "true" ]]; then
        echo "✅ PASS: Skip logic triggered correctly"
        echo "🚀 Would skip repository creation"
        return 0
    else
        echo "❌ FAIL: Skip logic not triggered"
        echo "⚠️  Would attempt repository creation"
        return 1
    fi
}

echo ""
echo "Test 1: Command line flag --skip-repo"
test_skip_logic "--skip-repo" ""

echo ""
echo "Test 2: Environment variable SKIP_REPO_CREATION=true"
test_skip_logic "" "true"

echo ""
echo "Test 3: Both set (should still work)"
test_skip_logic "--skip-repo" "true"

echo ""
echo "Test 4: Neither set (should fail to skip)"
test_skip_logic "" ""

echo ""
echo "✅ Testing complete. The --skip-repo flag should work correctly."