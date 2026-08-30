-- Dukanzo Phase 1 Schema
-- All tables use UUIDs for primary keys

-- 1. Service Tiers
CREATE TABLE service_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- 'Basic', 'Standard', 'Premium'
    description TEXT,
    base_price NUMERIC,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tier Options (Configurable options per tier)
CREATE TABLE tier_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_id UUID REFERENCES service_tiers(id) ON DELETE CASCADE,
    option_key TEXT NOT NULL, -- e.g., 'pages', 'revisions', 'custom_design'
    option_value TEXT NOT NULL, -- e.g., '5', '3', 'true'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Requirement Questions (Dynamic SRS Builder Questions)
CREATE TABLE requirement_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_id UUID REFERENCES service_tiers(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL, -- 'text', 'textarea', 'select', 'radio', 'checkbox', 'file'
    is_required BOOLEAN DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Question Options (For select/radio/checkbox questions)
CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES requirement_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Project Requests
CREATE TABLE project_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id), -- Nullable before submission, but required after
    tier_id UUID REFERENCES service_tiers(id),
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'processing', 'completed'
    contact_phone TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Requirement Answers
CREATE TABLE requirement_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES project_requests(id) ON DELETE CASCADE,
    question_id UUID REFERENCES requirement_questions(id),
    answer_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SRS Documents
CREATE TABLE srs_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES project_requests(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'generated', -- 'generated', 'sent', 'approved'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE service_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE srs_documents ENABLE ROW LEVEL SECURITY;

-- Policies for public reading of configuration
CREATE POLICY "Public can view active service tiers" ON service_tiers FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active tier options" ON tier_options FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view requirement questions" ON requirement_questions FOR SELECT USING (true);
CREATE POLICY "Public can view question options" ON question_options FOR SELECT USING (true);

-- Policies for authenticated users to manage their own requests
CREATE POLICY "Users can create project requests" ON project_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own project requests" ON project_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own draft requests" ON project_requests FOR UPDATE USING (auth.uid() = user_id AND status = 'draft');

CREATE POLICY "Users can insert own answers" ON requirement_answers FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM project_requests WHERE id = request_id AND user_id = auth.uid())
);
CREATE POLICY "Users can view own answers" ON requirement_answers FOR SELECT USING (
    EXISTS (SELECT 1 FROM project_requests WHERE id = request_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own answers" ON requirement_answers FOR UPDATE USING (
    EXISTS (SELECT 1 FROM project_requests WHERE id = request_id AND user_id = auth.uid() AND status = 'draft')
);

CREATE POLICY "Users can view own SRS documents" ON srs_documents FOR SELECT USING (
    EXISTS (SELECT 1 FROM project_requests WHERE id = request_id AND user_id = auth.uid())
);

-- Set up basic functions and triggers for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_service_tiers_updated_at BEFORE UPDATE ON service_tiers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER update_tier_options_updated_at BEFORE UPDATE ON tier_options FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER update_requirement_questions_updated_at BEFORE UPDATE ON requirement_questions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER update_question_options_updated_at BEFORE UPDATE ON question_options FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER update_project_requests_updated_at BEFORE UPDATE ON project_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER update_requirement_answers_updated_at BEFORE UPDATE ON requirement_answers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER update_srs_documents_updated_at BEFORE UPDATE ON srs_documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();
