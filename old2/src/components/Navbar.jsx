import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">
          Blood Work Dashboard
        </div>
        <div className="space-x-4">
          <Link 
            to="/" 
            className="text-white hover:text-blue-200"
          >
            Blood Work
          </Link>
          <Link 
            to="/concerns" 
            className="text-white hover:text-blue-200"
          >
            Concerns
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 