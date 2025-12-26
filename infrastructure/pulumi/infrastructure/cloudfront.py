"""
CloudFront Distribution for Frontend
Creates CloudFront distribution for S3 frontend bucket
"""

import pulumi
import pulumi_aws as aws


def create_cloudfront(
    project_name: str,
    environment: str,
    s3_bucket: aws.s3.Bucket,
):
    """Create CloudFront distribution for frontend S3 bucket"""
    
    # Get account ID for OAC
    current = aws.get_caller_identity()
    
    # Create Origin Access Control (OAC) - newer than OAI
    oac = aws.cloudfront.OriginAccessControl(
        f"{project_name}-oac",
        name=f"{project_name}-oac",
        description=f"OAC for {project_name} frontend",
        origin_access_control_origin_type="s3",
        signing_behavior="always",
        signing_protocol="sigv4",
    )
    
    # Create bucket policy to allow CloudFront OAC
    bucket_policy = aws.s3.BucketPolicy(
        f"{project_name}-frontend-policy",
        bucket=s3_bucket.id,
        policy=pulumi.Output.all(oac.id, s3_bucket.arn, current.account_id).apply(
            lambda args: f"""{{
                "Version": "2012-10-17",
                "Statement": [
                    {{
                        "Effect": "Allow",
                        "Principal": {{
                            "Service": "cloudfront.amazonaws.com"
                        }},
                        "Action": "s3:GetObject",
                        "Resource": "{args[1]}/*",
                        "Condition": {{
                            "StringEquals": {{
                                "AWS:SourceArn": "arn:aws:cloudfront::{args[2]}:distribution/*"
                            }}
                        }}
                    }}
                ]
            }}"""
        ),
    )
    
    # Create CloudFront distribution
    distribution = aws.cloudfront.Distribution(
        f"{project_name}-cf",
        enabled=True,
        is_ipv6_enabled=True,
        comment=f"CloudFront distribution for {project_name}",
        default_root_object="index.html",
        
        origins=[
            aws.cloudfront.DistributionOriginArgs(
                domain_name=s3_bucket.bucket_domain_name,
                origin_id=s3_bucket.id,
                origin_access_control_id=oac.id,
            ),
        ],
        
        default_cache_behavior=aws.cloudfront.DistributionDefaultCacheBehaviorArgs(
            allowed_methods=["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"],
            cached_methods=["GET", "HEAD"],
            target_origin_id=s3_bucket.id,
            compress=True,
            viewer_protocol_policy="redirect-to-https",
            min_ttl=0,
            default_ttl=3600,
            max_ttl=86400,
            forwarded_values=aws.cloudfront.DistributionDefaultCacheBehaviorForwardedValuesArgs(
                query_string=False,
                cookies=aws.cloudfront.DistributionDefaultCacheBehaviorForwardedValuesCookiesArgs(
                    forward="none",
                ),
            ),
        ),
        
        # Custom error responses for SPA routing
        custom_error_responses=[
            aws.cloudfront.DistributionCustomErrorResponseArgs(
                error_code=404,
                response_code=200,
                response_page_path="/index.html",
                error_caching_min_ttl=300,
            ),
            aws.cloudfront.DistributionCustomErrorResponseArgs(
                error_code=403,
                response_code=200,
                response_page_path="/index.html",
                error_caching_min_ttl=300,
            ),
        ],
        
        restrictions=aws.cloudfront.DistributionRestrictionsArgs(
            geo_restriction=aws.cloudfront.DistributionRestrictionsGeoRestrictionArgs(
                restriction_type="none",
            ),
        ),
        
        viewer_certificate=aws.cloudfront.DistributionViewerCertificateArgs(
            cloudfront_default_certificate=True,  # Use ACM certificate for custom domain
        ),
        
        tags={
            "Name": f"{project_name}-cf",
            "Environment": environment,
        },
    )
    
    return distribution
