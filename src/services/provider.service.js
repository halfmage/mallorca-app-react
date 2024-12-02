import { supabase } from '../utils/supabaseClient';

export const ProviderService = {
  // Get a single provider by ID with full details
  async getProviderById(id) {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        id,
        name,
        status,
        maincategory_id,
        maincategories (
          id,
          name
        ),
        provider_images (
          id,
          image_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.processProviderImages(data);
  },

  // Get provider by user ID (for dashboard)
  async getProviderByUserId(userId) {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        *,
        maincategory:maincategory_id(name),
        subcategory:subcategory_id(name)
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get recent providers for home page
  async getRecentProviders(limit = 12) {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        id,
        name,
        status,
        maincategory_id,
        maincategories (
          id,
          name
        ),
        provider_images (
          id,
          image_url
        )
      `)
      .in('status', ['active', 'pending'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return Promise.all(data.map(provider => this.processProviderImages(provider)));
  },

  // Get provider statistics
  async getProviderStats(providerId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [savesData, recentViewsData, totalViewsData] = await Promise.all([
      supabase
        .from('saved_providers')
        .select('*', { count: 'exact' })
        .eq('provider_id', providerId),
      
      supabase
        .from('provider_views')
        .select('*', { count: 'exact' })
        .eq('provider_id', providerId)
        .gte('viewed_at', thirtyDaysAgo.toISOString()),
      
      supabase
        .from('provider_views')
        .select('*', { count: 'exact' })
        .eq('provider_id', providerId)
    ]);

    return {
      totalSaves: savesData.count || 0,
      recentViews: recentViewsData.count || 0,
      totalViews: totalViewsData.count || 0
    };
  },

  // Save/unsave provider
  async toggleSaveProvider(userId, providerId) {
    const { data: existing } = await supabase
      .from('saved_providers')
      .select('id')
      .eq('user_id', userId)
      .eq('provider_id', providerId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('saved_providers')
        .delete()
        .eq('user_id', userId)
        .eq('provider_id', providerId);

      if (error) throw error;
      return false; // Provider is now unsaved
    } else {
      const { error } = await supabase
        .from('saved_providers')
        .insert([{ user_id: userId, provider_id: providerId }]);

      if (error) throw error;
      return true; // Provider is now saved
    }
  },

  // Get saved providers for a user
  async getSavedProviders(userId) {
    const { data, error } = await supabase
      .from('saved_providers')
      .select(`
        provider_id,
        providers (
          id,
          name,
          maincategory_id,
          maincategories (
            name
          ),
          provider_images (
            id,
            image_url
          )
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return Promise.all(data.map(item => this.processProviderImages(item.providers)));
  },

  // Get saved users for a provider
  async getSavedUsersForProvider(providerId) {
    const { data, error } = await supabase
      .from('saved_providers')
      .select(`
        created_at,
        user:user_id (
          id,
          email,
          raw_user_meta_data->full_name as full_name
        )
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Helper method to process provider images
  async processProviderImages(provider) {
    if (!provider) return null;
    
    const firstImage = provider.provider_images?.[0];
    if (firstImage) {
      const { data: publicUrlData } = supabase.storage
        .from('provider-images')
        .getPublicUrl(firstImage.image_url);
      
      return {
        ...provider,
        firstImage: publicUrlData.publicUrl
      };
    }
    return provider;
  }
}; 