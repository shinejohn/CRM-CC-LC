#!/usr/bin/env bash
# PP→CC bulk business sync via offset-batched COPY piped directly PP→CC
# Avoids statement timeout by batching 50k rows at a time

set -e

PSQL=/opt/homebrew/bin/psql
PP="postgresql://postgres:***REMOVED***@trolley.proxy.rlwy.net:12043/railway"
CC="postgresql://postgres:***REMOVED***@trolley.proxy.rlwy.net:53826/railway"

BATCH=50000
TOTAL=385799

echo "=== PP→CC Bulk Business Sync (batched) ==="
echo "Started: $(date)"
echo "Total: $TOTAL | Batch size: $BATCH"

# Create staging table once
$PSQL "$CC" -c "DROP TABLE IF EXISTS _pp_biz_staging; CREATE UNLOGGED TABLE _pp_biz_staging (pp_id text, community_slug text, name text, email text, phone text, website text, address text, city text, state text, postal_code text, latitude text, longitude text, category text, rating text, reviews_count text, description text, google_place_id text, organization_type text, advertising_tier text);"

OFFSET=0
BATCH_NUM=0
while [ $OFFSET -lt $TOTAL ]; do
    BATCH_NUM=$((BATCH_NUM + 1))
    echo "[$(date +%H:%M:%S)] Batch $BATCH_NUM: rows $OFFSET–$((OFFSET + BATCH))..."
    $PSQL "$PP" -c "COPY (
        SELECT b.id::text, c.slug, b.name, b.email, b.phone, b.website,
               b.address, b.city, b.state, b.postal_code,
               b.latitude::text, b.longitude::text,
               COALESCE((b.categories::json->0)::text,'') AS category,
               b.rating::text, b.reviews_count::text, b.description,
               b.google_place_id, b.organization_type, b.advertising_tier
        FROM businesses b
        JOIN communities c ON c.id = b.community_id
        WHERE b.status = 'active' AND c.is_active = true AND b.email IS NOT NULL AND b.email <> ''
        ORDER BY b.id
        LIMIT $BATCH OFFSET $OFFSET
    ) TO STDOUT WITH (FORMAT CSV)" | $PSQL "$CC" -c "COPY _pp_biz_staging FROM STDIN WITH (FORMAT CSV)"
    OFFSET=$((OFFSET + BATCH))
done

echo ""
echo "Staging loaded. Upserting into customers..."
$PSQL "$CC" -c "SELECT COUNT(*) AS staged FROM _pp_biz_staging;"

$PSQL "$CC" -c "
INSERT INTO customers (
    id, tenant_id, community_id, external_id, slug,
    business_name, category, email, phone, website,
    address, city, state, zip, coordinates,
    google_rating, google_review_count, business_description,
    pipeline_stage, stage_entered_at, lead_source,
    email_opted_in, sms_opted_in, rvm_opted_in, phone_opted_in, do_not_contact,
    data_sources, metadata, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001'::uuid,
    comm.id,
    s.pp_id,
    lower(regexp_replace(s.name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(s.pp_id), 1, 6),
    COALESCE(s.name, 'Unknown'),
    NULLIF(trim(s.category, '\"'), ''),
    lower(trim(s.email)),
    s.phone, s.website, s.address, s.city, s.state, s.postal_code,
    CASE WHEN s.latitude IS NOT NULL AND s.latitude != '' AND s.longitude != ''
         THEN json_build_object('lat', s.latitude::numeric, 'lng', s.longitude::numeric)::text
         ELSE NULL END,
    CASE WHEN s.rating != '' THEN s.rating::numeric ELSE NULL END,
    CASE WHEN s.reviews_count != '' THEN s.reviews_count::integer ELSE NULL END,
    s.description, 'hook', NOW(), 'publishing_platform_sync',
    true, false, false, false, false,
    '[\"publishing_platform\"]',
    json_build_object('pp_business_id', s.pp_id, 'pp_google_place_id', s.google_place_id,
        'pp_organization_type', s.organization_type, 'pp_advertising_tier', s.advertising_tier,
        'pp_synced_at', NOW())::text,
    NOW(), NOW()
FROM _pp_biz_staging s
JOIN communities comm ON comm.slug = s.community_slug
ON CONFLICT (external_id) DO UPDATE SET
    business_name = EXCLUDED.business_name, category = EXCLUDED.category,
    email = EXCLUDED.email, phone = EXCLUDED.phone, website = EXCLUDED.website,
    address = EXCLUDED.address, city = EXCLUDED.city, state = EXCLUDED.state,
    zip = EXCLUDED.zip, coordinates = EXCLUDED.coordinates,
    google_rating = EXCLUDED.google_rating, google_review_count = EXCLUDED.google_review_count,
    business_description = EXCLUDED.business_description, metadata = EXCLUDED.metadata,
    updated_at = EXCLUDED.updated_at;
"

echo ""
echo "Verify:"
$PSQL "$CC" -c "SELECT COUNT(*) AS total_customers FROM customers;"
$PSQL "$CC" -c "DROP TABLE IF EXISTS _pp_biz_staging;"

echo "=== Done: $(date) ==="
