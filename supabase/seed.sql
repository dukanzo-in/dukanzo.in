-- Dukanzo Phase 1 Seed Data

-- 1. Service Tiers
INSERT INTO service_tiers (id, name, description, base_price) VALUES
('11111111-1111-1111-1111-111111111111', 'Basic', 'Essential web presence for small businesses.', 500),
('22222222-2222-2222-2222-222222222222', 'Standard', 'Professional website with dynamic features.', 1000),
('33333333-3333-3333-3333-333333333333', 'Premium', 'Custom advanced application with high performance.', 2500)
ON CONFLICT (id) DO NOTHING;

-- 2. Tier Options
INSERT INTO tier_options (tier_id, option_key, option_value, display_name, input_type, choices, display_order) VALUES
-- Basic Tier Options
('11111111-1111-1111-1111-111111111111', 'pages', '1', 'Number of Pages', 'select', '["1", "2", "3", "4", "5"]', 1),
('11111111-1111-1111-1111-111111111111', 'contact_form', 'true', 'Basic Contact Form', 'checkbox', null, 2),
('11111111-1111-1111-1111-111111111111', 'responsive', 'true', 'Mobile Responsive', 'checkbox', null, 3),

-- Standard Tier Options
('22222222-2222-2222-2222-222222222222', 'pages', '5', 'Number of Pages', 'select', '["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]', 1),
('22222222-2222-2222-2222-222222222222', 'gallery', 'true', 'Image Gallery', 'checkbox', null, 2),
('22222222-2222-2222-2222-222222222222', 'whatsapp', 'true', 'WhatsApp Integration', 'checkbox', null, 3),
('22222222-2222-2222-2222-222222222222', 'maps', 'false', 'Google Maps Integration', 'checkbox', null, 4),

-- Premium Tier Options
('33333333-3333-3333-3333-333333333333', 'pages', 'Unlimited', 'Number of Pages', 'select', '["1-10", "11-20", "20+", "Unlimited"]', 1),
('33333333-3333-3333-3333-333333333333', 'ecommerce', 'false', 'E-Commerce / Store', 'checkbox', null, 2),
('33333333-3333-3333-3333-333333333333', 'custom_backend', 'false', 'Custom Backend Features', 'checkbox', null, 3),
('33333333-3333-3333-3333-333333333333', 'design_system', 'true', 'Custom UI/UX Design', 'checkbox', null, 4)
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
