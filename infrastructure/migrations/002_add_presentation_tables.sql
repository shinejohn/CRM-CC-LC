-- ============================================================================
-- PRESENTATION SYSTEM TABLES
-- ============================================================================

CREATE TABLE presentation_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    purpose VARCHAR(100),
    target_audience VARCHAR(255),
    
    -- Structure
    slides JSONB NOT NULL,
    
    -- Pre-recorded audio location
    audio_base_url VARCHAR(500),
    audio_files JSONB,
    
    -- Dynamic injection points
    injection_points JSONB,
    
    -- Visual
    default_theme JSONB,
    default_presenter_id VARCHAR(50),
    
    -- Metadata
    estimated_duration INT,
    slide_count INT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE presenters (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    avatar_url VARCHAR(500),
    
    -- Voice settings
    voice_provider VARCHAR(50),
    voice_id VARCHAR(100),
    voice_settings JSONB,
    
    -- AI personality
    personality TEXT,
    communication_style TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE generated_presentations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    customer_id UUID,
    template_id VARCHAR(50) REFERENCES presentation_templates(id),
    
    -- The assembled presentation
    presentation_json JSONB NOT NULL,
    
    -- Audio status
    audio_base_url VARCHAR(500),
    audio_generated BOOLEAN DEFAULT false,
    audio_generated_at TIMESTAMPTZ,
    
    -- Cache management
    input_hash VARCHAR(64),
    expires_at TIMESTAMPTZ,
    
    -- Analytics
    view_count INT DEFAULT 0,
    avg_completion_rate DECIMAL(5,2),
    last_viewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_generated_presentations_tenant ON generated_presentations(tenant_id);
CREATE INDEX idx_generated_presentations_customer ON generated_presentations(customer_id);
CREATE INDEX idx_generated_presentations_template ON generated_presentations(template_id);
CREATE INDEX idx_generated_presentations_hash ON generated_presentations(input_hash);


