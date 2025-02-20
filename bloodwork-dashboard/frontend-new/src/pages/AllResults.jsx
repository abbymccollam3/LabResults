import React, { useState, useEffect } from 'react';
import { fetchBloodwork } from '../services/api';

function AllResults() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBloodwork = async () => {
      try {
        setLoading(true);
        const data = await fetchBloodwork('example-patient-id');
        setMetrics(data);
      } catch (err) {
        setError('Failed to load bloodwork data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBloodwork();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">All Blood Work Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(metric => (
          <div 
            key={metric.id} 
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800">{metric.name}</h3>
            <div className="mt-2 flex justify-between items-center">
              <div className="text-2xl font-bold text-blue-600">
                {metric.value}
                <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                metric.status === 'normal' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {metric.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllResults; 