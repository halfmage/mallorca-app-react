import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabaseClient';
import AddProvider from '../components/AddProvider';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAdmin = user?.email === 'halfmage@gmail.com';
  const [activeTab, setActiveTab] = useState('providers');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchProviders();
    }
  }, [isAdmin]);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select(`
          id,
          name,
          status,
          maincategory_id,
          maincategories (
            name
          ),
          provider_images (
            id,
            image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get public URLs for first images
      const providersWithImages = await Promise.all(data.map(async (provider) => {
        if (provider.provider_images && provider.provider_images[0]) {
          const { data: publicUrlData } = supabase.storage
            .from('provider-images')
            .getPublicUrl(provider.provider_images[0].image_url);
          return {
            ...provider,
            firstImage: publicUrlData.publicUrl
          };
        }
        return provider;
      }));

      setProviders(providersWithImages || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
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
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('providers')}
            className={`${
              activeTab === 'providers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
          >
            {t('admin.providerList')}
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`${
              activeTab === 'add'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
          >
            {t('admin.addProvider')}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'providers' ? (
        <div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {loading ? (
              <p className="p-4">{t('common.loading')}</p>
            ) : providers.length === 0 ? (
              <p className="p-4">{t('admin.noProviders')}</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {providers.map((provider) => (
                  <li key={provider.id}>
                    <div className="flex items-center p-4 hover:bg-gray-50">
                      {/* Provider Image */}
                      <div className="flex-shrink-0 h-16 w-16 mr-4">
                        {provider.firstImage ? (
                          <img
                            src={provider.firstImage}
                            alt={provider.name}
                            className="h-16 w-16 object-cover rounded"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded">
                            <span className="text-gray-400 text-sm">
                              {t('common.noImage')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Provider Info */}
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium">{provider.name}</h3>
                        <p className="text-sm text-gray-500">
                          {provider.maincategories?.name}
                        </p>
                        <p className="text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            provider.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {provider.status}
                          </span>
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex-shrink-0 space-x-2">
                        <button
                          onClick={() => navigate(`/provider/${provider.id}`)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {t('admin.viewDetails')}
                        </button>
                        <button
                          onClick={() => navigate(`/admin/edit-provider/${provider.id}`)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {t('admin.edit')}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <AddProvider onSuccess={fetchProviders} />
      )}
    </div>
  );
};

export default AdminDashboard;
