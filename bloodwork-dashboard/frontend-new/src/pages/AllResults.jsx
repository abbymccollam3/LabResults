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

  const highlightStatus = (status) => {
    if (status === 'high' || status === 'low') {
      // For 'high' or 'low' status, apply red background and text
      return (
        <span className="px-3 py-1.5 rounded-full text-sm bg-red-100 text-red-600 font-bold uppercase tracking-wide">
          {status}
        </span>
      );
    } else {
      // For normal status, apply a simple default color without background
      return (
        <span className="px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-700 font-bold uppercase tracking-wide">
          {status}
        </span>
      );
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">All Blood Work Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map(metric => (
          <div 
            key={metric.metric_id} 
            className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-800 relative"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                {metric.metric_name.includes('Count') ? (
                  <>
                    {metric.metric_name.split('Count')[0]}
                    <div className="text-lg font-semibold text-gray-800">
                      Count {metric.metric_name.split('Count')[1]}
                    </div>
                  </>
                ) : (
                  metric.metric_name
                )}
              </h3>
              <div className="flex items-center">
                <div className="text-xl font-bold text-blue-800 mr-2 whitespace-nowrap">
                  {metric.value}
                  <span className="text-sm text-gray-500 ml-1 whitespace-nowrap">{metric.unit.replace('/', ' / ')}</span>
                </div>
                {highlightStatus(metric.status)}
              </div>
            </div>
            {metric.audio_url && (
              <button
                title="Play Audio Explanation"
                onClick={() => handleAudioPlay(metric.audio_url)}
                className="absolute bottom-1.5 right-4 p-1.5 bg-gray-200 hover:bg-blue-500 rounded-full text-gray-600 hover:text-white transition-colors"
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
