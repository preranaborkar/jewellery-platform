import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const location = useLocation();

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

  return <div>Welcome to Dashboard</div>;
};

export default Dashboard;
