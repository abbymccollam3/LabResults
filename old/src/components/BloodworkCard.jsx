import React, { useState } from 'react';
import VoiceButton from './VoiceButton';

const BloodworkCard = ({ metric }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'high': return 'bg-red-100 border-red-500';
      case 'low': return 'bg-yellow-100 border-yellow-500';
      case 'normal': return 'bg-green-100 border-green-500';
      default: return 'bg-gray-100 border-gray-500';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor(metric.status)}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{metric.name}</h3>
        <VoiceButton 
          metricId={metric.id} 
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{metric.value} {metric.unit}</p>
        <p className="text-sm text-gray-600">
          Normal Range: {metric.range_low} - {metric.range_high} {metric.unit}
        </p>
      </div>
    </div>
  );
};

export default BloodworkCard; 