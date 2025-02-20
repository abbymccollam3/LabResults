import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BloodworkDashboard from './pages/BloodworkDashboard';
import Concerns from './pages/Concerns';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<BloodworkDashboard />} />
            <Route path="/concerns" element={<Concerns />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 