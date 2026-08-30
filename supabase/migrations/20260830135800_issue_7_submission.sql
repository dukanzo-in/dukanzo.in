-- Migration for Issue 7: Submission and SRS canonical data

ALTER TABLE project_requests
ADD COLUMN request_reference TEXT UNIQUE,
ADD COLUMN canonical_srs_data JSONB;
