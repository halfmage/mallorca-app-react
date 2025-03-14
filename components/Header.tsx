'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

import { Search, X, Menu, User } from 'lucide-react';
import ProviderSearch from '@/components/ProviderSearch'
import PasswordlessCallback from '@/components/SignIn/PasswordlessCallback'

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
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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

  // Handle click outside to close the menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    // Add event listener when menu is open
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const AvatarDisplay = () => (
    <div className="w-8 h-8 rounded overflow-hidden bg-gray-200 flex items-center justify-center">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-gray-500">
          {displayName ? displayName[0].toUpperCase() : '?'}
        </span>
      )}
    </div>
  );

  return (
    <header className="">
      <div className="container">
        <div className="flex justify-between items-center h-20 gap-2">
          <Link href={`/${language}`} className="text-xl font-bold shrink-0 text-black dark:text-white transition-colors" onClick={closeMenu}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 137 40" className='h-8 md:h-10'>
            <path fill="currentColor" fillRule="evenodd" d="M8 0a8 8 0 0 0-8 8v24a8 8 0 0 0 8 8h24a8 8 0 0 0 8-8V8a8 8 0 0 0-8-8H8Zm23.19 10.03c.3 0 .57.15.7.42l.02-.03c.16.27.1.6-.09.8L24.45 20l7.37 8.77c.19.24.22.54.1.81a.8.8 0 0 1-.7.42h-6.87a.75.75 0 0 1-.57-.27l-2.63-3.11a.72.72 0 0 1 .09-1.05.74.74 0 0 1 1.06.09l2.39 2.84h4.9l-6.17-7.33-7.2 8.56a.75.75 0 0 1-.57.27H8.78a.74.74 0 0 1-.7-.42.72.72 0 0 1 .1-.8l6.01-7.13a.76.76 0 0 1 1.06-.1c.3.28.37.73.1 1.05l-4.97 5.9h4.9l7.17-8.5-7.17-8.5h-4.9l8.47 10.06c.27.3.24.78-.09 1.04a.74.74 0 0 1-1.06-.09L8.18 11.24a.78.78 0 0 1-.1-.81.8.8 0 0 1 .7-.42h6.87c.2 0 .42.09.57.27l7.17 8.6 6.17-7.34h-4.9l-2.45 2.93a.76.76 0 0 1-1.06.1.75.75 0 0 1-.1-1.06l2.7-3.2a.75.75 0 0 1 .57-.27h6.87Z" clipRule="evenodd"/>
            <path fill="currentColor" d="M83.94 18.78V4h3.17v14.78h-3.17Z"/>
            <path fill="currentColor" fillRule="evenodd" d="M90.08 17.39c.87.98 2.33 1.47 4.38 1.47 2.04 0 3.5-.49 4.37-1.47.86-.99 1.3-2.4 1.3-4.23 0-1.84-.44-3.24-1.3-4.2-.87-.98-2.33-1.47-4.37-1.47-2.05 0-3.5.49-4.38 1.46-.87.97-1.3 2.37-1.3 4.21 0 1.83.43 3.24 1.3 4.23Zm6.18-1.36c-.47.46-1.07.69-1.8.69-.74 0-1.34-.23-1.81-.69-.47-.46-.7-1.42-.7-2.86s.23-2.4.7-2.84a2.48 2.48 0 0 1 1.8-.7c.74 0 1.34.24 1.8.7.48.45.71 1.4.71 2.84s-.23 2.4-.7 2.86ZM129.6 18.9c-.69 0-1.3-.06-1.82-.17a3.6 3.6 0 0 1-1.35-.56 2.5 2.5 0 0 1-.85-1.07c-.2-.44-.3-1-.3-1.66 0-.64.1-1.17.28-1.6.2-.42.46-.76.82-1.02a3.5 3.5 0 0 1 1.35-.56 8.51 8.51 0 0 1 1.84-.18h3.52v-.43c0-.5-.09-.9-.27-1.18a1.5 1.5 0 0 0-.77-.64 3.32 3.32 0 0 0-2.24-.02c-.32.11-.59.3-.81.57-.23.27-.39.64-.48 1.1l-3.1-.86a3.4 3.4 0 0 1 1.93-2.42 6.05 6.05 0 0 1 1.61-.52c.6-.11 1.22-.17 1.86-.17 1.2 0 2.19.14 3 .43.8.28 1.42.74 1.83 1.37.42.63.63 1.46.63 2.5v6.97h-2.64l-.27-1.28c-.1.17-.27.34-.5.5-.22.16-.5.31-.82.45a6.16 6.16 0 0 1-2.46.44Zm.7-2.03c.44 0 .84-.05 1.21-.15.37-.1.69-.23.95-.4.27-.17.47-.35.59-.53v-2h-2.72c-.28 0-.53.02-.76.07a1.5 1.5 0 0 0-.58.21c-.16.11-.28.26-.37.46-.08.2-.12.47-.12.79 0 .32.04.58.13.78.09.2.22.35.38.47.16.1.35.18.57.23.22.05.46.07.73.07Z" clipRule="evenodd"/>
            <path fill="currentColor" d="M73.57 21.12V35.9h3.17V21.12h-3.17ZM103.59 35.9V24.73h3.17V35.9h-3.17ZM103.59 21.38h3.17v2.21h-3.17v-2.21Z"/>
            <path fill="currentColor" fillRule="evenodd" d="M121.58 34.47c.84 1.02 2.31 1.53 4.42 1.53 1.12 0 2-.11 2.66-.33.64-.21 1.2-.55 1.66-1 .46-.44.76-1.03.9-1.77l-2.84-.8c-.13.4-.28.75-.46 1.05-.19.29-.44.5-.75.63-.3.12-.7.18-1.17.18a2.5 2.5 0 0 1-1.92-.76c-.36-.38-.59-1.03-.67-1.95h8.08c.04-.29.06-.6.06-.95 0-1.76-.4-3.15-1.2-4.17-.82-1-2.29-1.51-4.4-1.51-2.06 0-3.52.5-4.36 1.5-.86 1-1.28 2.39-1.28 4.18 0 1.76.42 3.15 1.27 4.17Zm1.83-5.14h4.94c-.06-.95-.26-1.62-.58-2a2.43 2.43 0 0 0-1.83-.67 2.5 2.5 0 0 0-1.86.74c-.36.36-.58 1-.67 1.93Z" clipRule="evenodd"/>
            <path fill="currentColor" d="m108.26 24.73 3.49 11.17h4.32l3.5-11.17h-3.3l-2.35 9.03h-.02l-2.32-9.03h-3.32ZM92.81 35.32c1 .44 2.24.66 3.72.66 1.68 0 2.98-.26 3.89-.79.9-.53 1.36-1.42 1.36-2.66 0-1.13-.42-1.92-1.26-2.37a9.29 9.29 0 0 0-3.13-.94c-.97-.16-1.76-.3-2.39-.44-.62-.14-.93-.46-.93-.93 0-.37.16-.65.48-.85.33-.2.83-.31 1.52-.31.73 0 1.34.17 1.82.5.5.33.8.78.95 1.34l2.77-1a3.21 3.21 0 0 0-1.83-2.23 8.78 8.78 0 0 0-3.67-.66c-1.55 0-2.8.26-3.74.79a2.59 2.59 0 0 0-1.42 2.43c0 1.13.38 1.95 1.16 2.45.77.51 1.79.86 3.06 1.05 1.01.17 1.85.32 2.5.46.66.13.99.45.99.94 0 .37-.18.65-.55.86-.36.2-.87.3-1.53.3-.8 0-1.45-.15-1.96-.47-.51-.32-.84-.8-.98-1.44l-2.78 1c.3 1.1.95 1.87 1.95 2.31ZM86.7 35.9l-.54-1.32a4.9 4.9 0 0 1-3.75 1.41c-1.45 0-2.45-.47-3-1.41a7.6 7.6 0 0 1-.8-3.79v-6.06h3.15v5.9c0 1.25.15 2.09.44 2.53.3.44.75.66 1.38.66.66 0 1.22-.26 1.7-.78a2.8 2.8 0 0 0 .7-1.76v-6.54h3.14V35.9H86.7ZM66.6 36c-2.07 0-3.52-.5-4.35-1.48-.83-.98-1.24-2.38-1.24-4.19 0-1.84.41-3.25 1.24-4.22.83-.98 2.28-1.47 4.36-1.47 1.85 0 3.14.4 3.86 1.2.72.8 1.14 1.65 1.26 2.53l-2.82.98c-.05-.86-.27-1.5-.67-1.9-.4-.42-.94-.63-1.63-.63-.68 0-1.25.24-1.7.7-.45.47-.68 1.4-.68 2.81 0 1.36.23 2.28.68 2.77.46.48 1.03.73 1.7.73.68 0 1.22-.22 1.63-.65.4-.44.62-1.06.67-1.85l2.82 1.02a4.75 4.75 0 0 1-1.26 2.44c-.72.8-2.01 1.21-3.86 1.21ZM51.9 29.6 48 35.9h3.68l2.63-4.96 2.61 4.96h3.68l-3.92-6.3 3.8-6.41H56.8l-2.5 5.06-2.5-5.06h-3.68l3.78 6.42ZM114.47 17.4c.83 1 2.28 1.48 4.36 1.48 1.85 0 3.13-.4 3.86-1.2a4.75 4.75 0 0 0 1.26-2.45l-2.82-1.02c-.05.8-.27 1.41-.68 1.85-.4.43-.94.65-1.63.65-.67 0-1.23-.24-1.69-.73-.45-.49-.68-1.4-.68-2.76 0-1.41.23-2.34.68-2.8.45-.48 1.02-.72 1.7-.72.69 0 1.23.21 1.62.63.4.41.63 1.05.68 1.9l2.82-.97a4.74 4.74 0 0 0-1.27-2.53c-.72-.8-2-1.2-3.86-1.2-2.07 0-3.52.48-4.35 1.46-.83.98-1.25 2.39-1.25 4.23 0 1.8.42 3.2 1.25 4.19ZM108.8 13.11c0-1.4-.16-2.32-.48-2.76A1.55 1.55 0 0 0 107 9.7c-.66 0-1.19.24-1.58.7-.34.4-.54.85-.58 1.35v7.03h-3.15V7.62h2.44l.46 1.25.29-.27a4.91 4.91 0 0 1 3.31-1.08c1.48 0 2.47.46 3 1.37.52.9.79 2.3.79 4.22h-3.17ZM78.57 4v14.78h3.17V4h-3.17Z"/>
            <path fill="currentColor" fillRule="evenodd" d="M69.85 18.9c-.68 0-1.28-.06-1.81-.17a3.6 3.6 0 0 1-1.35-.56 2.5 2.5 0 0 1-.85-1.07c-.2-.44-.29-1-.29-1.66 0-.64.1-1.17.27-1.6.2-.42.46-.76.82-1.02a3.5 3.5 0 0 1 1.35-.56 8.52 8.52 0 0 1 1.84-.18h3.52v-.43c0-.5-.09-.9-.27-1.18a1.5 1.5 0 0 0-.77-.64 3.32 3.32 0 0 0-2.24-.02c-.31.11-.58.3-.81.57-.23.27-.39.64-.48 1.1l-3.1-.86a3.4 3.4 0 0 1 1.93-2.42 6.05 6.05 0 0 1 1.61-.52 10 10 0 0 1 1.87-.17c1.18 0 2.18.14 2.99.43.8.28 1.42.74 1.84 1.37.41.63.62 1.46.62 2.5v6.97H73.9l-.27-1.28c-.1.17-.27.34-.5.5-.22.16-.5.31-.82.45a6.14 6.14 0 0 1-2.46.44Zm.72-2.03c.43 0 .83-.05 1.2-.15.37-.1.69-.23.95-.4.27-.17.47-.35.59-.53v-2h-2.72c-.28 0-.53.02-.76.07a1.5 1.5 0 0 0-.58.21c-.16.11-.28.26-.37.46-.08.2-.12.47-.12.79 0 .32.04.58.13.78.09.2.22.35.38.47.16.1.35.18.57.23.22.05.46.07.73.07Z" clipRule="evenodd"/>
            <path fill="currentColor" d="M48.6 6.07v12.71h3.16V8.28h.04l2.57 10.15h3.73l2.57-10.16h.05v10.51h3.16V6.08h-5.17l-2.45 10.07h-.04L53.77 6.07H48.6Z"/>
          </svg>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <ProviderSearch />
          </div>

          {/* Desktop Navigation - Changed to dropdown for all screen sizes */}
          <div className="flex items-center gap-2">

            {/* Mobile Search Toggle */}
            <button className="hover:bg-gray-200 dark:hover:bg-gray-800 p-3 rounded-full" onClick={toggleSearch} aria-label={isSearchOpen ? "Close search" : "Open search"}>
              {isSearchOpen ? (<X size={20} strokeWidth={2} />) : (<Search size={20} strokeWidth={2} />)}
            </button>

            <LanguageSwitcher />
            
            {/* Menu Button/Avatar */}
            <div className="relative group">
              <button 
                ref={buttonRef}
                onClick={toggleMenu}
                className="flex items-center justify-center gap-3 rounded-md p-2 pl-3 border border-gray-200 dark:border-gray-800 transition-shadow group-hover:shadow-md"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
              >
                <Menu className="w-4 h-4" />
                {user ? (
                  <AvatarDisplay />
                ) : (
                  <div className="w-8 h-8 rounded overflow-hidden bg-gray-200 flex items-center justify-center">
                    <User size={20} strokeWidth={2.5} className="text-gray-500" />
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              <div 
                ref={menuRef}
                className={`absolute z-50 right-0 mt-2 py-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ease-in-out ${
                  isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
                }`}
              >
                {/* Different menu content based on user type */}
                {!user ? (
                  /* Visitor Menu */
                  <div>
                    <Link
                      href={`/${language}/register`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      Sign up
                    </Link>
                    <Link
                      href={`/${language}/login`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      Log in
                    </Link>
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <Link
                      href={`/${language}/about`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      About us
                    </Link>
                    <Link
                      href={`/${language}/for-providers`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      For Providers
                    </Link>
                  </div>
                ) : hasProviders ? (
                  /* User with provider access */
                  <div>
                    <Link
                      href={`/${language}/dashboard`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100 font-semibold"
                      onClick={closeMenu}
                    >
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href={`/${language}/messages`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100 font-semibold"
                      onClick={closeMenu}
                    >
                      Communication
                    </Link>
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <Link
                      href={`/${language}/my-messages`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100 font-semibold"
                      onClick={closeMenu}
                    >
                      <span>Messages</span>
                      {newMessagesCount > 0 && <span className="text-xs text-gray-500">{newMessagesCount} new</span>}
                    </Link>
                    <Link
                      href={`/${language}/saved`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100 font-semibold"
                      onClick={closeMenu}
                    >
                      Favorites
                    </Link>
                    <Link
                      href={`/${language}/profile`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      Account
                    </Link>
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <Link
                      href={`/${language}/about`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      About us
                    </Link>
                    <Link
                      href={`/${language}/for-providers`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      For Providers
                    </Link>
                    <Link
                      href={`/${language}/logout`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      Log out
                    </Link>
                    
                    {isAdmin && (
                      <div>
                        <Link
                          href={`/${language}/admin`}
                          className="block text-sm px-4 py-2.5 hover:bg-gray-100"
                          onClick={closeMenu}
                        >
                          Admin {isAdmin && '(only if admin)'}
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Normal User */
                  <div>
                    <Link
                      href={`/${language}/messages`}
                      className="flex items-center justify-between px-4 py-3"
                      onClick={closeMenu}
                    >
                      <span>Messages</span>
                      {newMessagesCount > 0 && <span className="bg-amber-400 text-xs px-2 py-0.5 rounded-full">{newMessagesCount} unread</span>}
                    </Link>
                    <Link
                      href={`/${language}/favorites`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      Favorites
                    </Link>
                    <Link
                      href={`/${language}/account`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      Account
                    </Link>
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <Link
                      href={`/${language}/about`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      About us
                    </Link>
                    <Link
                      href={`/${language}/for-providers`}
                      className="block text-sm px-4 py-2.5 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      For Providers
                    </Link>
                    <div>
                      <Link
                        href={`/${language}/logout`}
                        className="block text-sm px-4 py-2.5 hover:bg-gray-100"
                        onClick={closeMenu}
                      >
                        Log out
                      </Link>
                    </div>
                    
                    {isAdmin && (
                      <div>
                        <Link
                          href={`/${language}/admin`}
                          className="block text-sm px-4 py-2.5 hover:bg-gray-100"
                          onClick={closeMenu}
                        >
                          Admin {isAdmin && '(only if admin)'}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <ProviderSearch />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
