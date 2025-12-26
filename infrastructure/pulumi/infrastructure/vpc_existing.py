"""
Use Existing VPC Infrastructure
Uses an existing VPC and creates subnets or uses existing subnets
"""

import pulumi
import pulumi_aws as aws


def use_existing_vpc(project_name: str, environment: str, vpc_id: str):
    """Use existing VPC and get/create subnets"""
    
    # Get existing VPC
    vpc = aws.ec2.Vpc.get(
        f"{project_name}-vpc",
        vpc_id,
    )
    
    # Get existing subnets in the VPC
    existing_subnets_data = aws.ec2.get_subnets(
        filters=[
            aws.ec2.GetSubnetsFilterArgs(
                name="vpc-id",
                values=[vpc_id],
            ),
        ],
    )
    
    # Use existing subnets (default VPC has 6 subnets)
    # Use first 2 as public, next 2 as private, last 2 as database
    public_subnets = [
        aws.ec2.Subnet.get(f"{project_name}-public-subnet-{i+1}", existing_subnets_data.ids[i])
        for i in range(min(2, len(existing_subnets_data.ids)))
    ]
    
    private_subnets = [
        aws.ec2.Subnet.get(f"{project_name}-private-subnet-{i+1}", existing_subnets_data.ids[i+2] if len(existing_subnets_data.ids) > i+2 else existing_subnets_data.ids[i])
        for i in range(min(2, len(existing_subnets_data.ids)))
    ]
    
    database_subnets = [
        aws.ec2.Subnet.get(f"{project_name}-database-subnet-{i+1}", existing_subnets_data.ids[i+4] if len(existing_subnets_data.ids) > i+4 else existing_subnets_data.ids[i % len(existing_subnets_data.ids)])
        for i in range(min(2, len(existing_subnets_data.ids)))
    ]
    
    # Create database subnet group
    db_subnet_group = aws.rds.SubnetGroup(
        f"{project_name}-db-subnet-group",
        subnet_ids=[s.id for s in database_subnets],
        tags={
            "Name": f"{project_name}-db-subnet-group",
            "Environment": environment,
        },
    )
    
    return vpc, public_subnets, private_subnets, database_subnets, db_subnet_group
