#!/bin/bash

# AWS Deployment Verification Script
# Verifies all AWS resources are deployed and accessible

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔍 Verifying AWS Deployment Status..."
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &>/dev/null; then
    echo -e "${RED}❌ AWS CLI not configured or credentials invalid${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configured${NC}"
echo ""

# Get AWS account info
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="${AWS_REGION:-us-east-1}"

echo "📋 AWS Account: $ACCOUNT_ID"
echo "📋 Region: $REGION"
echo ""

# Function to check resource exists
check_resource() {
    local resource_type=$1
    local resource_name=$2
    local check_command=$3
    
    if eval "$check_command" &>/dev/null; then
        echo -e "${GREEN}✅ $resource_type: $resource_name${NC}"
        return 0
    else
        echo -e "${RED}❌ $resource_type: $resource_name (NOT FOUND)${NC}"
        return 1
    fi
}

# Check Pulumi stack
echo "🔍 Checking Pulumi Stack..."
cd "$(dirname "$0")/../infrastructure/pulumi"

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Pulumi venv not found. Skipping stack checks.${NC}"
else
    source venv/bin/activate 2>/dev/null || true
    
    if pulumi stack ls &>/dev/null; then
        STACK_NAME=$(pulumi stack --show-name 2>/dev/null || echo "production")
        echo -e "${GREEN}✅ Pulumi stack: $STACK_NAME${NC}"
        
        # Get outputs if available
        if pulumi stack output &>/dev/null; then
            echo ""
            echo "📊 Stack Outputs:"
            pulumi stack output 2>/dev/null || echo "  (Unable to read outputs)"
        fi
    else
        echo -e "${YELLOW}⚠️  Pulumi not initialized or no stack selected${NC}"
    fi
    
    deactivate 2>/dev/null || true
fi

cd - > /dev/null
echo ""

# Check CloudFront Distributions
echo "🔍 Checking CloudFront Distributions..."
DISTRIBUTIONS=$(aws cloudfront list-distributions --query "DistributionList.Items[*].[Id,DomainName,Status]" --output text 2>/dev/null || echo "")

if [ -n "$DISTRIBUTIONS" ]; then
    echo "$DISTRIBUTIONS" | while read -r id domain status; do
        if [ "$status" = "Deployed" ]; then
            # Test if accessible
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$domain" 2>&1 || echo "000")
            if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "404" ]; then
                echo -e "${GREEN}✅ CloudFront: $domain (ID: $id) - Accessible (HTTP $HTTP_CODE)${NC}"
            else
                echo -e "${YELLOW}⚠️  CloudFront: $domain (ID: $id) - Status: $status (HTTP $HTTP_CODE)${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  CloudFront: $domain (ID: $id) - Status: $status${NC}"
        fi
    done
else
    echo -e "${RED}❌ No CloudFront distributions found${NC}"
fi
echo ""

# Check S3 Buckets
echo "🔍 Checking S3 Buckets..."
BUCKETS=$(aws s3 ls | grep -i "learning\|fibonacco" || echo "")

if [ -n "$BUCKETS" ]; then
    echo "$BUCKETS" | while read -r date time size bucket; do
        if aws s3api head-bucket --bucket "$bucket" &>/dev/null; then
            echo -e "${GREEN}✅ S3 Bucket: $bucket${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️  No S3 buckets found with 'learning' or 'fibonacco' in name${NC}"
fi
echo ""

# Check ECS Clusters
echo "🔍 Checking ECS Clusters..."
CLUSTERS=$(aws ecs list-clusters --query "clusterArns[*]" --output text 2>/dev/null || echo "")

if [ -n "$CLUSTERS" ]; then
    for cluster in $CLUSTERS; do
        CLUSTER_NAME=$(echo "$cluster" | awk -F'/' '{print $NF}')
        if [[ "$CLUSTER_NAME" == *"learning"* ]] || [[ "$CLUSTER_NAME" == *"center"* ]]; then
            STATUS=$(aws ecs describe-clusters --clusters "$CLUSTER_NAME" --query "clusters[0].status" --output text 2>/dev/null || echo "UNKNOWN")
            echo -e "${GREEN}✅ ECS Cluster: $CLUSTER_NAME (Status: $STATUS)${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️  No ECS clusters found${NC}"
fi
echo ""

# Check RDS Clusters
echo "🔍 Checking RDS Clusters..."
RDS_CLUSTERS=$(aws rds describe-db-clusters --query "DBClusters[*].[DBClusterIdentifier,Endpoint,Status]" --output text 2>/dev/null || echo "")

if [ -n "$RDS_CLUSTERS" ]; then
    echo "$RDS_CLUSTERS" | while read -r id endpoint status; do
        if [[ "$id" == *"learning"* ]] || [[ "$id" == *"center"* ]]; then
            echo -e "${GREEN}✅ RDS Cluster: $id - $endpoint (Status: $status)${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️  No RDS clusters found${NC}"
fi
echo ""

# Check ALB Load Balancers
echo "🔍 Checking Application Load Balancers..."
ALBS=$(aws elbv2 describe-load-balancers --query "LoadBalancers[*].[LoadBalancerName,DNSName,State.Code]" --output text 2>/dev/null || echo "")

if [ -n "$ALBS" ]; then
    echo "$ALBS" | while read -r name dns status; do
        if [[ "$name" == *"learning"* ]] || [[ "$name" == *"center"* ]]; then
            if [ "$status" = "active" ]; then
                # Test if accessible
                HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$dns/health" 2>&1 || echo "000")
                echo -e "${GREEN}✅ ALB: $name - $dns (Status: $status, Health: HTTP $HTTP_CODE)${NC}"
            else
                echo -e "${YELLOW}⚠️  ALB: $name - $dns (Status: $status)${NC}"
            fi
        fi
    done
else
    echo -e "${YELLOW}⚠️  No ALBs found${NC}"
fi
echo ""

# Check ElastiCache Redis
echo "🔍 Checking ElastiCache Clusters..."
REDIS_CLUSTERS=$(aws elasticache describe-cache-clusters --show-cache-node-info --query "CacheClusters[*].[CacheClusterId,ConfigurationEndpoint.Address,Status]" --output text 2>/dev/null || echo "")

if [ -n "$REDIS_CLUSTERS" ]; then
    echo "$REDIS_CLUSTERS" | while read -r id endpoint status; do
        if [[ "$id" == *"learning"* ]] || [[ "$id" == *"center"* ]] || [[ "$id" == *"redis"* ]]; then
            echo -e "${GREEN}✅ ElastiCache: $id - $endpoint (Status: $status)${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️  No ElastiCache clusters found${NC}"
fi
echo ""

# Check Route53 Hosted Zones (if any)
echo "🔍 Checking Route53 Hosted Zones..."
ZONES=$(aws route53 list-hosted-zones --query "HostedZones[*].[Name,Id]" --output text 2>/dev/null || echo "")

if [ -n "$ZONES" ]; then
    echo "$ZONES" | while read -r name id; do
        echo -e "${GREEN}✅ Route53 Zone: $name (ID: $id)${NC}"
    done
else
    echo -e "${YELLOW}⚠️  No Route53 hosted zones found${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Verification Complete"
echo ""
echo "💡 Next Steps:"
echo "   1. Review any missing resources above"
echo "   2. Check DNS/SSL setup if custom domain needed"
echo "   3. Verify all services are accessible"
echo ""
