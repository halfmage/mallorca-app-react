import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { requireProvider } from '../utils/userTypeUtils';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSaves: 0,
    totalViews: 0,
    recentViews: 0
  });
  const [savedUsers, setSavedUsers] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [provider, setProvider] = useState(null);

  const fetchProviderDetails = useCallback(async () => {
    if (!user) return;

    try {
      // Get provider details
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select(`
          *,
          maincategory:maincategory_id(name),
          subcategory:subcategory_id(name)
        `)
        .eq('user_id', user.id)
        .single();

      if (providerError) throw providerError;
      setProvider(providerData);

      // Get subscription details
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('provider_id', providerData.id)
        .single();

      if (subError && subError.code !== 'PGRST116') throw subError;
      setSubscription(subData);

      // Get saved users count
      const { count: savesCount, error: savesError } = await supabase
        .from('saved_providers')
        .select('*', { count: 'exact' })
        .eq('provider_id', providerData.id);

      if (savesError) throw savesError;

      // Get views count (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentViewsCount, error: viewsError } = await supabase
        .from('provider_views')
        .select('*', { count: 'exact' })
        .eq('provider_id', providerData.id)
        .gte('viewed_at', thirtyDaysAgo.toISOString());

      if (viewsError) throw viewsError;

      // Get total views
      const { count: totalViewsCount, error: totalViewsError } = await supabase
        .from('provider_views')
        .select('*', { count: 'exact' })
        .eq('provider_id', providerData.id);

      if (totalViewsError) throw totalViewsError;

      setStats({
        totalSaves: savesCount || 0,
        totalViews: totalViewsCount || 0,
        recentViews: recentViewsCount || 0
      });

      // Get saved users with their details
      const { data: savedUsersData, error: savedUsersError } = await supabase
        .from('saved_providers')
        .select(`
          created_at,
          user:user_id (
            id,
            email,
            raw_user_meta_data->full_name as full_name
          )
        `)
        .eq('provider_id', providerData.id)
        .order('created_at', { ascending: false });

      if (savedUsersError) throw savedUsersError;
      setSavedUsers(savedUsersData);

    } catch (error) {
      console.error('Error fetching provider details:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await requireProvider(navigate);
      if (hasAccess) {
        fetchProviderDetails();
      }
    };
    checkAccess();
  }, [navigate, fetchProviderDetails]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('providerDashboard.stats.totalSaves')}</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalSaves}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('providerDashboard.stats.totalViews')}</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalViews}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('providerDashboard.stats.recentViews')}</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.recentViews}</p>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t('providerDashboard.subscription.title')}</h2>
          <button
            onClick={() => navigate('/subscription')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {subscription ? t('providerDashboard.subscription.manage') : t('providerDashboard.subscription.subscribe')}
          </button>
        </div>
        {subscription ? (
          <div>
            <p className="text-gray-600">
              {t('providerDashboard.subscription.status', {
                status: subscription.status,
                date: new Date(subscription.current_period_end).toLocaleDateString()
              })}
            </p>
          </div>
        ) : (
          <p className="text-gray-600">{t('providerDashboard.subscription.noSubscription')}</p>
        )}
      </div>

      {/* Saved Users */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">{t('providerDashboard.savedUsers.title')}</h2>
        {savedUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('providerDashboard.savedUsers.table.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('providerDashboard.savedUsers.table.savedDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('providerDashboard.savedUsers.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {savedUsers.map((saved) => (
                  <tr key={saved.user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {saved.user.full_name || saved.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(saved.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => {/* TODO: Implement messaging */}}
                      >
                        {t('providerDashboard.savedUsers.table.message')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">{t('providerDashboard.savedUsers.noUsers')}</p>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
