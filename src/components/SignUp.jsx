import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('Signup error:', error);
        setError(error.message);
        return;
      }

      if (data?.user?.identities?.length === 0) {
        setError('An account with this email already exists');
        return;
      }

      // Set initial user metadata after successful signup
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          user_type: 'user'
        }
      });

      if (updateError) {
        console.error('Error setting user type:', updateError);
      }

      setUser(data.user);
      navigate('/profile');

    } catch (err) {
      console.error('Unexpected error during signup:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSignUp}>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Password must be at least 6 characters long
          </p>
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
