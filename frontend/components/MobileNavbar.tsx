'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, StoreIcon, CalendarCogIcon, ShoppingCart, Headset } from 'lucide-react';

const NavItem = ({ Icon, href, isActive }: { Icon: React.ComponentType<any>, href: string, isActive: boolean }) => (
  <Link
    href={href}
    className={`flex flex-col items-center justify-center w-1/5 p-2 transition-all duration-300 ${
      isActive ? 'text-purple-500' : 'text-gray-500 hover:text-purple-500'
    }`}
  >
    <Icon size={24} />
    {isActive && <div className='w-1 h-1 bg-purple-500 rounded-full mt-1' />}
  </Link>
);

const MobileNavbar = () => {
  const pathname = usePathname();

  const navItems = [
    { id: 'Home', Icon: Home, href: '/' },
    { id: 'Shop', Icon: StoreIcon, href: '/pricing' },
    { id: 'Services', Icon: CalendarCogIcon, href: '/about' },
    { id: "Cart", Icon: ShoppingCart, href: "/cart" },
    { id: 'Contact', Icon: Headset, href: '/contact' },     
  ];

  return (
    <nav className='fixed md:hidden lg:hidden bottom-0 left-0 right-0 bg-black backdrop-blur-sm opacity-90 shadow-lg rounded-t-3xl z-50 py-2'>
      <div className='flex justify-around items-center h-16'>
        {navItems.map((item) => (
          <NavItem key={item.id} {...item} isActive={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
};

export default MobileNavbar;
