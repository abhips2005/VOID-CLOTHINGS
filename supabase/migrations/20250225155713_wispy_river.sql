/*
  # Fix Storage Policies

  1. Changes
    - Add storage policies for the audio bucket
    - Fix RLS policies for audio_files table
    
  2. Security
    - Allow public read access to audio files
    - Allow authenticated users to upload and manage audio files
*/

-- Storage policies
BEGIN;

-- Create policies for the audio bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('audio', 'audio', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Policy to allow authenticated users to upload files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Authenticated users can upload audio files'
  ) THEN
    CREATE POLICY "Authenticated users can upload audio files"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'audio' AND
      auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- Policy to allow public to download files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Public can download audio files'
  ) THEN
    CREATE POLICY "Public can download audio files"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'audio');
  END IF;
END $$;

-- Policy to allow authenticated users to delete their files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Users can delete own audio files'
  ) THEN
    CREATE POLICY "Users can delete own audio files"
    ON storage.objects FOR DELETE TO authenticated
    USING (
      bucket_id = 'audio' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

COMMIT;