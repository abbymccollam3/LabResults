import React, { useState, useEffect } from 'react';
import BloodworkCard from '../components/BloodworkCard';

const BloodworkDashboard = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBloodwork = async () => {
      try {
        const patientId = "example-patient-id"; // Replace with actual patient ID
        const response = await fetch(`http://localhost:8000/bloodwork/${patientId}`);
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError('Failed to fetch blood work data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBloodwork();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Blood Work Results</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(metric => (
          <BloodworkCard key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
};

export default BloodworkDashboard; 