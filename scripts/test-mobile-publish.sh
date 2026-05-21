#!/usr/bin/env bash
# Smoke-test mobile publish API (same path as Expo `publishListingToApi`).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
for ENV_FILE in "$ROOT/../OMM_BACKEND/.env.local" "$ROOT/apps/web/.env.local"; do
  if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck source=/dev/null
    source "$ENV_FILE"
    set +a
  fi
done

API="${EXPO_PUBLIC_MOBILE_API_ORIGIN:-${EXPO_PUBLIC_API_URL:-http://127.0.0.1:3102}}"
API="${API%/}"

echo "→ POST $API/api/mobile/published-listings (no auth, expect 401 JSON)"
CODE=$(curl -s -o /tmp/omm-publish-noauth.json -w "%{http_code}" \
  -X POST "$API/api/mobile/published-listings" \
  -H "Content-Type: application/json" \
  -d '{}')
echo "  HTTP $CODE — $(head -c 120 /tmp/omm-publish-noauth.json)"
if head -c 20 /tmp/omm-publish-noauth.json | grep -q '<!DOCTYPE'; then
  echo "  FAIL: HTML response (restart npm run dev after latest fixes)"
  exit 1
fi

if [[ -z "${DEV_MOBILE_BYPASS_USER_ID:-}" ]]; then
  echo ""
  echo "Skipping authenticated publish (set in OMM_BACKEND/.env.local):"
  echo "  DEV_MOBILE_BYPASS_USER_ID=user_dev_mobile_test"
  echo "Also need Postgres on DATABASE_URL and: npm run dev"
  exit 0
fi

echo ""
echo "→ POST with Bearer dev-bypass (dev-only, NODE_ENV=development)"
BODY=$(cat <<'EOF'
{
  "details": {
    "address": "1350 Brooke Street, Melbourne",
    "propertyType": "House",
    "bedrooms": "4",
    "bathrooms": "2",
    "carSpaces": "2",
    "landAreaSize": "650"
  },
  "listingPriceFromAud": 802222,
  "listingPriceToAud": 902121,
  "addressDisclosure": "disclose",
  "sellerInspectionAvailability": "By appointment",
  "status": "LIVE"
}
EOF
)
CODE=$(curl -s -o /tmp/omm-publish-auth.json -w "%{http_code}" \
  -X POST "$API/api/mobile/published-listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-bypass" \
  -d "$BODY")
echo "  HTTP $CODE"
cat /tmp/omm-publish-auth.json | head -c 500
echo ""

if [[ "$CODE" == "200" ]] || [[ "$CODE" == "201" ]]; then
  echo "  OK: listing published to Postgres"
  exit 0
fi
if head -c 20 /tmp/omm-publish-auth.json | grep -q '<!DOCTYPE'; then
  echo "  FAIL: HTML error page"
  exit 1
fi
echo "  Check response above (503 = Postgres down; 424 = add CLERK_SECRET_KEY for real app sign-in)"
exit 1
