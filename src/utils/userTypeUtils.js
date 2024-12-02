import { supabase } from './supabaseClient';

// Check if a user is a provider
export const isProvider = async (userId) => {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error checking provider status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking provider status:', error);
    return false;
  }
};

// Higher-order function to require provider status
export const requireProvider = async (navigate) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/login');
      return false;
    }

    const isUserProvider = await isProvider(user.id);
    if (!isUserProvider) {
      navigate('/');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in requireProvider:', error);
    navigate('/');
    return false;
  }
}; 