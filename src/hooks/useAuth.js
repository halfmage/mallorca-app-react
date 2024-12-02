import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutMessage, setLogoutMessage] = useState(null);

  const logout = async (navigate, t) => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error.message);
        return false;
      }

      setUser(null);
      setLogoutMessage(t('profile.logoutSuccess'));
      navigate('/');
      
      // Clear the logout message after 3 seconds
      setTimeout(() => {
        setLogoutMessage(null);
      }, 3000);

      return true;
    } catch (error) {
      console.error('Unexpected logout error:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      const { data: session, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error.message);
      } else {
        const user = session?.user;
        if (user) {
          // Fetch the full user object from the `auth.users` table
          const { data: userData, error: userError } = await supabase
            .from('auth.users')
            .select('id, email, is_super_admin')
            .eq('id', user.id)
            .single();

          if (userError) {
            console.error('Error fetching user data:', userError.message);
          } else {
            setUser(userData); // Update the user state with the full user object
          }
        }
      }
      setLoading(false);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      logout,
      logoutMessage 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
