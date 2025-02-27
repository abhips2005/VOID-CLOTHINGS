import React, { useEffect, useState } from 'react';
import { Instagram, Phone, Volume2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AudioFile {
  id: string;
  name: string;
  url: string;
}

export default function HomePage() {
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchLatestAudio = async () => {
      const { data, error } = await supabase
        .from('audio_files')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching audio:', error);
        return;
      }

      if (data && data.length > 0) {
        setAudioFile(data[0]);
      }
    };

    fetchLatestAudio();
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold tracking-tighter mb-4">VOID</h1>
          <p className="text-xl text-gray-300">Redefining Style, Embracing Elegance</p>
        </header>

        <div className="max-w-2xl mx-auto bg-navy-800 rounded-lg p-8 shadow-xl mb-16">
          <div className="flex items-center justify-center mb-8">
            <button
              onClick={togglePlay}
              className="bg-white text-navy-900 rounded-full p-6 hover:bg-gray-200 transition-colors"
              disabled={!audioFile}
            >
              <Volume2 size={32} />
            </button>
          </div>
          {audioFile && (
            <audio
              ref={audioRef}
              src={audioFile.url}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}
          <p className="text-center text-gray-300">
            {audioFile 
              ? `Click to ${isPlaying ? 'pause' : 'play'} usage instructions`
              : 'No audio instructions available'}
          </p>
        </div>

        <footer className="text-center">
          <div className="flex justify-center space-x-8 mb-8">
            <a
              href="https://www.instagram.com/the_void.2025?igsh=cHo1cnpvazk5eXJp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
            >
              <Instagram size={24} />
            </a>
            <a
              href="tel:1234567890"
              className="text-white hover:text-gray-300 transition-colors"
            >
              <Phone size={24} />
            </a>
          </div>
          <p className="text-gray-400">Contact us: 1234567890</p>
        </footer>
      </div>
    </div>
  );
}