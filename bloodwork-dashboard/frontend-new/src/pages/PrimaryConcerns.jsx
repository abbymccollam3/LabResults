import React, { useState, useEffect } from 'react';

function PrimaryConcerns() {
  const [concerns, setConcerns] = useState([]);  // Initialize state to store concerns
  const [loading, setLoading] = useState(true); // For handling loading state

  // Fetch the primary concerns from the API when the component mounts
  useEffect(() => {
    fetch("http://127.0.0.1:8000/primary-concerns") // Backend URL
      .then((response) => response.json()) // Parse response JSON
      .then((data) => {
        console.log("Fetched concerns:", data);  // Log the fetched data for debugging

        // Check if data is an array before setting it
        if (Array.isArray(data)) {
          setConcerns(data); // Set the data if it's an array
        } else {
          console.error("Data is not an array:", data);  // Log error if data is not an array
          setConcerns([]);  // Set an empty array if data is not valid
        }

        setLoading(false); // Set loading state to false after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching concerns:", error); // Handle errors
        setLoading(false); // Ensure loading state is false on error
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
      <div className="space-y-4">
        {/* Loop through the fetched concerns data */}
        {concerns.length > 0 ? (
          concerns.map((concern) => (
            <div
              key={concern.id} // Use id as the key for each concern
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 relative"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{concern.name}</h3>
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-red-600 mr-2">
                    {concern.value}
                    <span className="text-sm text-gray-500 ml-1">{concern.unit}</span>
                  </div>
                  <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-sm">
                    {concern.status}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-semibold">Normal Range:</span> {concern.normalRange} {concern.unit}</p>
                <p><span className="font-semibold">Risk:</span> {concern.risk}</p>
                <p><span className="font-semibold">Recommendation:</span> {concern.recommendation}</p>
              </div>
              {/* Button to play the corresponding audio */}
              {concern.audio_url && (
                <button
                  onClick={() => handleAudioPlay(concern.audio_url)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-700"
                >
                  Play Audio
                </button>
              )}
            </div>
          ))
        ) : (
          <div>No primary concerns found.</div>  // Display message if no concerns are found
        )}
      </div>
    </div>
  );
}

export default PrimaryConcerns;
