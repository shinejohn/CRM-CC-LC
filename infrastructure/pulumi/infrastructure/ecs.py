"""
ECS Fargate Cluster for Laravel Backend
Creates ECS cluster, task definition, and service for Laravel application
"""

import pulumi
import pulumi_aws as aws
import json


def create_ecs_cluster(
    project_name: str,
    environment: str,
    vpc_id: pulumi.Input[str],
    public_subnets: list,
    private_subnets: list,
    database_url: pulumi.Input[str],
    database_secret_arn: pulumi.Input[str],
    redis_endpoint: pulumi.Input[str],
    redis_port: pulumi.Input[int],
):
    """Create ECS Fargate cluster for Laravel backend"""
    
    # Create ECS cluster
    cluster = aws.ecs.Cluster(
        f"{project_name}-cluster",
        name=f"{project_name}-cluster",
        settings=[
            aws.ecs.ClusterSettingArgs(
                name="containerInsights",
                value="enabled",
            ),
        ],
        tags={
            "Name": f"{project_name}-cluster",
            "Environment": environment,
        },
    )
    
    # Create IAM role for ECS tasks
    task_role = aws.iam.Role(
        f"{project_name}-ecs-task-role",
        assume_role_policy=json.dumps({
            "Version": "2012-10-17",
            "Statement": [{
                "Action": "sts:AssumeRole",
                "Effect": "Allow",
                "Principal": {
                    "Service": "ecs-tasks.amazonaws.com",
                },
            }],
        }),
        tags={
            "Name": f"{project_name}-ecs-task-role",
            "Environment": environment,
        },
    )
    
    # Attach policies to task role
    aws.iam.RolePolicyAttachment(
        f"{project_name}-ecs-task-policy",
        role=task_role.name,
        policy_arn="arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    )
    
    # Grant Secrets Manager access
    task_role_policy = aws.iam.RolePolicy(
        f"{project_name}-ecs-task-policy-inline",
        role=task_role.id,
        policy=json.dumps({
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "secretsmanager:GetSecretValue",
                        "secretsmanager:DescribeSecret",
                    ],
                    "Resource": "*",
                },
            ],
        }),
    )
    
    # Create execution role
    execution_role = aws.iam.Role(
        f"{project_name}-ecs-execution-role",
        assume_role_policy=json.dumps({
            "Version": "2012-10-17",
            "Statement": [{
                "Action": "sts:AssumeRole",
                "Effect": "Allow",
                "Principal": {
                    "Service": "ecs-tasks.amazonaws.com",
                },
            }],
        }),
        tags={
            "Name": f"{project_name}-ecs-execution-role",
            "Environment": environment,
        },
    )
    
    # Attach execution policy
    aws.iam.RolePolicyAttachment(
        f"{project_name}-ecs-execution-policy",
        role=execution_role.name,
        policy_arn="arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    )
    
    # Create CloudWatch log group
    log_group = aws.cloudwatch.LogGroup(
        f"{project_name}-logs",
        name=f"/ecs/{project_name}",
        retention_in_days=7,
        tags={
            "Name": f"{project_name}-logs",
            "Environment": environment,
        },
    )
    
    # Create security group for ECS tasks
    ecs_sg = aws.ec2.SecurityGroup(
        f"{project_name}-ecs-sg",
        description="Security group for ECS tasks",
        vpc_id=vpc_id,
        ingress=[
            aws.ec2.SecurityGroupIngressArgs(
                description="HTTP from ALB",
                from_port=80,
                to_port=80,
                protocol="tcp",
                cidr_blocks=["10.0.0.0/16"],
            ),
        ],
        egress=[
            aws.ec2.SecurityGroupEgressArgs(
                from_port=0,
                to_port=0,
                protocol="-1",
                cidr_blocks=["0.0.0.0/0"],
            ),
        ],
        tags={
            "Name": f"{project_name}-ecs-sg",
            "Environment": environment,
        },
    )
    
    # Get ECR repository (assuming it exists or will be created separately)
    # For now, we'll use a placeholder image
    image = f"{project_name}-backend:latest"
    
    # Create task definition
    task_definition = aws.ecs.TaskDefinition(
        f"{project_name}-task",
        family=f"{project_name}-task",
        network_mode="awsvpc",
        requires_compatibilities=["FARGATE"],
        cpu="512",
        memory="1024",
        execution_role_arn=execution_role.arn,
        task_role_arn=task_role.arn,
        container_definitions=pulumi.Output.all(
            database_url,
            database_secret_arn,
            redis_endpoint,
            redis_port,
        ).apply(
            lambda args: json.dumps([
                {
                    "name": "laravel",
                    "image": image,
                    "essential": True,
                    "portMappings": [
                        {
                            "containerPort": 80,
                            "protocol": "tcp",
                        },
                    ],
                    "environment": [
                        {"name": "APP_ENV", "value": environment},
                        {"name": "APP_DEBUG", "value": "false"},
                        {"name": "REDIS_HOST", "value": args[2]},
                        {"name": "REDIS_PORT", "value": str(args[3])},
                        {"name": "CACHE_DRIVER", "value": "redis"},
                        {"name": "QUEUE_CONNECTION", "value": "redis"},
                    ],
                    "secrets": [
                        {
                            "name": "DB_CONNECTION",
                            "valueFrom": f"{args[1]}:DB_CONNECTION::",
                        },
                        {
                            "name": "DB_HOST",
                            "valueFrom": f"{args[1]}:DB_HOST::",
                        },
                        {
                            "name": "DB_DATABASE",
                            "valueFrom": f"{args[1]}:DB_DATABASE::",
                        },
                        {
                            "name": "DB_USERNAME",
                            "valueFrom": f"{args[1]}:DB_USERNAME::",
                        },
                        {
                            "name": "DB_PASSWORD",
                            "valueFrom": f"{args[1]}:DB_PASSWORD::",
                        },
                    ],
                    "logConfiguration": {
                        "logDriver": "awslogs",
                        "options": {
                            "awslogs-group": log_group.name,
                            "awslogs-region": aws.config.region,
                            "awslogs-stream-prefix": "ecs",
                        },
                    },
                },
            ])
        ),
        tags={
            "Name": f"{project_name}-task",
            "Environment": environment,
        },
    )
    
    # Create ECS service
    service = aws.ecs.Service(
        f"{project_name}-service",
        name=f"{project_name}-service",
        cluster=cluster.arn,
        task_definition=task_definition.arn,
        desired_count=1,
        launch_type="FARGATE",
        network_configuration=aws.ecs.ServiceNetworkConfigurationArgs(
            assign_public_ip=False,
            subnets=[s.id for s in private_subnets],
            security_groups=[ecs_sg.id],
        ),
        tags={
            "Name": f"{project_name}-service",
            "Environment": environment,
        },
    )
    
    return cluster, service, task_definition
