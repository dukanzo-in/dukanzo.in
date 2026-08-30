-- Migration for Issue 6: SRS Builder

ALTER TABLE requirement_questions
ADD COLUMN step_group TEXT NOT NULL DEFAULT 'Business'; -- 'Business', 'Customers', 'Website', 'Design', 'Features', 'Content'
