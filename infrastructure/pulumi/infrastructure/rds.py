"""
RDS PostgreSQL with pgvector Extension
Creates RDS Aurora PostgreSQL cluster with pgvector support
"""

import pulumi
import pulumi_aws as aws


def create_rds(
    project_name: str,
    environment: str,
    vpc_id: pulumi.Input[str],
    subnets: list,
    db_subnet_group_name: pulumi.Input[str],
    security_group_tags: dict,
):
    """Create RDS Aurora PostgreSQL cluster with pgvector"""
    
    # Create security group for RDS
    rds_sg = aws.ec2.SecurityGroup(
        f"{project_name}-rds-sg",
        description="Security group for RDS PostgreSQL",
        vpc_id=vpc_id,
        ingress=[
            aws.ec2.SecurityGroupIngressArgs(
                description="PostgreSQL from VPC",
                from_port=5432,
                to_port=5432,
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
    
    # DB subnet group is created in vpc.py and passed as parameter
    
    # Create RDS cluster parameter group
    # Note: pgvector cannot be set via parameter group - it must be installed manually after cluster creation
    # See setup-database.sh script for enabling pgvector extension
    db_cluster_parameter_group = aws.rds.ClusterParameterGroup(
        f"{project_name}-db-cluster-params",
        family="aurora-postgresql15",  # Match engine version family
        description="Parameter group for Learning Center database",
        # pgvector will be enabled via SQL after cluster creation
        tags={
            "Name": f"{project_name}-db-cluster-params",
            "Environment": environment,
        },
    )
    
    # Create Secrets Manager secret for database credentials
    db_secret = aws.secretsmanager.Secret(
        f"{project_name}-db-credentials",
        name=f"{project_name}/database/credentials",
        description="RDS PostgreSQL credentials",
        tags={
            "Name": f"{project_name}-db-credentials",
            "Environment": environment,
        },
    )
    
    # Generate password with only allowed RDS characters
    # RDS allows: printable ASCII except '/', '@', '"', ' '
    import random
    import string
    # Use only allowed characters: letters, digits, and specific special chars
    password_chars = string.ascii_letters + string.digits + "!#$%&*()_+-=[]{}|;:,.<>?"
    db_password = ''.join(random.choice(password_chars) for _ in range(32))
    
    # Create RDS cluster with generated password
    # Use latest available Aurora PostgreSQL version
    rds_cluster = aws.rds.Cluster(
        f"{project_name}-db-cluster",
        engine="aurora-postgresql",
        engine_version="15.15",  # Latest 15.x version with pgvector support
        engine_mode="provisioned",
        database_name="learning_center",
        master_username="postgres",
        master_password=db_password,
        db_subnet_group_name=db_subnet_group_name,
        vpc_security_group_ids=[rds_sg.id],
        db_cluster_parameter_group_name=db_cluster_parameter_group.name,
        backup_retention_period=7,
        preferred_backup_window="03:00-04:00",
        preferred_maintenance_window="mon:04:00-mon:05:00",
        enabled_cloudwatch_logs_exports=["postgresql"],
        skip_final_snapshot=True,
        deletion_protection=False,  # Set to True for production
        tags={
            "Name": f"{project_name}-db-cluster",
            "Environment": environment,
        },
    )
    
    # Create RDS instance
    rds_instance = aws.rds.ClusterInstance(
        f"{project_name}-db-instance",
        identifier=f"{project_name}-db-instance-1",
        cluster_identifier=rds_cluster.id,
        instance_class="db.t4g.medium",
        engine=rds_cluster.engine,
        engine_version=rds_cluster.engine_version,
        publicly_accessible=False,
        tags={
            "Name": f"{project_name}-db-instance",
            "Environment": environment,
        },
    )
    
    # Store database credentials in Secrets Manager
    db_secret_version = aws.secretsmanager.SecretVersion(
        f"{project_name}-db-secret-version",
        secret_id=db_secret.id,
        secret_string=pulumi.Output.all(
            rds_cluster.endpoint,
            rds_cluster.database_name,
        ).apply(
            lambda args: f'{{"username":"postgres","password":"{db_password}","engine":"postgres","host":"{args[0]}","port":5432,"dbname":"{args[1]}","connection_string":"postgresql://postgres:{db_password}@{args[0]}:5432/{args[1]}"}}'
        ),
        opts=pulumi.ResourceOptions(depends_on=[rds_cluster, rds_instance]),
    )
    
    # Note: pgvector extension must be enabled after cluster creation
    # Run via RDS Data API or psql connection (see setup-database.sh)
    
    return rds_cluster, db_secret
