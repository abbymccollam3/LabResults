import React, { useState, useEffect } from 'react';
import { SpeakerWaveIcon } from '@heroicons/react/24/solid';

function AllResults() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8000/bloodwork/all');
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const handleAudioPlay = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">All Blood Work Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(metric => (
          <div 
            key={metric.metric_id} 
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-blue-800"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{metric.name}</h3>
              <div className="flex items-center">
                <div className="text-xl font-bold text-blue-800 mr-2">
                  {metric.value}
                  <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  metric.status === 'normal' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {metric.status}
                </span>
              </div>
            </div>
            {metric.audio_url && (
              <button
                title="Play Audio Explanation"
                onClick={() => handleAudioPlay(metric.audio_url)}
                className="absolute bottom-4 right-4 p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <SpeakerWaveIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllResults; 