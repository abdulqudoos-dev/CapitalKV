'use client';

import React, { useState, useEffect, useContext } from 'react';
import { Button } from './ui/button';
import capitalkvIconTransparant from '@/public/capitalkvIconTransparant.png';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, LogIn, ShoppingBagIcon } from 'lucide-react';
import AuthContext from '@/contexts/AuthContext';
import { useUser } from '@/hooks/use-user';
import { CartSheet } from './CartSheet';

const Header = () => {
  const { user } = useContext(AuthContext);
  const { user: isUserLoggedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
  const [hasScrolled, setHasScrolled] = useState(false);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleLinkClick = (href: React.SetStateAction<string>) => {
    setActiveLink(href);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setHasScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className='fixed z-50 top-2 w-full text-white md:px-6'>
      <div className='container mx-auto'>
        <div
          className={`flex justify-between items-center rounded-full transition-all duration-300 ease-in-out p-1 ${
            hasScrolled
              ? 'bg-black/50 rounded-full backdrop-blur-sm '
              : 'bg-transparent'
          }`}
        >
          <div className='transform transition-transform duration-300 hover:scale-105'>
            <div className='h-14 w-14 rounded-lg inline-flex justify-center items-center'>
              <Link className='flex items-center justify-center ' href='/'>
                <Image
                  src={capitalkvIconTransparant}
                  alt='capitalkvIconTransparant'
                  className='h-10 w-10'
                />
              </Link>
            </div>
          </div>
          <div className='hidden md:flex'>
            <nav
              className={`flex gap-10 lg:gap-20 px-6 py-2 rounded-full text-sm transition-all duration-300 ease-in-out ${
                hasScrolled
                  ? 'bg-neutral-500/30 hover:bg-neutral-500/40'
                  : 'bg-neutral-500/30 hover:bg-neutral-500/40'
              }`}
            >
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  className={`relative bg-transparent transition-all duration-300 ease-in-out transform hover:scale-105 ${
                    activeLink === item.href
                      ? 'text-purple-500 font-medium'
                      : 'hover:text-purple-500'
                  }`}
                  href={item.href}
                  onClick={() => handleLinkClick(item.href)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        <div className='flex gap-2 lg:gap-4 items-center justify-center mt-2'>
  {/* Shopping Cart Icon */}
  <div className="hidden md:flex items-center justify-center">
    <CartSheet />
  </div>
          {!user && !isUserLoggedIn ? (
            <div className='flex gap-1 lg:gap-4 items-center justify-center mt-2'>
              <Link href='/auth/register'>
                <Button className='px-3 md:px-5 hover:bg-purple-600 transition-all duration-300 ease-in-out transform hover:scale-105 text-sm'>
                  Join Now <ArrowUpRight className='bg-transparent w-4 ml-2' />
                </Button>
              </Link>

              <Link href='/auth/login'>
                <Button
                  variant='outline'
                  className='px-3 md:px-5 hover:bg-purple-600 transition-all duration-300 ease-in-out transform hover:scale-105 text-sm'
                >
                  Login <LogIn className='bg-transparent w-4 ml-2' />
                </Button>
              </Link>
            </div>
          ) : (
            <div className='flex gap-1 lg:gap-4 items-center justify-center mt-2'>
              <Link className='mt-2' href='/dashboard/home'>
                <Button
                  variant='outline'
                  className='px-3 md:px-5 hover:bg-purple-600 transition-all duration-300 ease-in-out transform hover:scale-105 text-sm'
                >
                  Dashboard <ArrowUpRight className='bg-transparent w-4 ml-2' />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
        </div>

    </header>
  );
};

export default Header;
