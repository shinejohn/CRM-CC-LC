#!/bin/bash
export RAILWAY_TOKEN="c1f88e0c-4cde-4e12-b826-64d59c9b3444"
API_URL="https://backboard.railway.app/graphql/v2"

echo "Query 1: List Projects"
curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $RAILWAY_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"query": "query { projects { edges { node { id name } } } }"}'
echo ""
echo ""

echo "Query 2: List Environments"
curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $RAILWAY_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"query": "query { environments { edges { node { id name } } } }"}'
echo ""
echo ""

