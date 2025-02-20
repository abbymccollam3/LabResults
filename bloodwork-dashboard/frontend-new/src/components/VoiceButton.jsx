import React, { useState } from 'react';
import { MicrophoneIcon } from '@heroicons/react/24/solid';

function VoiceButton({ metricId }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVoiceExplanation = async () => {
    try {
      setIsPlaying(true);
      const response = await fetch(`http://localhost:8000/bloodwork/generate-voice/${metricId}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to generate voice explanation');
      
      const data = await response.json();
      // Play the audio
      const audio = new Audio(data.audio_url);
      audio.play();
      
      audio.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error('Error generating voice:', error);
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handleVoiceExplanation}
      className={`p-2 rounded-full ${
        isPlaying ? 'bg-blue-600' : 'bg-gray-200'
      } hover:bg-blue-500 transition-colors`}
      disabled={isPlaying}
    >
      <MicrophoneIcon 
        className={`w-5 h-5 ${
          isPlaying ? 'text-white animate-pulse' : 'text-gray-600'
        }`} 
      />
    </button>
  );
}

export default VoiceButton; 