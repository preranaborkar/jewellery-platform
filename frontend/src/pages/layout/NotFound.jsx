import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E4D4C8' }}>
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold mb-4" style={{ color: '#523A28' }}>
          404
        </h1>
        <h2 className="text-2xl mb-4" style={{ color: '#A47551' }}>
          Page Not Found
        </h2>
        <p className="mb-8" style={{ color: '#A47551' }}>
          The page you're looking for doesn't exist.
        </p>
        
        <div className="space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-lg"
            style={{ backgroundColor: '#523A28', color: '#E4D4C8' }}
          >
            Go Back
          </button>
          
          <Link
            to="/"
            className="px-6 py-3 rounded-lg border inline-block"
            style={{ borderColor: '#A47551', color: '#523A28' }}
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;