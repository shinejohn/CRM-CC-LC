"""
VPC and Networking Infrastructure
Creates VPC, subnets, internet gateway, NAT gateway, and security groups
"""

import pulumi
import pulumi_aws as aws


def create_vpc(project_name: str, environment: str):
    """Create VPC with public, private, and database subnets"""
    
    # Get availability zones
    azs = aws.get_availability_zones(state="available")
    
    # Create VPC
    vpc = aws.ec2.Vpc(
        f"{project_name}-vpc",
        cidr_block="10.1.0.0/16",  # Changed from 10.0.0.0/16 to avoid conflicts
        enable_dns_hostnames=True,
        enable_dns_support=True,
        tags={
            "Name": f"{project_name}-vpc",
            "Environment": environment,
            "Project": project_name,
        },
    )
    
    # Create Internet Gateway
    igw = aws.ec2.InternetGateway(
        f"{project_name}-igw",
        vpc_id=vpc.id,
        tags={
            "Name": f"{project_name}-igw",
            "Environment": environment,
        },
    )
    
    # Create public subnets
    public_subnets = []
    for i, az in enumerate(azs.names[:2]):  # Use first 2 AZs
        subnet = aws.ec2.Subnet(
            f"{project_name}-public-subnet-{i+1}",
            vpc_id=vpc.id,
            cidr_block=f"10.1.{i+1}.0/24",
            availability_zone=az,
            map_public_ip_on_launch=True,
            tags={
                "Name": f"{project_name}-public-subnet-{i+1}",
                "Environment": environment,
                "Type": "public",
            },
        )
        public_subnets.append(subnet)
    
    # Create private subnets
    private_subnets = []
    for i, az in enumerate(azs.names[:2]):
        subnet = aws.ec2.Subnet(
            f"{project_name}-private-subnet-{i+1}",
            vpc_id=vpc.id,
            cidr_block=f"10.1.{i+10}.0/24",
            availability_zone=az,
            tags={
                "Name": f"{project_name}-private-subnet-{i+1}",
                "Environment": environment,
                "Type": "private",
            },
        )
        private_subnets.append(subnet)
    
    # Create database subnets
    database_subnets = []
    for i, az in enumerate(azs.names[:2]):
        subnet = aws.ec2.Subnet(
            f"{project_name}-database-subnet-{i+1}",
            vpc_id=vpc.id,
            cidr_block=f"10.1.{i+20}.0/24",
            availability_zone=az,
            tags={
                "Name": f"{project_name}-database-subnet-{i+1}",
                "Environment": environment,
                "Type": "database",
            },
        )
        database_subnets.append(subnet)
    
    # Create database subnet group
    db_subnet_group = aws.rds.SubnetGroup(
        f"{project_name}-db-subnet-group",
        subnet_ids=[s.id for s in database_subnets],
        tags={
            "Name": f"{project_name}-db-subnet-group",
            "Environment": environment,
        },
    )
    
    # Create Elastic IPs for NAT gateways
    eips = []
    for i in range(2):
        eip = aws.ec2.Eip(
            f"{project_name}-nat-eip-{i+1}",
            domain="vpc",
            tags={
                "Name": f"{project_name}-nat-eip-{i+1}",
                "Environment": environment,
            },
        )
        eips.append(eip)
    
    # Create NAT Gateways
    nat_gateways = []
    for i, subnet in enumerate(public_subnets):
        nat = aws.ec2.NatGateway(
            f"{project_name}-nat-{i+1}",
            allocation_id=eips[i].id,
            subnet_id=subnet.id,
            tags={
                "Name": f"{project_name}-nat-{i+1}",
                "Environment": environment,
            },
        )
        nat_gateways.append(nat)
    
    # Create public route table
    public_rt = aws.ec2.RouteTable(
        f"{project_name}-public-rt",
        vpc_id=vpc.id,
        routes=[
            aws.ec2.RouteTableRouteArgs(
                cidr_block="0.0.0.0/0",
                gateway_id=igw.id,
            ),
        ],
        tags={
            "Name": f"{project_name}-public-rt",
            "Environment": environment,
        },
    )
    
    # Associate public subnets with public route table
    for i, subnet in enumerate(public_subnets):
        aws.ec2.RouteTableAssociation(
            f"{project_name}-public-rta-{i+1}",
            subnet_id=subnet.id,
            route_table_id=public_rt.id,
        )
    
    # Create private route tables
    private_rts = []
    for i, nat in enumerate(nat_gateways):
        rt = aws.ec2.RouteTable(
            f"{project_name}-private-rt-{i+1}",
            vpc_id=vpc.id,
            routes=[
                aws.ec2.RouteTableRouteArgs(
                    cidr_block="0.0.0.0/0",
                    nat_gateway_id=nat.id,
                ),
            ],
            tags={
                "Name": f"{project_name}-private-rt-{i+1}",
                "Environment": environment,
            },
        )
        private_rts.append(rt)
    
    # Associate private subnets with private route tables
    for i, subnet in enumerate(private_subnets):
        rt_index = i % len(private_rts)
        aws.ec2.RouteTableAssociation(
            f"{project_name}-private-rta-{i+1}",
            subnet_id=subnet.id,
            route_table_id=private_rts[rt_index].id,
        )
    
    return vpc, public_subnets, private_subnets, database_subnets, db_subnet_group
