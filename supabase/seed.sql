-- Dukanzo Phase 1 Seed Data

-- 1. Service Tiers
INSERT INTO service_tiers (id, name, description, base_price) VALUES
('11111111-1111-1111-1111-111111111111', 'Basic', 'Essential web presence for small businesses.', 500),
('22222222-2222-2222-2222-222222222222', 'Standard', 'Professional website with dynamic features.', 1000),
('33333333-3333-3333-3333-333333333333', 'Premium', 'Custom advanced application with high performance.', 2500)
ON CONFLICT (id) DO NOTHING;

-- 2. Tier Options
INSERT INTO tier_options (tier_id, option_key, option_value) VALUES
('11111111-1111-1111-1111-111111111111', 'pages', 'Up to 5 Pages'),
('11111111-1111-1111-1111-111111111111', 'revisions', '2 Revisions'),
('22222222-2222-2222-2222-222222222222', 'pages', 'Up to 10 Pages'),
('22222222-2222-2222-2222-222222222222', 'revisions', '5 Revisions'),
('33333333-3333-3333-3333-333333333333', 'pages', 'Unlimited Pages'),
('33333333-3333-3333-3333-333333333333', 'revisions', 'Unlimited Revisions')
ON CONFLICT DO NOTHING;

-- 3. Requirement Questions
INSERT INTO requirement_questions (id, tier_id, question_text, question_type, display_order, is_required) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'What is the primary goal of your website?', 'radio', 1, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Do you have existing branding (logo, colors)?', 'radio', 2, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Any specific features you want?', 'textarea', 3, false)
ON CONFLICT DO NOTHING;

-- 4. Question Options
INSERT INTO question_options (question_id, option_text, display_order) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Showcase my portfolio', 1),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Get more leads', 2),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sell products online', 3),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Yes, I have everything ready', 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'No, I need help with branding', 2)
ON CONFLICT DO NOTHING;
