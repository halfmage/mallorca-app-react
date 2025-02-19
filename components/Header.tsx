'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

import { CircleUserRound, Heart, Inbox, MessagesSquare, LayoutDashboard, Settings, Search, X } from 'lucide-react';
import ProviderSearch from '@/components/ProviderSearch'

type HeaderProps = {
    user: any // eslint-disable-line @typescript-eslint/no-explicit-any
    isAdmin: boolean
    newMessagesCount: number
    hasProviders: boolean
}

const Header = ({ user, isAdmin, newMessagesCount, hasProviders }: HeaderProps) => {
  const { t, i18n: { language } } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const avatarUrl = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.display_name

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    if (isSearchOpen) setIsSearchOpen(false)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    if (isMenuOpen) setIsMenuOpen(false)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
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
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-950 relative z-40">
      <div className="container">
        <div className="flex justify-between items-center h-16 gap-2">
          <Link href={`/${language}`} className="text-xl font-bold shrink-0 text-black dark:text-white transition-colors" onClick={closeMenu}>
            <img src="/logo.svg" alt={t('header.title')} className="h-8 md:h-10" />
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <ProviderSearch />
          </div>

          {/* Mobile Search & Menu Buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <button 
              className="p-2" 
              onClick={toggleSearch} 
              aria-label={isSearchOpen ? "Close search" : "Open search"}
            >
              {isSearchOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Search className="w-6 h-6" />
              )}
            </button>
            <button 
              className="p-2" 
              onClick={toggleMenu} 
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-xs *:opacity-70 *:p-1.5 *:px-2.5 *:rounded-lg *:flex *:flex-col *:items-center">
            {user ? (
              <>
                {isAdmin && (
                  <Link href={`/${language}/admin`} className="hover:opacity-100">
                    <Settings size={24} strokeWidth={1.5} />
                    {t('header.admin')}
                  </Link>
                )}
                {hasProviders && (
                    <Link href={`/${language}/dashboard`} className="hover:opacity-100">
                      <LayoutDashboard size={24} strokeWidth={1.5} />
                      Dashboard
                    </Link>
                )}
                {hasProviders && (
                    <Link href={`/${language}/messages`} className="hover:opacity-100">
                      <MessagesSquare size={24} strokeWidth={1.5} />
                      {t('header.messages')}
                    </Link>
                )}
                <Link href={`/${language}/my-messages`} className="hover:opacity-100">
                  <Inbox size={24} strokeWidth={1.5} />
                  {t('header.myMessages')} {newMessagesCount > 0 && `(${newMessagesCount})`}
                </Link>
                <Link href={`/${language}/saved`} className="hover:opacity-100">
                  <Heart size={24} strokeWidth={1.5} />
                  {t('header.savedProviders')}
                </Link>
                <LanguageSwitcher />
                <Link href={`/${language}/profile`} className="hover:opacity-100">
                  <AvatarDisplay />
                  <span>{t('header.profile')}</span>
                </Link>
              </>
            ) : (
              <>  
                <LanguageSwitcher />
                <Link href={`/${language}/login`} className="hover:opacity-100">
                  <CircleUserRound size={24} strokeWidth={1.5} />
                  {t('header.signIn')}
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <ProviderSearch />
          </div>
        )}

        {/* Mobile Navigation */}
        <div
          className={`md:hidden fixed inset-x-0 top-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-all duration-200 ease-in-out ${
            isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
          }`}
        >
          <nav className="container py-4 flex flex-col space-y-1">
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href={`/${language}/admin`}
                    className="flex items-center gap-3 p-3 rounded-lg dark:hover:bg-gray-800"
                    onClick={closeMenu}
                  >
                    <Settings size={20} strokeWidth={1.5} />
                    <span>{t('header.admin')}</span>
                  </Link>
                )}
                {hasProviders && (
                  <>
                    <Link
                      href={`/${language}/dashboard`}
                      className="flex items-center gap-3 p-3 rounded-lg dark:hover:bg-gray-800"
                      onClick={closeMenu}
                    >
                      <LayoutDashboard size={20} strokeWidth={1.5} />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href={`/${language}/messages`}
                      className="flex items-center gap-3 p-3 rounded-lg dark:hover:bg-gray-800"
                      onClick={closeMenu}
                    >
                      <MessagesSquare size={20} strokeWidth={1.5} />
                      <span>{t('header.messages')}</span>
                    </Link>
                  </>
                )}
                <Link
                  href={`/${language}/my-messages`}
                  className="flex items-center gap-3 p-3 rounded-lg dark:hover:bg-gray-800"
                  onClick={closeMenu}
                >
                  <div className="relative">
                    <Inbox size={20} strokeWidth={1.5} />
                    {newMessagesCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {newMessagesCount}
                      </span>
                    )}
                  </div>
                  <span>{t('header.myMessages')}</span>
                </Link>
                <Link
                  href={`/${language}/saved`}
                  className="flex items-center gap-3 p-3 rounded-lg dark:hover:bg-gray-800"
                  onClick={closeMenu}
                >
                  <Heart size={20} strokeWidth={1.5} />
                  <span>{t('header.savedProviders')}</span>
                </Link>
                <div className="p-3">
                  <LanguageSwitcher />
                </div>
                <Link
                  href={`/${language}/profile`}
                  className="flex items-center gap-3 p-3 rounded-lg dark:hover:bg-gray-800"
                  onClick={closeMenu}
                >
                  <AvatarDisplay />
                  <span>{t('header.profile')}</span>
                </Link>
              </>
            ) : (
              <>
                <div className="p-3">
                  <LanguageSwitcher />
                </div>
                <Link
                  href={`/${language}/login`}
                  className="flex items-center gap-3 p-3 rounded-lg dark:hover:bg-gray-800"
                  onClick={closeMenu}
                >
                  <CircleUserRound size={20} strokeWidth={1.5} />
                  <span>{t('header.signIn')}</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
