DO $$ BEGIN
    CREATE POLICY "Allow authenticated uploads to ocorrencias"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'ocorrencias');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public read from ocorrencias"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'ocorrencias');
EXCEPTION WHEN OTHERS THEN NULL; END $$;
