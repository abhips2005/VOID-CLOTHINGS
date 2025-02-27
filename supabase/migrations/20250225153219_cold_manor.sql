/*
  # Audio Files Management Schema

  1. New Tables
    - `audio_files`
      - `id` (uuid, primary key)
      - `name` (text)
      - `url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on `audio_files` table
    - Add policies for:
      - Authenticated users can read all audio files
      - Only authenticated users can insert/update/delete their own audio files
*/

CREATE TABLE IF NOT EXISTS audio_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;

-- Policy for reading audio files (public access)
CREATE POLICY "Anyone can view audio files"
  ON audio_files
  FOR SELECT
  USING (true);

-- Policy for inserting audio files (authenticated users only)
CREATE POLICY "Authenticated users can upload audio files"
  ON audio_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Policy for updating own audio files
CREATE POLICY "Users can update own audio files"
  ON audio_files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Policy for deleting own audio files
CREATE POLICY "Users can delete own audio files"
  ON audio_files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);