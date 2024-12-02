import React from 'react';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const Layout = ({ children }) => {
  const { logoutMessage } = useAuth();
  const { t } = useTranslation();

  return (
    <>
      <Header />
      {logoutMessage && (
        <div className="bg-green-500 text-white text-center py-3 fixed top-0 left-0 right-0 z-50">
          {logoutMessage}
        </div>
      )}
      <main className="container mx-auto p-4 mt-12">{children}</main>
    </>
  );
};

export default Layout;
