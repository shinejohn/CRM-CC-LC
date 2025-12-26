"""
ElastiCache Redis Cluster
Creates Redis cluster for caching and queues
"""

import pulumi
import pulumi_aws as aws


def create_redis(
    project_name: str,
    environment: str,
    vpc_id: pulumi.Input[str],
    subnets: list,
    security_group_tags: dict,
):
    """Create ElastiCache Redis cluster"""
    
    # Create security group for Redis
    redis_sg = aws.ec2.SecurityGroup(
        f"{project_name}-redis-sg",
        description="Security group for ElastiCache Redis",
        vpc_id=vpc_id,
        ingress=[
            aws.ec2.SecurityGroupIngressArgs(
                description="Redis from VPC",
                from_port=6379,
                to_port=6379,
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
        tags={**security_group_tags, "Environment": environment},
    )
    
    # Create Redis subnet group
    redis_subnet_group = aws.elasticache.SubnetGroup(
        f"{project_name}-redis-subnet-group",
        subnet_ids=[s.id for s in subnets],
        tags={
            "Name": f"{project_name}-redis-subnet-group",
            "Environment": environment,
        },
    )
    
    # Create Redis parameter group
    redis_parameter_group = aws.elasticache.ParameterGroup(
        f"{project_name}-redis-params",
        family="redis7",
        description="Parameter group for Redis",
        parameters=[
            aws.elasticache.ParameterGroupParameterArgs(
                name="maxmemory-policy",
                value="allkeys-lru",
            ),
        ],
        tags={
            "Name": f"{project_name}-redis-params",
            "Environment": environment,
        },
    )
    
    # Create ElastiCache Redis cluster
    # Use unique name to avoid conflicts with existing resources
    redis_id = f"{project_name}-{environment}-redis"
    
    # Check if Redis already exists and import it, otherwise create new
    redis_cluster = aws.elasticache.ReplicationGroup(
        f"{project_name}-redis",
        replication_group_id=redis_id,
        description=f"Redis cluster for {project_name}",
        node_type="cache.t4g.micro",
        port=6379,
        parameter_group_name=redis_parameter_group.name,
        num_cache_clusters=1,  # Use 1 for dev, 2+ for production
        subnet_group_name=redis_subnet_group.name,
        security_group_ids=[redis_sg.id],
        at_rest_encryption_enabled=True,
        transit_encryption_enabled=False,  # Enable for production
        automatic_failover_enabled=False,  # Enable for production with 2+ nodes
        tags={
            "Name": f"{project_name}-redis",
            "Environment": environment,
        },
    )
    
    # For single node, use primary_endpoint_address; for cluster mode, use configuration_endpoint_address
    # Since we're using num_cache_clusters=1, we'll use primary_endpoint_address
    return redis_cluster
