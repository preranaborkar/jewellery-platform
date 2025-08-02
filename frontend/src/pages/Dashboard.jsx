import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Dashboard = () => {
  const location = useLocation();

  const { isAdmin, isAuthenticated } = useAuth();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const user = params.get('user');

    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
      window.history.replaceState({}, document.title, '/dashboard'); // Clean URL
    }
  }, [location]);

  // Check authorization
  if (!isAuthenticated ) {
    return (
      <div className="min-h-screen bg-[#E4D4C8] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-[#523A28] mb-4 text-center">
            Access Denied
          </h2>
          <p className="text-[#A47551] text-center">
            Authentication require!
          </p>
        </div>
      </div>
    );
  }

  return <div>Welcome to Dashboard</div>;
};

export default Dashboard;
