import React, { useState, useRef } from 'react';
import { MicrophoneIcon } from '@heroicons/react/24/solid';

function VoiceButton({ metricId }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null); // Use a ref to keep track of the audio element

  const handleVoiceExplanation = async () => {
    try {
      if (isPlaying && audioRef.current) {
        // Stop the audio if it's currently playing
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset audio to the start
        setIsPlaying(false);
      } else {
        // Start playing the audio if not playing
        const response = await fetch(`http://localhost:8000/generate-voice/${metricId}`, {
          method: 'POST'
        });

        if (!response.ok) throw new Error('Failed to generate voice explanation');

        const data = await response.json();

        // Create a new Audio object and set it to the ref
        const audio = new Audio(data.audio_url);
        audioRef.current = audio; // Store the audio in the ref

        // Play the audio
        audio.play();

        // When the audio ends, set isPlaying to false
        audio.onended = () => setIsPlaying(false);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error generating voice:', error);
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handleVoiceExplanation}
      className={`p-3 rounded-full ${
        isPlaying ? 'bg-blue-600' : 'bg-gray-200'
      } hover:bg-blue-500 transition-colors fixed bottom-4 right-4`} // Position the button at the bottom right
      disabled={isPlaying}
    >
      <MicrophoneIcon 
        className={`w-6 h-6 ${
          isPlaying ? 'text-white animate-pulse' : 'text-gray-600'
        }`} 
      />
      {isPlaying ? 'Stop' : 'Play'} {/* Toggle text based on play state */}
    </button>
  );
}

export default VoiceButton;
