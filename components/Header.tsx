'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

import { CircleUserRound, Heart, Inbox, MessagesSquare, LayoutDashboard, Settings } from 'lucide-react';


const Header = ({ user, isAdmin, newMessagesCount, hasProviders }) => {
  const { t, i18n: { language } } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const avatarUrl = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.display_name

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const AvatarDisplay = () => (
    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
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
    <header className="bg-white dark:bg-gray-900 shadow-sm relative z-50">
      <div className="container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${language}`} className="text-xl font-bold" onClick={closeMenu}>
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
          <nav className="hidden md:flex items-center gap-1 text-xs *:opacity-70 *:p-1.5 *:px-2.5 *:rounded-lg *:flex *:flex-col *:items-center">
            {user ? (
              <>
                {isAdmin && (
                  <Link href={`/${language}/admin`} className="hover:bg-gray-50 hover:opacity-100">
                    <Settings size={24} strokeWidth={1.5} />
                    {t('header.admin')}
                  </Link>
                )}
                {hasProviders && (
                    <Link href={`/${language}/dashboard`} className="hover:bg-gray-50 hover:opacity-100">
                      <LayoutDashboard size={24} strokeWidth={1.5} />
                      Dashboard
                    </Link>
                )}
                {hasProviders && (
                    <Link href={`/${language}/messages`} className="hover:bg-gray-50 hover:opacity-100">
                      <MessagesSquare size={24} strokeWidth={1.5} />
                      {t('header.messages')}
                    </Link>
                )}
                <Link href={`/${language}/my-messages`} className="hover:bg-gray-50 hover:opacity-100">
                  <Inbox size={24} strokeWidth={1.5} />
                  {t('header.myMessages')} {newMessagesCount > 0 && `(${newMessagesCount})`}
                </Link>
                <Link href={`/${language}/saved`} className="hover:bg-gray-50 hover:opacity-100">
                  <Heart size={24} strokeWidth={1.5} />
                  {t('header.savedProviders')}
                </Link>
                <LanguageSwitcher />
                <Link href={`/${language}/profile`} className="hover:bg-gray-50 hover:opacity-100">
                  <AvatarDisplay />
                  <span>{t('header.profile')}</span>
                </Link>
              </>
            ) : (
              <>  
                <LanguageSwitcher />
                <Link href={`/${language}/login`} className="hover:bg-gray-50 hover:opacity-100">
                  <CircleUserRound size={24} strokeWidth={1.5} />
                  {t('header.signIn')}
                </Link>
              </>
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
                  href={`/${language}/saved`}
                  className="text-gray-600 dark hover:opacity-75 py-2"
                  onClick={closeMenu}
                >
                  {t('header.savedProviders')}
                </Link>
                <Link
                  href={`/${language}/profile`}
                  className="flex items-center space-x-2 text-gray-600 dark hover:opacity-75 py-2"
                  onClick={closeMenu}
                >
                  <span>{t('header.profile')}</span>
                  <AvatarDisplay />
                </Link>
                {isAdmin && (
                  <Link
                    href={`/${language}/admin`}
                    className="text-gray-600 dark hover:opacity-75 py-2"
                    onClick={closeMenu}
                  >
                    {t('header.admin')}
                  </Link>
                )}
              </>
            ) : (
              <Link
                href={`/${language}/login`}
                className="text-gray-600 dark hover:opacity-75 py-2"
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
