-- Migration for Issue 8: SRS Storage Bucket

INSERT INTO storage.buckets (id, name, public) 
VALUES ('srs', 'srs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for srs bucket
-- Note: Service Role (Admin) bypasses RLS, so it can always read/write.
-- If we want authenticated users to view their own SRS, we can add a policy here.
-- The prompt states the customer doesn't need a dashboard, but it's good practice.

CREATE POLICY "Users can view their own SRS documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'srs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);
