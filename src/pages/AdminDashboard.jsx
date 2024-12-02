import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabaseClient';
import AddProvider from '../components/AddProvider';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.email === 'halfmage@gmail.com';
  const [payingProviders, setPayingProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchPayingProviders();
    }
  }, [isAdmin]);

  const fetchPayingProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_subscriptions')
        .select(`
          id,
          provider_id,
          status,
          is_admin_approved,
          stripe_subscription_id,
          providers (
            id,
            name,
            email,
            status
          )
        `)
        .eq('status', 'active');

      if (error) throw error;
      setPayingProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveProvider = async (subscriptionId, providerId) => {
    try {
      // Update subscription approval status
      const { error: subError } = await supabase
        .from('provider_subscriptions')
        .update({ is_admin_approved: true })
        .eq('id', subscriptionId);

      if (subError) throw subError;

      // Update provider status
      const { error: provError } = await supabase
        .from('providers')
        .update({ status: 'active' })
        .eq('id', providerId);

      if (provError) throw provError;

      // Refresh the list
      await fetchPayingProviders();
    } catch (error) {
      console.error('Error approving provider:', error);
    }
  };

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
      
      {/* Add Provider Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{t('admin.addProvider')}</h2>
        <AddProvider />
      </div>

      {/* Paying Providers Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{t('admin.payingProviders')}</h2>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : payingProviders.length === 0 ? (
          <p>{t('admin.noPayingProviders')}</p>
        ) : (
          <div className="grid gap-4">
            {payingProviders.map((subscription) => (
              <div 
                key={subscription.id} 
                className="bg-white p-4 rounded-lg shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{subscription.providers.name}</h3>
                    <p className="text-gray-600">{subscription.providers.email}</p>
                    <p className="text-sm">
                      Status: {subscription.is_admin_approved ? 'Approved' : 'Pending Approval'}
                    </p>
                  </div>
                  {!subscription.is_admin_approved && (
                    <button
                      onClick={() => approveProvider(subscription.id, subscription.providers.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      {t('admin.approveAccess')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
