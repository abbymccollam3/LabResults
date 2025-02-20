import React from 'react';
import { FaVolumeUp } from 'react-icons/fa';

const VoiceButton = ({ metricId, isPlaying, setIsPlaying }) => {
  const handleVoiceExplanation = async () => {
    try {
      setIsPlaying(true);
      const response = await fetch(`http://localhost:8000/generate-voice/${metricId}`, {
        method: 'POST',
      });
      const data = await response.json();
      
      // Play the audio
      const audio = new Audio(data.audio_url);
      audio.onended = () => setIsPlaying(false);
      audio.play();
    } catch (error) {
      console.error('Error generating voice explanation:', error);
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handleVoiceExplanation}
      disabled={isPlaying}
      className={`p-2 rounded-full ${
        isPlaying ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
      } text-white`}
    >
      <FaVolumeUp className="w-5 h-5" />
    </button>
  );
};

export default VoiceButton; 