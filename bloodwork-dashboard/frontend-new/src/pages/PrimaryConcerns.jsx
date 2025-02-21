import React, { useState, useEffect } from 'react';
import { SpeakerWaveIcon } from '@heroicons/react/24/solid';

function PrimaryConcerns() {
  const [concerns, setConcerns] = useState([]);  // State to hold fetched concerns
  const [loading, setLoading] = useState(true);  // For handling loading state

  // Fetch the primary concerns from the API when the component mounts
  useEffect(() => {
    fetch("http://127.0.0.1:8000/bloodwork/primary-concerns") // Backend URL
      .then((response) => response.json()) // Parse response JSON
      .then((data) => {
        console.log("Fetched concerns:", data);  // Log the fetched data

        // Ensure data is an array before setting
        if (Array.isArray(data)) {
          setConcerns(data);  // Set the concerns if the data is an array
        } else {
          console.error("Expected an array but got:", data);
          setConcerns([]);  // Set empty array if the response format is unexpected
        }
        setLoading(false);  // Set loading state to false after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching concerns:", error);  // Handle errors
        setLoading(false);  // Ensure loading state is false on error
      });
  }, []); // Empty dependency array ensures this runs only once when component mounts

  // Log the state to ensure it's set correctly
  console.log("Concerns state:", concerns);

  if (loading) {
    return <div>Loading...</div>; // Display loading message while fetching data
  }

  const handleAudioPlay = (audioUrl) => {
    const audio = new Audio(audioUrl);  // Create a new audio object
    audio.play();  // Play the audio
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Primary Concerns</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {concerns && concerns.length > 0 ? (
          concerns.map((concern) => (
            <div
              key={concern.name}
              className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-800 relative"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{concern.name}</h3>
                <div className="flex items-center">
                  <div className="text-xl font-bold text-blue-800 mr-2">
                    {concern.value}
                    <span className="text-sm text-gray-500 ml-1">{concern.unit}</span>
                  </div>
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm">
                    {concern.status}
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-semibold">Normal Range:</span> {concern.normalRange} {concern.unit}</p>
                <p><span className="font-semibold">Risk:</span> {concern.risk}</p>
                <p><span className="font-semibold">Recommendation:</span> {concern.recommendation}</p>
              </div>
              {concern.audio_url && (
                <button
                  title="Play Audio Explanation"
                  onClick={() => handleAudioPlay(concern.audio_url)}
                  className="absolute bottom-4 right-4 p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <SpeakerWaveIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500">No primary concerns found.</div>
        )}
      </div>
    </div>
  );
}

export default PrimaryConcerns;