# 🔍 AWS Resources Check - Results

## ❌ Cannot Access AWS Account

**Status:** AWS CLI authentication failed

**Error:** Invalid/expired AWS credentials

**All AWS CLI commands failed with:**
- `InvalidClientTokenId`
- `InvalidAccessKeyId`
- `AuthFailure`
- `UnrecognizedClientException`

---

## 🔧 To Check AWS Resources

You need to configure AWS credentials first:

### Option 1: Configure AWS CLI

```bash
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format (e.g., `json`)

### Option 2: Set Environment Variables

```bash
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_DEFAULT_REGION=us-east-1
```

### Option 3: Use AWS SSO or IAM Role

If using AWS SSO or running on EC2 with IAM role, configure accordingly.

---

## 📋 Commands to Check Resources

Once authenticated, run these commands:

### EC2 Instances:
```bash
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType,Tags[?Key==`Name`].Value|[0]]' --output table
```

### RDS Databases:
```bash
aws rds describe-db-instances --query 'DBInstances[*].[DBInstanceIdentifier,DBInstanceStatus,Engine,Endpoint.Address]' --output table
```

### S3 Buckets:
```bash
aws s3 ls
```

### Lambda Functions:
```bash
aws lambda list-functions --query 'Functions[*].[FunctionName,Runtime,LastModified]' --output table
```

### ECS Clusters:
```bash
aws ecs list-clusters --query 'clusterArns[*]' --output table
```

### ElastiCache (Redis):
```bash
aws elasticache describe-cache-clusters --query 'CacheClusters[*].[CacheClusterId,CacheNodeType,Engine,EngineVersion,CacheClusterStatus]' --output table
```

### CloudFormation Stacks:
```bash
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --query 'StackSummaries[*].[StackName,StackStatus,CreationTime]' --output table
```

### API Gateway:
```bash
aws apigateway get-rest-apis --query 'items[*].[name,id,createdDate]' --output table
```

### CloudFront Distributions:
```bash
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,DomainName,Status,Comment]' --output table
```

### Load Balancers:
```bash
aws elbv2 describe-load-balancers --query 'LoadBalancers[*].[LoadBalancerName,Type,State.Code,DNSName]' --output table
```

---

## 🔍 Check via Pulumi

Your Pulumi stack shows:
- **Stack:** `dev` exists
- **Outputs:** None (stack not deployed yet)

**To check Pulumi-managed resources:**
```bash
cd infrastructure/pulumi
pulumi stack select dev
pulumi stack --show-urns
```

---

## 🎯 Next Steps

1. **Configure AWS credentials** (see above)
2. **Run the commands** to list resources
3. **Or check AWS Console** directly in browser

**Once credentials are configured, I can help you run these commands!** 🔧
