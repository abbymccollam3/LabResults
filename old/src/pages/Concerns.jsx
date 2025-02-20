import React, { useState, useEffect } from 'react';
import BloodworkCard from '../components/BloodworkCard';

const Concerns = () => {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcerns = async () => {
      try {
        const patientId = "example-patient-id"; // Replace with actual patient ID
        const response = await fetch(`http://localhost:8000/bloodwork/${patientId}`);
        const data = await response.json();
        // Filter only abnormal results
        setConcerns(data.filter(metric => metric.status !== 'normal'));
      } catch (err) {
        setError('Failed to fetch concerns');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConcerns();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Primary Concerns</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concerns.map(concern => (
          <BloodworkCard key={concern.id} metric={concern} />
        ))}
      </div>
    </div>
  );
};

export default Concerns; 