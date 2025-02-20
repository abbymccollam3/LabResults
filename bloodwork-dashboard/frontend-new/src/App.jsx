import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AllResults from './pages/AllResults';
import PrimaryConcerns from './pages/PrimaryConcerns';

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav className="bg-blue-600 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-white text-xl font-bold">Blood Work Dashboard</h1>
            <div className="space-x-4">
              <Link to="/" className="text-white hover:text-blue-200">All Results</Link>
              <Link to="/concerns" className="text-white hover:text-blue-200">Primary Concerns</Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<AllResults />} />
            <Route path="/concerns" element={<PrimaryConcerns />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App; 