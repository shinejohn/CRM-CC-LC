"""
AWS Secrets Manager
Creates secrets for API keys and sensitive configuration
"""

import pulumi
import pulumi_aws as aws
import json


def create_secrets(project_name: str, environment: str):
    """Create secrets in AWS Secrets Manager"""
    
    secrets = {}
    
    # ElevenLabs API key secret - use different name to avoid conflicts
    elevenlabs_secret_resource = aws.secretsmanager.Secret(
        f"{project_name}-elevenlabs-secret",
        name=f"{project_name}-{environment}/elevenlabs/api-key",
        description="ElevenLabs API key for TTS",
        tags={
            "Name": f"{project_name}-elevenlabs-secret",
            "Environment": environment,
        },
    )
    
    # OpenRouter API key secret - use different name to avoid conflicts
    openrouter_secret_resource = aws.secretsmanager.Secret(
        f"{project_name}-openrouter-secret",
        name=f"{project_name}-{environment}/openrouter/api-key",
        description="OpenRouter API key for AI",
        tags={
            "Name": f"{project_name}-openrouter-secret",
            "Environment": environment,
        },
    )
    
    # OpenAI API key secret (for embeddings)
    openai_secret = aws.secretsmanager.Secret(
        f"{project_name}-openai-secret",
        name=f"{project_name}-{environment}/openai/api-key",
        description="OpenAI API key for embeddings",
        tags={
            "Name": f"{project_name}-openai-secret",
            "Environment": environment,
        },
    )
    
    secrets["elevenlabs"] = elevenlabs_secret_resource
    secrets["openrouter"] = openrouter_secret_resource
    secrets["openai"] = openai_secret
    
    return secrets
