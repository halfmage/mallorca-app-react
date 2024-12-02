import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../utils/supabaseClient';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = user?.email === 'halfmage@gmail.com';

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold" onClick={closeMenu}>
            {t('header.title')}
          </Link>

          {/* Hamburger Menu Button (Mobile) */}
          <button
            className="md:hidden p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {t('header.admin')}
                  </Link>
                )}
                <Link
                  to="/saved"
                  className="text-gray-600 hover:text-gray-900"
                >
                  {t('header.savedProviders')}
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-gray-900"
                >
                  {t('header.profile')}
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900"
              >
                {t('header.signIn')}
              </Link>
            )}
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden ${
            isMenuOpen ? 'block' : 'hidden'
          } pb-4`}
        >
          <nav className="flex flex-col space-y-3">
            <LanguageSwitcher />
            {user ? (
              <>
                <Link
                  to="/saved"
                  className="text-gray-600 hover:text-gray-900 py-2"
                  onClick={closeMenu}
                >
                  {t('header.savedProviders')}
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-gray-900 py-2"
                  onClick={closeMenu}
                >
                  {t('header.profile')}
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-gray-900 py-2"
                    onClick={closeMenu}
                  >
                    {t('header.admin')}
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 py-2 text-left"
                >
                  {t('header.signOut')}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 py-2"
                onClick={closeMenu}
              >
                {t('header.signIn')}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
