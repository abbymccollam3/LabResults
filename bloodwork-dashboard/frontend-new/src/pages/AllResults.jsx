import React from 'react';

function AllResults() {
  const metrics = [
    { id: 1, name: 'Sodium (Na)', value: '140', unit: 'mEq/L', status: 'normal' },
    { id: 2, name: 'Potassium (K)', value: '4.0', unit: 'mEq/L', status: 'normal' },
    { id: 3, name: 'Chloride (Cl)', value: '102', unit: 'mEq/L', status: 'normal' },
    { id: 4, name: 'Bicarbonate (CO2)', value: '24', unit: 'mEq/L', status: 'normal' },
    { id: 5, name: 'Blood Urea Nitrogen (BUN)', value: '15', unit: 'mg/dL', status: 'normal' },
    { id: 6, name: 'Creatinine', value: '0.9', unit: 'mg/dL', status: 'normal' },
    { id: 7, name: 'Glucose', value: '95', unit: 'mg/dL', status: 'normal' },
    { id: 8, name: 'Calcium', value: '9.5', unit: 'mg/dL', status: 'normal' },
    { id: 9, name: 'Total Protein', value: '7.0', unit: 'g/dL', status: 'normal' },
    { id: 10, name: 'Albumin', value: '4.0', unit: 'g/dL', status: 'normal' },
    { id: 11, name: 'Total Bilirubin', value: '1.0', unit: 'mg/dL', status: 'normal' },
  ];

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