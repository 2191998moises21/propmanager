import React, { useState, useEffect, useRef } from 'react';
import { UserCircleIcon, BellIcon, Bars3Icon, UserIcon as UserIconSolid, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Owner, Tenant } from '@/types';

interface HeaderProps {
    toggleSidebar: () => void;
    user: Owner | Tenant;
    onLogout: () => void;
    setView: (view: 'profile') => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, user, onLogout, setView }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Notifications can be dynamic based on user role in a real app
  const notifications = [
      { id: 1, text: 'Nuevo pago recibido de Maria Rodriguez.', time: 'hace 5 min' },
      { id: 2, text: 'Ticket "Fuga de agua" ha sido cerrado.', time: 'hace 1 hora' },
      { id: 3, text: 'Contrato para Av. Libertador vence en 30 días.', time: 'hace 1 día' },
  ];

  const toggleNotifications = () => {
    setNotificationsOpen(prev => !prev);
    setAccountOpen(false);
  };
  
  const toggleAccount = () => {
    setAccountOpen(prev => !prev);
    setNotificationsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <header className="flex-shrink-0 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4 h-16">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-2 mr-2 text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700 hidden md:block"
            aria-label="Toggle sidebar"
          >
             <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Hola, {user.nombre_completo.split(' ')[0]}</h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notifications Button & Dropdown */}
          <div ref={notificationsRef} className="relative">
            <button 
              onClick={toggleNotifications}
              className="relative p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            {notificationsOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <div className="px-4 py-2 border-b">
                    <h3 className="text-sm font-semibold text-gray-800">Notificaciones</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map(notif => (
                      <a 
                        key={notif.id}
                        href="#" 
                        className="flex items-start px-4 py-3 text-sm text-gray-700 hover:bg-gray-100" 
                        onClick={(e) => { e.preventDefault(); alert('Navegando a la notificación...'); setNotificationsOpen(false); }}
                      >
                        <BellIcon className="w-5 h-5 mr-3 mt-0.5 text-primary flex-shrink-0" />
                        <div>
                          <p>{notif.text}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t">
                    <a href="#" className="block text-center text-sm font-medium text-primary hover:underline">
                      Ver todas las notificaciones
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Account Button & Dropdown */}
           <div ref={accountRef} className="relative">
            <button onClick={toggleAccount} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <img src={user.fotoUrl} alt="user photo" className="h-8 w-8 rounded-full object-cover" />
              <span className="hidden md:inline text-sm font-medium">Mi Cuenta</span>
            </button>
            {accountOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <span className="w-full text-left flex items-center px-4 pt-2 pb-1 text-xs text-gray-500" role="menuitem">
                    Conectado como
                  </span>
                  <span className="w-full text-left flex items-center px-4 pb-2 text-sm text-gray-800 font-medium border-b mb-1" role="menuitem">
                    {user.nombre_completo}
                  </span>
                  <button onClick={() => { setView('profile'); setAccountOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50" role="menuitem">
                    <UserIconSolid className="w-5 h-5 mr-3" />
                    Perfil
                  </button>
                  <button onClick={onLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
