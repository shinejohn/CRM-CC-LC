-- ============================================================================
-- FIBONACCO LEARNING CENTER DATABASE SCHEMA
-- Initial Migration
-- ============================================================================
-- Version: 1.0
-- Database: PostgreSQL 15+ (Aurora Serverless)
-- Description: Complete schema for Learning Center with AI learning
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "vector";   -- For pgvector (semantic search)

-- ============================================================================
-- KNOWLEDGE BASE (Core table for all content)
-- ============================================================================

CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    industry_codes TEXT[],
    
    -- Vector status
    embedding_status VARCHAR(20) DEFAULT 'pending' CHECK (embedding_status IN ('pending', 'processing', 'completed', 'failed')),
    embedding vector(1536),  -- OpenAI ada-002 dimension
    
    -- Access control
    is_public BOOLEAN DEFAULT true,
    allowed_agents UUID[],
    
    -- Source & validation
    source VARCHAR(20) CHECK (source IN ('google', 'serpapi', 'website', 'owner')),
    source_url TEXT,
    validation_status VARCHAR(20) DEFAULT 'unverified' CHECK (validation_status IN ('unverified', 'verified', 'disputed', 'outdated')),
    validated_at TIMESTAMPTZ,
    validated_by UUID,
    
    -- Usage metrics
    usage_count INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    not_helpful_count INT DEFAULT 0,
    
    -- Metadata
    tags TEXT[],
    metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- ============================================================================
-- FAQ SYSTEM
-- ============================================================================

CREATE TABLE faq_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES faq_categories(id) ON DELETE SET NULL,
    icon VARCHAR(50),
    color VARCHAR(7),
    display_order INT DEFAULT 0,
    faq_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE industry_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    parent_industry VARCHAR(100),
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE industry_subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry_id UUID REFERENCES industry_categories(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    faq_count INT DEFAULT 0,
    profile_questions_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(industry_id, code)
);

-- ============================================================================
-- BUSINESS PROFILE SURVEY
-- ============================================================================

CREATE TABLE survey_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_required BOOLEAN DEFAULT true,
    is_conditional BOOLEAN DEFAULT false,
    condition_config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE survey_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES survey_sections(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    help_text TEXT,
    question_type VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    
    -- Validation
    validation_rules JSONB,
    
    -- Options for select/multi-select
    options JSONB,
    
    -- Scale config
    scale_config JSONB,
    
    -- Conditional display
    is_conditional BOOLEAN DEFAULT false,
    show_when JSONB,
    
    -- AI/Data enrichment
    auto_populate_source VARCHAR(20) CHECK (auto_populate_source IN ('serpapi', 'google', 'none')),
    requires_owner_verification BOOLEAN DEFAULT false,
    
    -- Industry targeting
    industry_specific BOOLEAN DEFAULT false,
    applies_to_industries TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Knowledge base indexes
CREATE INDEX idx_knowledge_base_tenant ON knowledge_base(tenant_id);
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX idx_knowledge_base_embedding_status ON knowledge_base(embedding_status);
CREATE INDEX idx_knowledge_base_validation_status ON knowledge_base(validation_status);
CREATE INDEX idx_knowledge_base_source ON knowledge_base(source);
CREATE INDEX idx_knowledge_base_tags ON knowledge_base USING GIN(tags);
CREATE INDEX idx_knowledge_base_metadata ON knowledge_base USING GIN(metadata);

-- Vector similarity search index (IVFFlat for pgvector)
CREATE INDEX idx_knowledge_base_embedding ON knowledge_base 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Full text search indexes
CREATE INDEX idx_knowledge_base_title_search ON knowledge_base 
    USING GIN(to_tsvector('english', title));
CREATE INDEX idx_knowledge_base_content_search ON knowledge_base 
    USING GIN(to_tsvector('english', content));

-- FAQ category indexes
CREATE INDEX idx_faq_categories_parent ON faq_categories(parent_id);
CREATE INDEX idx_faq_categories_slug ON faq_categories(slug);

-- Survey indexes
CREATE INDEX idx_survey_questions_section ON survey_questions(section_id);
CREATE INDEX idx_survey_questions_type ON survey_questions(question_type);
CREATE INDEX idx_survey_sections_tenant ON survey_sections(tenant_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_knowledge_base_updated_at 
    BEFORE UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_survey_sections_updated_at 
    BEFORE UPDATE ON survey_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_survey_questions_updated_at 
    BEFORE UPDATE ON survey_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to search knowledge base with vector similarity
CREATE OR REPLACE FUNCTION search_knowledge_base(
    p_tenant_id UUID,
    p_query_text TEXT,
    p_query_embedding vector(1536),
    p_limit INT DEFAULT 10,
    p_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    category TEXT,
    similarity_score FLOAT,
    source VARCHAR(20),
    validation_status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kb.id,
        kb.title,
        kb.content,
        kb.category,
        1 - (kb.embedding <=> p_query_embedding) as similarity_score,
        kb.source,
        kb.validation_status
    FROM knowledge_base kb
    WHERE kb.tenant_id = p_tenant_id
        AND kb.embedding IS NOT NULL
        AND kb.is_public = true
        AND (kb.allowed_agents IS NULL OR array_length(kb.allowed_agents, 1) = 0)
        AND (1 - (kb.embedding <=> p_query_embedding)) >= p_threshold
    ORDER BY kb.embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


