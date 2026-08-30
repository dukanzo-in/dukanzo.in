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
INSERT INTO requirement_questions (id, tier_id, question_text, question_type, display_order, is_required, step_group) VALUES
-- Step 1: Business
('aaaaaaaa-0001-aaaa-aaaa-aaaaaaaaaaaa', null, 'What is the name of your business?', 'text', 1, true, 'Business'),
('aaaaaaaa-0002-aaaa-aaaa-aaaaaaaaaaaa', null, 'What type of business is it? (e.g., Bakery, Plumber)', 'text', 2, true, 'Business'),
('aaaaaaaa-0003-aaaa-aaaa-aaaaaaaaaaaa', null, 'Briefly describe what your business does.', 'textarea', 3, true, 'Business'),

-- Step 2: Customers
('bbbbbbbb-0001-bbbb-bbbb-bbbbbbbbbbbb', null, 'Who are your primary customers?', 'text', 1, true, 'Customers'),
('bbbbbbbb-0002-bbbb-bbbb-bbbbbbbbbbbb', null, 'What is the main action you want visitors to take?', 'radio', 2, true, 'Customers'),

-- Step 3: Website
('cccccccc-0001-cccc-cccc-cccccccccccc', null, 'Which pages do you think you need?', 'checkbox', 1, true, 'Website'),

-- Step 4: Design
('dddddddd-0001-dddd-dddd-dddddddddddd', null, 'What design style do you prefer?', 'radio', 1, true, 'Design'),
('dddddddd-0002-dddd-dddd-dddddddddddd', null, 'Do you have existing branding (logo, colors)?', 'radio', 2, true, 'Design'),

-- Step 5: Features (Tier specific - e.g. E-Commerce only for Premium)
('eeeeeeee-0001-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'What kind of products will you sell?', 'textarea', 1, true, 'Features'),
('eeeeeeee-0002-eeee-eeee-eeeeeeeeeeee', null, 'Do you need a contact form?', 'radio', 2, true, 'Features'),

-- Step 6: Content / Assets
('ffffffff-0001-ffff-ffff-ffffffffffff', null, 'Do you have images ready for the website?', 'radio', 1, true, 'Content')
ON CONFLICT DO NOTHING;

-- 4. Question Options
INSERT INTO question_options (question_id, option_text, display_order) VALUES
-- Customers Q2
('bbbbbbbb-0002-bbbb-bbbb-bbbbbbbbbbbb', 'Call me', 1),
('bbbbbbbb-0002-bbbb-bbbb-bbbbbbbbbbbb', 'Message on WhatsApp', 2),
('bbbbbbbb-0002-bbbb-bbbb-bbbbbbbbbbbb', 'Fill a contact form', 3),
('bbbbbbbb-0002-bbbb-bbbb-bbbbbbbbbbbb', 'Buy products online', 4),

-- Website Q1
('cccccccc-0001-cccc-cccc-cccccccccccc', 'Home', 1),
('cccccccc-0001-cccc-cccc-cccccccccccc', 'About Us', 2),
('cccccccc-0001-cccc-cccc-cccccccccccc', 'Services / Products', 3),
('cccccccc-0001-cccc-cccc-cccccccccccc', 'Gallery', 4),
('cccccccc-0001-cccc-cccc-cccccccccccc', 'Contact', 5),

-- Design Q1
('dddddddd-0001-dddd-dddd-dddddddddddd', 'Simple & Clean', 1),
('dddddddd-0001-dddd-dddd-dddddddddddd', 'Modern & Bold', 2),
('dddddddd-0001-dddd-dddd-dddddddddddd', 'Professional & Corporate', 3),
('dddddddd-0001-dddd-dddd-dddddddddddd', 'I don''t know — help me decide', 4),

-- Design Q2
('dddddddd-0002-dddd-dddd-dddddddddddd', 'Yes, I have everything ready', 1),
('dddddddd-0002-dddd-dddd-dddddddddddd', 'No, I need help with branding', 2),

-- Features Q2
('eeeeeeee-0002-eeee-eeee-eeeeeeeeeeee', 'Yes', 1),
('eeeeeeee-0002-eeee-eeee-eeeeeeeeeeee', 'No', 2),

-- Content Q1
('ffffffff-0001-ffff-ffff-ffffffffffff', 'Yes, I will provide them', 1),
('ffffffff-0001-ffff-ffff-ffffffffffff', 'No, please use stock photos', 2)
ON CONFLICT DO NOTHING;
