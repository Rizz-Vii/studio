#!/bin/bash

# 🔥 RankPilot Firestore Index Creation Script
# Fixes missing composite indexes for production deployment

echo "🔥 Creating missing Firestore indexes for RankPilot..."

# Set Firebase project
firebase use rankpilot-h3jpc

echo "📊 Creating composite index for neuroSeoAnalyses collection..."
echo "Fields: status (ascending), userId (ascending), completedAt (descending)"

# Note: Firebase CLI doesn't support creating composite indexes directly
# This would need to be done via Firebase Console or REST API

echo "🌐 Open Firebase Console to create composite index:"
echo "https://console.firebase.google.com/project/rankpilot-h3jpc/firestore/indexes"

echo ""
echo "📋 Index Configuration:"
echo "Collection ID: neuroSeoAnalyses"
echo "Fields:"
echo "  - status: Ascending"
echo "  - userId: Ascending"  
echo "  - completedAt: Descending"
echo "  - __name__: Ascending (auto-added)"

echo ""
echo "⚡ Or use this direct link:"
echo "https://console.firebase.google.com/v1/r/project/rankpilot-h3jpc/firestore/indexes?create_composite=Clhwcm9qZWN0cy9yYW5rcGlsb3QtaDNqcGMvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL25ldXJvU2VvQW5hbHlzZXMvaW5kZXhlcy9fEAEaCgoGc3RhdHVzEAEaCgoGdXNlcklkEAEaDwoLY29tcGxldGVkQXQQAhoMCghfX25hbWVfXxAC"

echo ""
echo "✅ After creating the index, dashboard queries will work properly"
echo "⏱️  Index creation typically takes 1-5 minutes"
