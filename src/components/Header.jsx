import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = user?.email === 'halfmage@gmail.com';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName = user?.user_metadata?.display_name;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const AvatarDisplay = () => (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-gray-500 text-sm">
          {displayName ? displayName[0].toUpperCase() : '?'}
        </span>
      )}
    </div>
  );

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
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <span>{t('header.profile')}</span>
                  <AvatarDisplay />
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
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 py-2"
                  onClick={closeMenu}
                >
                  <span>{t('header.profile')}</span>
                  <AvatarDisplay />
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
