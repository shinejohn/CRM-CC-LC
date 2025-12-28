"""
Route53 Hosted Zone and DNS Configuration
Creates hosted zone, ACM certificates, and DNS records for custom domains
"""

import pulumi
import pulumi_aws as aws
from typing import Optional


def create_hosted_zone(
    domain_name: str,
    project_name: str,
    environment: str,
    comment: Optional[str] = None,
) -> tuple[aws.route53.Zone, str]:
    """
    Create Route53 hosted zone for a domain
    
    Args:
        domain_name: The domain name (e.g., "fibonacco.com")
        project_name: Project name for tagging
        environment: Environment name
        comment: Optional comment for the zone
    
    Returns:
        Tuple of (hosted zone resource, zone ID)
    """
    zone = aws.route53.Zone(
        f"{project_name}-hosted-zone",
        name=domain_name,
        comment=comment or f"Hosted zone for {domain_name}",
        tags={
            "Name": f"{project_name}-zone",
            "Project": project_name,
            "Environment": environment,
        },
    )
    
    return zone, zone.zone_id


def create_acm_certificate(
    domain_name: str,
    subject_alternative_names: Optional[list[str]] = None,
    project_name: str = "learning-center",
    environment: str = "production",
    region: str = "us-east-1",  # Must be us-east-1 for CloudFront
) -> aws.acm.Certificate:
    """
    Create ACM certificate for a domain
    
    Args:
        domain_name: Primary domain name
        subject_alternative_names: List of additional domain names (SANs)
        project_name: Project name for tagging
        environment: Environment name
        region: AWS region (must be us-east-1 for CloudFront)
    
    Returns:
        ACM Certificate resource
    """
    # Create certificate provider for the specified region
    provider = aws.Provider(
        f"{region}-provider",
        region=region,
    )
    
    certificate = aws.acm.Certificate(
        f"{project_name}-certificate",
        domain_name=domain_name,
        subject_alternative_names=subject_alternative_names or [],
        validation_method="DNS",
        tags={
            "Name": f"{project_name}-cert",
            "Project": project_name,
            "Environment": environment,
            "Domain": domain_name,
        },
        opts=pulumi.ResourceOptions(provider=provider),
    )
    
    return certificate


def create_cloudfront_alias_record(
    zone_id: pulumi.Input[str],
    domain_name: str,
    cloudfront_domain: pulumi.Input[str],
    project_name: str = "learning-center",
    environment: str = "production",
) -> tuple[aws.route53.Record, aws.route53.Record]:
    """
    Create Route53 alias records pointing to CloudFront distribution
    
    Args:
        zone_id: Route53 hosted zone ID
        domain_name: Custom domain name (e.g., "learning.fibonacco.com")
        cloudfront_domain: CloudFront distribution domain name
        project_name: Project name for tagging
        environment: Environment name
    
    Returns:
        Tuple of (A record, AAAA record)
    """
    # CloudFront hosted zone ID (same for all regions)
    cloudfront_zone_id = "Z2FDTNDATAQYW2"
    
    # A record (IPv4)
    a_record = aws.route53.Record(
        f"{project_name}-cloudfront-a",
        zone_id=zone_id,
        name=domain_name,
        type="A",
        aliases=[
            aws.route53.RecordAliasArgs(
                name=cloudfront_domain,
                zone_id=cloudfront_zone_id,
                evaluate_target_health=False,
            )
        ],
        allow_overwrite=True,
    )
    
    # AAAA record (IPv6)
    aaaa_record = aws.route53.Record(
        f"{project_name}-cloudfront-aaaa",
        zone_id=zone_id,
        name=domain_name,
        type="AAAA",
        aliases=[
            aws.route53.RecordAliasArgs(
                name=cloudfront_domain,
                zone_id=cloudfront_zone_id,
                evaluate_target_health=False,
            )
        ],
        allow_overwrite=True,
    )
    
    return a_record, aaaa_record


def create_alb_alias_record(
    zone_id: pulumi.Input[str],
    domain_name: str,
    alb_dns: pulumi.Input[str],
    alb_zone_id: str = "Z35SXDOTRQ7X7K",  # us-east-1 ALB zone ID
    project_name: str = "learning-center",
    environment: str = "production",
) -> aws.route53.Record:
    """
    Create Route53 alias record pointing to ALB
    
    Args:
        zone_id: Route53 hosted zone ID
        domain_name: Custom domain name (e.g., "api.fibonacco.com")
        alb_dns: ALB DNS name
        alb_zone_id: ALB hosted zone ID (region-specific)
        project_name: Project name for tagging
        environment: Environment name
    
    Returns:
        Route53 A record
    """
    record = aws.route53.Record(
        f"{project_name}-alb-alias",
        zone_id=zone_id,
        name=domain_name,
        type="A",
        aliases=[
            aws.route53.RecordAliasArgs(
                name=alb_dns,
                zone_id=alb_zone_id,
                evaluate_target_health=True,
            )
        ],
        allow_overwrite=True,
    )
    
    return record


def create_certificate_validation_record(
    zone_id: pulumi.Input[str],
    certificate_validation: aws.acm.CertificateValidation,
    project_name: str = "learning-center",
) -> list[aws.route53.Record]:
    """
    Create DNS validation records for ACM certificate
    
    Note: This uses CertificateValidation resource which automatically
    creates validation records. For manual setup, use certificate
    domain_validation_options.
    
    Args:
        zone_id: Route53 hosted zone ID
        certificate_validation: CertificateValidation resource
        project_name: Project name for tagging
    
    Returns:
        List of Route53 validation records
    """
    # CertificateValidation automatically handles DNS records
    # This function is for reference/documentation
    # In practice, CertificateValidation resource handles this
    return []
