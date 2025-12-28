# 🌐 DNS and SSL/TLS Setup Guide
## Complete Guide for Custom Domain Configuration

**Platform:** AWS (CloudFront + ALB)  
**Date:** December 25, 2024  
**Status:** Ready for DNS/SSL Setup

---

## 📋 Overview

This guide covers:
1. **DNS Configuration** - Setting up Route53 hosted zones and DNS records
2. **SSL/TLS Certificates** - Using AWS Certificate Manager (ACM)
3. **CloudFront SSL** - Configuring HTTPS for frontend
4. **ALB SSL** - Configuring HTTPS for backend API
5. **Domain Verification** - Testing and verification steps

---

## ✅ Prerequisites

### 1. Domain Name Registered
- You need a registered domain name (e.g., `fibonacco.com`)
- Domain can be registered with:
  - Route53
  - GoDaddy
  - Namecheap
  - Any registrar

### 2. AWS Resources Deployed
Based on `AWS_DEPLOYMENT_COMPLETE.md`, you should have:
- ✅ CloudFront Distribution: `d17tsimpjd0rti.cloudfront.net` (or similar)
- ✅ Application Load Balancer: `learning-center-alb-*.us-east-1.elb.amazonaws.com`
- ✅ S3 Bucket for frontend
- ✅ All other infrastructure deployed

### 3. AWS CLI Access
```bash
aws sts get-caller-identity  # Verify access
```

---

## 🎯 Step 1: Verify Current Deployment

Run the verification script:

```bash
./scripts/verify-aws-deployment.sh
```

This will show:
- All CloudFront distributions
- All S3 buckets
- All ECS clusters
- All RDS clusters
- All ALBs
- Current Route53 zones (if any)

**Note Current URLs:**
- Frontend: `https://[your-cloudfront-id].cloudfront.net`
- Backend: `http://[your-alb-name].us-east-1.elb.amazonaws.com`

---

## 🔐 Step 2: Request SSL Certificates (ACM)

SSL certificates **MUST** be created in **us-east-1** region to work with CloudFront.

### For Frontend (CloudFront)

```bash
# Set your domain
DOMAIN="learning.fibonacco.com"  # Change to your domain
WWW_DOMAIN="www.learning.fibonacco.com"  # Optional: www subdomain

# Request certificate in us-east-1
aws acm request-certificate \
  --domain-name "$DOMAIN" \
  --subject-alternative-names "$WWW_DOMAIN" \
  --validation-method DNS \
  --region us-east-1 \
  --output text \
  --query CertificateArn
```

**Save the Certificate ARN** (e.g., `arn:aws:acm:us-east-1:123456789:certificate/abcd-1234`)

### For Backend API (ALB)

```bash
# Set your API domain
API_DOMAIN="api.fibonacco.com"  # Change to your API domain

# Request certificate in us-east-1 (same region as ALB)
aws acm request-certificate \
  --domain-name "$API_DOMAIN" \
  --validation-method DNS \
  --region us-east-1 \
  --output text \
  --query CertificateArn
```

**Save the API Certificate ARN**

### Get Certificate Validation Records

After requesting certificates, you need to add DNS validation records:

```bash
# Get validation records for frontend certificate
CERT_ARN="arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"  # Replace with your ARN

aws acm describe-certificate \
  --certificate-arn "$CERT_ARN" \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[*].[DomainName,ResourceRecord.Name,ResourceRecord.Value]' \
  --output table
```

**Save these validation records** - you'll add them to Route53 in Step 3.

---

## 🗺️ Step 3: Setup Route53 Hosted Zone

### Option A: Create New Hosted Zone

If you don't have a Route53 hosted zone:

```bash
# Set your domain
DOMAIN="fibonacco.com"  # Your root domain

# Create hosted zone
ZONE_ID=$(aws route53 create-hosted-zone \
  --name "$DOMAIN" \
  --caller-reference "$(date +%s)" \
  --query 'HostedZone.Id' \
  --output text | cut -d'/' -f3)

echo "Hosted Zone ID: $ZONE_ID"

# Get nameservers
aws route53 get-hosted-zone \
  --id "$ZONE_ID" \
  --query 'DelegationSet.NameServers' \
  --output table
```

**⚠️ IMPORTANT:** Update your domain registrar with these nameservers!

### Option B: Use Existing Hosted Zone

If you already have a hosted zone:

```bash
# List existing zones
aws route53 list-hosted-zones --query 'HostedZones[*].[Name,Id]' --output table

# Get zone ID
ZONE_ID="Z1234567890ABC"  # Replace with your zone ID
DOMAIN="fibonacco.com"     # Your domain name
```

---

## 📝 Step 4: Add DNS Validation Records

Add the ACM certificate validation records to Route53:

```bash
# Set variables
ZONE_ID="Z1234567890ABC"  # Your hosted zone ID
VALIDATION_NAME="_abc123.learning.fibonacco.com"  # From Step 2
VALIDATION_VALUE="abc123.acm-validations.aws."     # From Step 2

# Create validation record
aws route53 change-resource-record-sets \
  --hosted-zone-id "$ZONE_ID" \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "'"$VALIDATION_NAME"'",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "'"$VALIDATION_VALUE"'"}]
      }
    }]
  }'
```

**Repeat for all validation records** (if you requested multiple domains).

### Wait for Certificate Validation

Certificates can take 5-30 minutes to validate:

```bash
CERT_ARN="arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"

# Check status
aws acm describe-certificate \
  --certificate-arn "$CERT_ARN" \
  --region us-east-1 \
  --query 'Certificate.Status' \
  --output text

# Status should be "ISSUED" when ready
```

---

## 🌐 Step 5: Configure CloudFront with Custom Domain

### Update CloudFront Distribution

You need to update the CloudFront distribution to use your custom domain and certificate.

**Option 1: Update via Pulumi (Recommended)**

Create or update `infrastructure/pulumi/infrastructure/cloudfront.py`:

```python
# Add to cloudfront.py
viewer_certificate=aws.cloudfront.DistributionViewerCertificateArgs(
    acm_certificate_arn=certificate_arn,  # Your ACM certificate ARN
    ssl_support_method="sni-only",
    minimum_protocol_version="TLSv1.2_2021",
),
aliases=[domain_name],  # ["learning.fibonacco.com"]
```

**Option 2: Update via AWS CLI**

```bash
# Get distribution ID
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='CloudFront distribution for learning-center'].Id" \
  --output text)

# Get current config
aws cloudfront get-distribution-config --id "$DIST_ID" > dist-config.json

# Edit dist-config.json to add:
# - Aliases: ["learning.fibonacco.com"]
# - ViewerCertificate: ACM certificate ARN

# Update distribution (you'll get an ETag, use it in next command)
ETAG=$(aws cloudfront get-distribution-config --id "$DIST_ID" --query 'ETag' --output text)

aws cloudfront update-distribution \
  --id "$DIST_ID" \
  --distribution-config file://dist-config.json \
  --if-match "$ETAG"
```

**Note:** CloudFront updates can take 15-30 minutes to deploy.

### Add CloudFront Alias Record to Route53

```bash
# Get CloudFront distribution domain
CLOUDFRONT_DOMAIN="d17tsimpjd0rti.cloudfront.net"  # Your CloudFront domain
DOMAIN="learning.fibonacco.com"  # Your custom domain
ZONE_ID="Z1234567890ABC"  # Your hosted zone ID

# Create alias record
aws route53 change-resource-record-sets \
  --hosted-zone-id "$ZONE_ID" \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "'"$DOMAIN"'",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "'"$CLOUDFRONT_DOMAIN"'",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

**For www subdomain (optional):**

```bash
# Add AAAA record for IPv6
aws route53 change-resource-record-sets \
  --hosted-zone-id "$ZONE_ID" \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "'"$DOMAIN"'",
        "Type": "AAAA",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "'"$CLOUDFRONT_DOMAIN"'",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

---

## 🔒 Step 6: Configure ALB with SSL Certificate

### Update ALB Listener

```bash
# Get ALB ARN
ALB_ARN=$(aws elbv2 describe-load-balancers \
  --query "LoadBalancers[?LoadBalancerName | contains(@, 'learning')].LoadBalancerArn" \
  --output text)

# Get listener ARN (usually for port 80)
LISTENER_ARN=$(aws elbv2 describe-listeners \
  --load-balancer-arn "$ALB_ARN" \
  --query 'Listeners[?Port==`80`].ListenerArn' \
  --output text)

# Add HTTPS listener (port 443)
API_CERT_ARN="arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/API_CERT_ID"  # Your API cert ARN

aws elbv2 create-listener \
  --load-balancer-arn "$ALB_ARN" \
  --protocol HTTPS \
  --port 443 \
  --certificates "CertificateArn=$API_CERT_ARN" \
  --default-actions "Type=forward,TargetGroupArn=$(aws elbv2 describe-target-groups --load-balancer-arn "$ALB_ARN" --query 'TargetGroups[0].TargetGroupArn' --output text)"
```

### Redirect HTTP to HTTPS (Optional but Recommended)

```bash
# Create redirect action
aws elbv2 modify-listener \
  --listener-arn "$LISTENER_ARN" \
  --default-actions "Type=redirect,RedirectConfig={Protocol=HTTPS,Port=443,StatusCode=HTTP_301}"
```

### Add ALB Alias Record to Route53

```bash
# Get ALB DNS name and hosted zone ID
ALB_DNS="learning-center-alb-1406182433.us-east-1.elb.amazonaws.com"
ALB_ZONE_ID="Z35SXDOTRQ7X7K"  # ALB hosted zone ID (us-east-1)
API_DOMAIN="api.fibonacco.com"  # Your API domain
ZONE_ID="Z1234567890ABC"  # Your Route53 hosted zone ID

# Create alias record
aws route53 change-resource-record-sets \
  --hosted-zone-id "$ZONE_ID" \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "'"$API_DOMAIN"'",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "'"$ALB_ZONE_ID"'",
          "DNSName": "'"$ALB_DNS"'",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'
```

---

## ✅ Step 7: Verify DNS and SSL

### Test DNS Resolution

```bash
# Test frontend domain
dig learning.fibonacco.com +short

# Test API domain
dig api.fibonacco.com +short

# Should return CloudFront/ALB IPs or CNAMEs
```

### Test SSL Certificate

```bash
# Test frontend HTTPS
curl -I https://learning.fibonacco.com

# Test API HTTPS
curl -I https://api.fibonacco.com/health

# Check certificate details
openssl s_client -connect learning.fibonacco.com:443 -servername learning.fibonacco.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

### Test in Browser

1. Open `https://learning.fibonacco.com` - should show valid SSL certificate
2. Open `https://api.fibonacco.com/health` - should show valid SSL certificate
3. Check browser shows "Secure" with valid certificate

---

## 🔧 Step 8: Update Frontend API Configuration

Update your frontend to use the new API domain:

**In `src/services/learning/api-client.ts` or similar:**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.fibonacco.com';
```

**In `.env` or `.env.production`:**

```bash
VITE_API_URL=https://api.fibonacco.com
```

Rebuild and redeploy frontend:

```bash
npm run build
aws s3 sync dist/ s3://[your-s3-bucket] --delete
aws cloudfront create-invalidation --distribution-id [DIST_ID] --paths "/*"
```

---

## 📋 Quick Reference: ALB Hosted Zone IDs

Use these hosted zone IDs for ALB alias records:

| Region | Hosted Zone ID |
|--------|----------------|
| us-east-1 | Z35SXDOTRQ7X7K |
| us-west-1 | Z368ELLRDU2K6J |
| us-west-2 | Z1H1FL5HABSF5 |
| eu-west-1 | Z32O12XQLNTSW2 |
| eu-west-2 | ZHURV8PSTC4K8 |
| ap-southeast-1 | Z1LMS91P8CMLE5 |

**CloudFront Hosted Zone ID (all regions):** `Z2FDTNDATAQYW2`

---

## 🐛 Troubleshooting

### Certificate Not Validating

1. **Check DNS records are correct:**
   ```bash
   dig _abc123.learning.fibonacco.com CNAME
   ```

2. **Wait longer** - validation can take up to 30 minutes

3. **Check certificate status:**
   ```bash
   aws acm describe-certificate --certificate-arn "$CERT_ARN" --region us-east-1
   ```

### DNS Not Resolving

1. **Check nameservers are updated** at domain registrar
2. **Wait for DNS propagation** (can take 24-48 hours, usually < 1 hour)
3. **Check Route53 records:**
   ```bash
   aws route53 list-resource-record-sets --hosted-zone-id "$ZONE_ID"
   ```

### CloudFront Not Updating

1. **Wait for deployment** - CloudFront updates take 15-30 minutes
2. **Check distribution status:**
   ```bash
   aws cloudfront get-distribution --id "$DIST_ID" --query 'Distribution.Status'
   ```

### SSL Certificate Errors

1. **Verify certificate is in correct region** (us-east-1 for CloudFront)
2. **Check certificate is attached to CloudFront/ALB**
3. **Verify domain matches certificate domain exactly**

---

## 📊 Deployment Checklist

- [ ] Domain registered
- [ ] Route53 hosted zone created
- [ ] Nameservers updated at registrar
- [ ] ACM certificates requested (us-east-1)
- [ ] DNS validation records added
- [ ] Certificates validated (Status: ISSUED)
- [ ] CloudFront distribution updated with certificate and alias
- [ ] CloudFront DNS alias record added to Route53
- [ ] ALB HTTPS listener created with certificate
- [ ] ALB DNS alias record added to Route53
- [ ] DNS propagation verified
- [ ] SSL certificates verified in browser
- [ ] Frontend API URL updated
- [ ] Frontend rebuilt and redeployed
- [ ] All endpoints tested

---

## 🎯 Example: Complete Setup for `learning.fibonacco.com`

```bash
#!/bin/bash
# Complete DNS/SSL setup script

DOMAIN="learning.fibonacco.com"
API_DOMAIN="api.fibonacco.com"
ROOT_DOMAIN="fibonacco.com"
REGION="us-east-1"

# 1. Request certificates
FRONTEND_CERT=$(aws acm request-certificate \
  --domain-name "$DOMAIN" \
  --validation-method DNS \
  --region "$REGION" \
  --query CertificateArn --output text)

API_CERT=$(aws acm request-certificate \
  --domain-name "$API_DOMAIN" \
  --validation-method DNS \
  --region "$REGION" \
  --query CertificateArn --output text)

# 2. Get hosted zone (assumes exists)
ZONE_ID=$(aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='$ROOT_DOMAIN.'].Id" \
  --output text | cut -d'/' -f3)

# 3. Get validation records and add to Route53
# (See Step 4 above for details)

# 4. Update CloudFront (via Pulumi or AWS Console)

# 5. Update ALB listener (see Step 6)

# 6. Add DNS records (see Steps 5 and 6)

echo "Setup complete! Wait for DNS propagation."
```

---

## 📝 Next Steps

1. **Verify deployment** using `./scripts/verify-aws-deployment.sh`
2. **Request certificates** in us-east-1
3. **Create/use Route53 hosted zone**
4. **Add validation records** and wait for validation
5. **Update CloudFront and ALB** with certificates
6. **Add DNS alias records** to Route53
7. **Update frontend configuration**
8. **Test and verify** all endpoints

---

**Status:** ✅ Guide Complete - Ready for DNS/SSL Setup
