"""
ECR Repository for Docker Images
Creates ECR repository for backend Docker image
"""

import pulumi
import pulumi_aws as aws


def create_ecr_repository(project_name: str, environment: str):
    """Create ECR repository for Docker images"""
    
    repository = aws.ecr.Repository(
        f"{project_name}-backend-repo",
        name=f"{project_name}-backend",
        image_tag_mutability="MUTABLE",
        image_scanning_configuration=aws.ecr.RepositoryImageScanningConfigurationArgs(
            scan_on_push=True,
        ),
        encryption_configurations=[
            aws.ecr.RepositoryEncryptionConfigurationArgs(
                encryption_type="AES256",
            ),
        ],
        tags={
            "Name": f"{project_name}-backend-repo",
            "Environment": environment,
        },
    )
    
    # Get repository URL
    repository_url = repository.repository_url
    
    return repository, repository_url
