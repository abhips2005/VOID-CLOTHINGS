/*
  # Setup Storage and Policies

  1. Changes
    - Create audio storage bucket
    - Add storage policies for file management
    
  2. Security
    - Enable public read access
    - Restrict write access to authenticated users
*/

-- Create the audio bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload audio files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'audio');

-- Allow public to download files
CREATE POLICY "Public can download audio files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'audio');

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own audio files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);