import React from 'react';
import { supabase } from '../utils/supabaseClient';

const Logout = () => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert('Error logging out: ' + error.message);
    else alert('Logged out successfully!');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default Logout;
