# Pulumi Cloud Setup - Learning Center Project

## Project Status

✅ **Project Name:** `learning-center`  
✅ **Runtime:** Python  
✅ **Location:** `infrastructure/pulumi/`

## Current Infrastructure Components

1. **Application Load Balancer (ALB)**
   - File: `infrastructure/alb.py`
   - HTTPS listeners configured
   - Route53 integration

2. **ECS Cluster & Services**
   - File: `infrastructure/ecs.py`
   - Fargate tasks
   - Auto-scaling configured

3. **Route53 DNS**
   - File: `infrastructure/route53.py`
   - Domain management

## Setup Instructions

To upload this project to Pulumi Cloud:

1. **Ensure you're logged into Pulumi Cloud:**
   ```bash
   cd infrastructure/pulumi
   pulumi login
   ```

2. **Create/select the stack:**
   ```bash
   pulumi stack init learning-center/dev
   # or if it already exists:
   pulumi stack select learning-center/dev
   ```

3. **Set required configuration:**
   ```bash
   pulumi config set aws:region us-east-1
   pulumi config set domain your-domain.com
   # Add any other required config values
   ```

4. **Preview the infrastructure:**
   ```bash
   pulumi preview
   ```

5. **Deploy:**
   ```bash
   pulumi up
   ```

## Project Configuration

The project is configured with:
- **Name:** learning-center
- **Runtime:** python
- **Description:** Fibonacco Learning Center Infrastructure on AWS

## View in Pulumi Cloud

Once the stack is created, you can view it at:
https://app.pulumi.com/[your-org]/learning-center/dev
