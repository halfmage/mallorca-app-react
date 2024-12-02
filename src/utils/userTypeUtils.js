import { supabase } from './supabaseClient';

export const updateUserType = async (userId, userType) => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: { user_type: userType }
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating user type:', error);
    return { success: false, error };
  }
};

export const getUserType = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.user_metadata?.user_type || 'user';
  } catch (error) {
    console.error('Error getting user type:', error);
    return 'user';
  }
};

export const isProvider = async () => {
  const userType = await getUserType();
  return userType === 'provider';
};

export const requireProvider = async (navigate) => {
  const userType = await getUserType();
  if (userType !== 'provider') {
    navigate('/');
    return false;
  }
  return true;
};
