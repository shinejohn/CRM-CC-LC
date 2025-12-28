# Quick Deploy to AWS - Execute Now 🚀

## One-Command Deployment

Run this from the project root:

```bash
cd infrastructure/pulumi && ./deploy.sh
```

## What It Does:

1. ✅ Checks prerequisites (Pulumi, AWS CLI, Docker)
2. ✅ Initializes/selects Pulumi stack
3. ✅ Deploys all AWS infrastructure (15-30 min)
4. ✅ Builds Docker image
5. ✅ Pushes to ECR
6. ✅ Updates ECS service
7. ✅ Provides next steps

## After Deployment:

### 1. Set API Keys (Required)

```bash
cd infrastructure/pulumi
aws secretsmanager put-secret-value \
  --secret-id learning-center-production/openai/api-key \
  --secret-string "YOUR_OPENAI_KEY"

aws secretsmanager put-secret-value \
  --secret-id learning-center-production/elevenlabs/api-key \
  --secret-string "YOUR_ELEVENLABS_KEY"

aws secretsmanager put-secret-value \
  --secret-id learning-center-production/openrouter/api-key \
  --secret-string "YOUR_OPENROUTER_KEY"
```

### 2. Setup Database

```bash
cd infrastructure/pulumi
./setup-database.sh
```

### 3. Run Migrations

```bash
# Get task ID
TASK_ID=$(aws ecs list-tasks --cluster learning-center-cluster --service-name learning-center-service --query 'taskArns[0]' --output text | cut -d'/' -f3)

# Run migrations
aws ecs execute-command \
  --cluster learning-center-cluster \
  --task $TASK_ID \
  --container laravel \
  --command "php artisan migrate --force" \
  --interactive
```

### 4. Deploy Frontend

```bash
cd ../..
npm run build
./scripts/deploy-frontend.sh
```

## Get URLs:

```bash
cd infrastructure/pulumi
pulumi stack output
```

**Backend API:** `http://$(pulumi stack output alb_dns_name)`  
**Frontend:** `https://$(pulumi stack output cloudfront_url)`

---

**Ready? Run:** `cd infrastructure/pulumi && ./deploy.sh`
