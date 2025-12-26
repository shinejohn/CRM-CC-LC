"""
S3 Buckets for Frontend and Assets
Creates S3 buckets for frontend hosting and asset storage
"""

import pulumi
import pulumi_aws as aws


def create_s3_buckets(project_name: str, environment: str):
    """Create S3 buckets for frontend and assets"""
    
    buckets = {}
    
    # Frontend bucket (static website hosting)
    frontend_bucket = aws.s3.Bucket(
        f"{project_name}-frontend",
        bucket=f"{project_name}-frontend-{environment}",
        acl="private",
        website=aws.s3.BucketWebsiteArgs(
            index_document="index.html",
            error_document="index.html",  # SPA fallback
        ),
        versioning=aws.s3.BucketVersioningArgs(
            enabled=True,
        ),
        tags={
            "Name": f"{project_name}-frontend",
            "Environment": environment,
        },
    )
    
    # Block public access (CloudFront will use OAC/OAI)
    aws.s3.BucketPublicAccessBlock(
        f"{project_name}-frontend-pab",
        bucket=frontend_bucket.id,
        block_public_acls=True,
        block_public_policy=True,
        ignore_public_acls=True,
        restrict_public_buckets=True,
    )
    
    # Assets bucket
    assets_bucket = aws.s3.Bucket(
        f"{project_name}-assets",
        bucket=f"{project_name}-assets-{environment}",
        acl="private",
        versioning=aws.s3.BucketVersioningArgs(
            enabled=True,
        ),
        tags={
            "Name": f"{project_name}-assets",
            "Environment": environment,
        },
    )
    
    buckets["frontend"] = frontend_bucket
    buckets["assets"] = assets_bucket
    
    return buckets
