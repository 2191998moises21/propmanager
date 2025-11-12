
import React from 'react';
import { UserCircleIcon, BellIcon } from '@heroicons/react/24/outline';

export const Header: React.FC = () => {
  return (
    <header className="flex-shrink-0 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4 h-16">
        <div className="flex items-center">
          {/* Could be a search bar */}
          <h1 className="text-xl font-semibold text-gray-800">Hola, Propietario</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700">
            <BellIcon className="h-6 w-6" />
          </button>
          <button className="flex items-center space-x-2">
            <UserCircleIcon className="h-8 w-8 text-gray-500" />
            <span className="hidden md:inline text-sm font-medium">Mi Cuenta</span>
          </button>
        </div>
      </div>
    </header>
  );
};

// Dummy icons for compilation if @heroicons are not available
const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);
