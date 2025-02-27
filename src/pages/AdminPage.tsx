import React, { useEffect, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface AudioFile {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

export default function AdminPage() {
  const { session } = useAuth();
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAudioFiles();
  }, []);

  const fetchAudioFiles = async () => {
    const { data, error } = await supabase
      .from('audio_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error fetching audio files');
      return;
    }

    setAudioFiles(data || []);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session?.user.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicURL } = supabase.storage
        .from('audio')
        .getPublicUrl(filePath);

      // Save file metadata to database
      const { error: dbError } = await supabase.from('audio_files').insert({
        name: file.name,
        url: publicURL.publicUrl,
        created_by: session?.user.id,
      });

      if (dbError) {
        throw dbError;
      }

      toast.success('Audio file uploaded successfully');
      fetchAudioFiles();
    } catch (error) {
      toast.error('Error uploading file');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('audio_files').delete().eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Audio file deleted successfully');
      fetchAudioFiles();
    } catch (error) {
      toast.error('Error deleting file');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

        <div className="bg-navy-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-navy-700 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">MP3 (MAX. 10MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="audio/mp3"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <div className="bg-navy-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Uploaded Audio Files</h2>
          <div className="space-y-4">
            {audioFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-navy-700 p-4 rounded-lg"
              >
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <audio src={file.url} controls className="h-8" />
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}