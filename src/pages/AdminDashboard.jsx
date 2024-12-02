import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import AddProvider from '../components/AddProvider';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.email === 'halfmage@gmail.com';

  if (!isAdmin) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-red-500">{t('admin.error.notAdmin')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('admin.dashboard')}</h1>
      <AddProvider />
    </div>
  );
};

export default AdminDashboard;
