import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const withAdminAuth = (Component) => {
  return (props) => {
    const { user } = useAuth();

    // Allow access only if the email matches the admin's email
    if (user?.email !== 'halfmage@gmail.com') {
      return <Navigate to="/" />;
    }

    return <Component {...props} />;
  };
};

export default withAdminAuth;
