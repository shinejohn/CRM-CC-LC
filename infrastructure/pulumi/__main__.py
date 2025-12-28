"""
Fibonacco Learning Center - Pulumi AWS Infrastructure
Main entry point for infrastructure deployment
"""

import pulumi
import pulumi_aws as aws
from infrastructure.vpc import create_vpc
from infrastructure.vpc_existing import use_existing_vpc
from infrastructure.rds import create_rds
from infrastructure.redis import create_redis
from infrastructure.ecs import create_ecs_cluster
from infrastructure.s3 import create_s3_buckets
from infrastructure.cloudfront import create_cloudfront
from infrastructure.alb import create_alb
from infrastructure.secrets import create_secrets
from infrastructure.ecr import create_ecr_repository

# Configuration
config = pulumi.Config()
project_name = config.get("project_name", "learning-center")
environment = config.get("environment", "production")
region = config.get("region", "us-east-1")

# Check if we should use existing VPC (to avoid VPC limit issues)
should_use_existing_vpc = config.get_bool("use_existing_vpc", False)
existing_vpc_id = config.get("existing_vpc_id", None)

# Get VPC - use existing or create new
if should_use_existing_vpc and existing_vpc_id:
    vpc, public_subnets, private_subnets, database_subnets, db_subnet_group = use_existing_vpc(
        project_name=project_name,
        environment=environment,
        vpc_id=existing_vpc_id,
    )
else:
    vpc, public_subnets, private_subnets, database_subnets, db_subnet_group = create_vpc(
        project_name=project_name,
        environment=environment,
    )

# Create Secrets Manager secrets
api_secrets = create_secrets(
    project_name=project_name,
    environment=environment,
)

# Create ECR repository
ecr_repo, ecr_repo_url = create_ecr_repository(
    project_name=project_name,
    environment=environment,
)

# Create RDS PostgreSQL with pgvector
rds_cluster, rds_secret = create_rds(
    project_name=project_name,
    environment=environment,
    vpc_id=vpc.id,
    subnets=database_subnets,
    db_subnet_group_name=db_subnet_group.name,
    security_group_tags={"Name": f"{project_name}-rds-sg"},
)

# Create ElastiCache Redis
redis_cluster = create_redis(
    project_name=project_name,
    environment=environment,
    vpc_id=vpc.id,
    subnets=private_subnets,
    security_group_tags={"Name": f"{project_name}-redis-sg"},
)

# Create S3 buckets
s3_buckets = create_s3_buckets(
    project_name=project_name,
    environment=environment,
)

# Create CloudFront distribution
cloudfront_distribution = create_cloudfront(
    project_name=project_name,
    environment=environment,
    s3_bucket=s3_buckets["frontend"],
)

# Create Application Load Balancer (before ECS to get target group)
alb, target_group, alb_sg = create_alb(
    project_name=project_name,
    environment=environment,
    vpc_id=vpc.id,
    public_subnets=public_subnets,
)

# Create ECS Cluster (with ALB target group)
ecs_cluster, ecs_service, task_definition, ecs_sg = create_ecs_cluster(
    project_name=project_name,
    environment=environment,
    vpc_id=vpc.id,
    public_subnets=public_subnets,
    private_subnets=private_subnets,
    database_url=rds_cluster.endpoint,
    database_secret_arn=rds_secret.arn,
    redis_endpoint=redis_cluster.primary_endpoint_address,
    redis_port=redis_cluster.port,
    api_secrets={
        'openai': api_secrets['openai'],
        'elevenlabs': api_secrets['elevenlabs'],
        'openrouter': api_secrets['openrouter'],
    },
    target_group_arn=target_group.arn,
)

# Allow ALB to communicate with ECS tasks
aws.ec2.SecurityGroupRule(
    f"{project_name}-alb-to-ecs",
    type="ingress",
    from_port=80,
    to_port=80,
    protocol="tcp",
    source_security_group_id=alb_sg.id,
    security_group_id=ecs_sg.id,
    description="Allow ALB to communicate with ECS tasks",
)

# Update ECS service to use load balancer
# Note: This requires updating the service after ALB is created
# For now, the service is created without load balancer
# You can attach it manually or update the service definition

# Export outputs
pulumi.export("vpc_id", vpc.id)
pulumi.export("rds_endpoint", rds_cluster.endpoint)
pulumi.export("rds_secret_arn", rds_secret.arn)
pulumi.export("redis_endpoint", redis_cluster.primary_endpoint_address)
pulumi.export("alb_dns_name", alb.dns_name)
pulumi.export("cloudfront_url", cloudfront_distribution.domain_name)
pulumi.export("s3_frontend_bucket", s3_buckets["frontend"].id)
pulumi.export("ecs_cluster_name", ecs_cluster.name)
pulumi.export("ecs_service_name", ecs_service.name)
pulumi.export("ecr_repository_url", ecr_repo_url)
