DROP POLICY IF EXISTS "Qualquer um pode ver ocorrências públicas" ON public.ocorrencias;

CREATE POLICY "Cidadão vê suas próprias ocorrências"
ON public.ocorrencias
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow public read from ocorrencias" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to ocorrencias" ON storage.objects;

CREATE POLICY "Ocorrencias: dono lê seus arquivos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'ocorrencias'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'gestor'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Ocorrencias: dono envia na própria pasta"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ocorrencias'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Ocorrencias: dono atualiza seus arquivos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'ocorrencias' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'ocorrencias' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Ocorrencias: dono remove seus arquivos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'ocorrencias' AND (storage.foldername(name))[1] = auth.uid()::text);