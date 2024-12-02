import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isProvider } from '../utils/userTypeUtils';
import { useAuth } from '../hooks/useAuth';

const withProviderAuth = (WrappedComponent) => {
  return function WithProviderAuthComponent(props) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        if (!user) {
          navigate('/login');
          return;
        }

        const authorized = await isProvider(user.id);
        if (!authorized) {
          navigate('/');
          return;
        }

        setIsAuthorized(true);
        setLoading(false);
      };

      checkAuth();
    }, [user, navigate]);

    if (loading) {
      return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
    }

    return isAuthorized ? <WrappedComponent {...props} /> : null;
  };
};

export default withProviderAuth; 