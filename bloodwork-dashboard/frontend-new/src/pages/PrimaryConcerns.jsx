import React from 'react';

function PrimaryConcerns() {
  const concerns = [
    { 
      id: 1, 
      name: 'Potassium (K)', 
      value: '5.8', 
      unit: 'mEq/L', 
      status: 'high',
      normalRange: '3.5-5.0',
      risk: 'Hyperkalemia may indicate kidney dysfunction or other metabolic issues.',
      recommendation: 'Immediate follow-up recommended. Avoid high-potassium foods.'
    },
    { 
      id: 2, 
      name: 'Glucose', 
      value: '180', 
      unit: 'mg/dL', 
      status: 'high',
      normalRange: '70-99',
      risk: 'Elevated blood sugar may indicate pre-diabetes or diabetes.',
      recommendation: 'Schedule follow-up with primary care. Monitor diet and exercise.'
    },
    { 
      id: 3, 
      name: 'Creatinine', 
      value: '2.1', 
      unit: 'mg/dL', 
      status: 'high',
      normalRange: '0.7-1.3',
      risk: 'Elevated creatinine suggests possible kidney function issues.',
      recommendation: 'Consult with nephrologist. Increase water intake.'
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Primary Concerns</h2>
      <div className="space-y-4">
        {concerns.map(concern => (
          <div 
            key={concern.id} 
            className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500"
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrimaryConcerns; 