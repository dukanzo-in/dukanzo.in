-- Migration for Issue 5: Tier Configuration Options

ALTER TABLE tier_options
ADD COLUMN input_type TEXT NOT NULL DEFAULT 'checkbox', -- 'checkbox', 'select', 'radio', 'number'
ADD COLUMN choices JSONB, -- Array of strings for select/radio
ADD COLUMN display_name TEXT, -- User-friendly name
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Example:
-- option_key: 'pages'
-- display_name: 'Number of Pages'
-- option_value: '5' (default value)
-- input_type: 'select'
-- choices: '["1", "2", "3", "4", "5"]'
