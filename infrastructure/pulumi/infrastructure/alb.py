"""
Application Load Balancer
Creates ALB for ECS service
"""

import pulumi
import pulumi_aws as aws


def create_alb(
    project_name: str,
    environment: str,
    vpc_id: pulumi.Input[str],
    public_subnets: list,
    ecs_service: aws.ecs.Service,
):
    """Create Application Load Balancer for ECS service"""
    
    # Create security group for ALB
    alb_sg = aws.ec2.SecurityGroup(
        f"{project_name}-alb-sg",
        description="Security group for ALB",
        vpc_id=vpc_id,
        ingress=[
            aws.ec2.SecurityGroupIngressArgs(
                description="HTTP from internet",
                from_port=80,
                to_port=80,
                protocol="tcp",
                cidr_blocks=["0.0.0.0/0"],
            ),
            aws.ec2.SecurityGroupIngressArgs(
                description="HTTPS from internet",
                from_port=443,
                to_port=443,
                protocol="tcp",
                cidr_blocks=["0.0.0.0/0"],
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
            "Name": f"{project_name}-alb-sg",
            "Environment": environment,
        },
    )
    
    # Create target group
    target_group = aws.lb.TargetGroup(
        f"{project_name}-tg",
        name=f"{project_name}-tg",
        port=80,
        protocol="HTTP",
        vpc_id=vpc_id,
        target_type="ip",
        health_check=aws.lb.TargetGroupHealthCheckArgs(
            enabled=True,
            healthy_threshold=2,
            unhealthy_threshold=3,
            timeout=5,
            interval=30,
            path="/health",
            protocol="HTTP",
            matcher="200",
        ),
        tags={
            "Name": f"{project_name}-tg",
            "Environment": environment,
        },
    )
    
    # Create load balancer
    alb = aws.lb.LoadBalancer(
        f"{project_name}-alb",
        name=f"{project_name}-alb",
        internal=False,
        load_balancer_type="application",
        security_groups=[alb_sg.id],
        subnets=[s.id for s in public_subnets],
        enable_deletion_protection=False,
        enable_http2=True,
        tags={
            "Name": f"{project_name}-alb",
            "Environment": environment,
        },
    )
    
    # Create HTTP listener
    http_listener = aws.lb.Listener(
        f"{project_name}-http-listener",
        load_balancer_arn=alb.arn,
        port=80,
        protocol="HTTP",
        default_actions=[
            aws.lb.ListenerDefaultActionArgs(
                type="redirect",
                redirect=aws.lb.ListenerDefaultActionRedirectArgs(
                    port="443",
                    protocol="HTTPS",
                    status_code="HTTP_301",
                ),
            ),
        ],
    )
    
    # Note: HTTPS listener would require ACM certificate
    # For now, HTTP listener redirects (or use self-signed cert for dev)
    
    # Attach target group to ECS service
    # This would be done via ECS service configuration
    # For now, we'll note this in the outputs
    
    return alb
