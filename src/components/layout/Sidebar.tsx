import React from 'react';
// FIX: 'View' type is exported from LandlordPortal, not App.
import { View } from '@/portals/LandlordPortal';
import {
  HomeIcon,
  BuildingOffice2Icon,
  UsersIcon,
  DocumentTextIcon,
  BanknotesIcon,
  TicketIcon,
  ChevronDoubleLeftIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isOpen: boolean;
  toggle: () => void;
}

const NavItem: React.FC<{
  view: View;
  label: string;
  icon: React.ReactElement<{ className?: string }>;
  currentView: View;
  setView: (view: View) => void;
  isOpen: boolean;
}> = ({ view, label, icon, currentView, setView, isOpen }) => {
  const isActive = currentView === view;
  return (
    <li>
      <button
        onClick={() => setView(view)}
        className={`flex items-center p-2 text-base font-normal rounded-lg w-full text-left transition duration-75 group
          ${isActive ? 'bg-primary text-white' : 'text-gray-900 hover:bg-gray-100'}
          ${!isOpen ? 'justify-center' : ''}
          `}
      >
        {React.cloneElement(icon, {
          className: `w-6 h-6 transition duration-75 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}`,
        })}
        <span
          className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}
        >
          {label}
        </span>
      </button>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, toggle }) => {
  return (
    <aside
      className={`relative transition-all duration-300 ease-in-out bg-white border-r border-gray-200 ${isOpen ? 'w-64' : 'w-20'}`}
      aria-label="Sidebar"
    >
      <div className="overflow-y-auto h-full py-4 px-3 flex flex-col">
        <div
          className={`flex items-center mb-5 h-[28px] transition-all duration-300 ${isOpen ? 'justify-start pl-2.5' : 'justify-center'}`}
        >
          <a href="#" className="flex items-center">
            <span
              className={`self-center text-xl font-semibold whitespace-nowrap text-primary overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-w-xs' : 'max-w-0'}`}
            >
              PropManager
            </span>
            <BuildingOffice2Icon
              className={`w-8 h-8 text-primary transition-all duration-300 ${isOpen ? 'hidden' : 'block'}`}
            />
          </a>
        </div>
        <ul className="space-y-2 flex-grow">
          <NavItem
            view="dashboard"
            label="Dashboard"
            icon={<HomeIcon />}
            currentView={currentView}
            setView={setView}
            isOpen={isOpen}
          />
          <NavItem
            view="properties"
            label="Propiedades"
            icon={<BuildingOffice2Icon />}
            currentView={currentView}
            setView={setView}
            isOpen={isOpen}
          />
          <NavItem
            view="tenants"
            label="Inquilinos"
            icon={<UsersIcon />}
            currentView={currentView}
            setView={setView}
            isOpen={isOpen}
          />
          <NavItem
            view="contracts"
            label="Contratos"
            icon={<DocumentTextIcon />}
            currentView={currentView}
            setView={setView}
            isOpen={isOpen}
          />
          <NavItem
            view="payments"
            label="Pagos"
            icon={<BanknotesIcon />}
            currentView={currentView}
            setView={setView}
            isOpen={isOpen}
          />
          <NavItem
            view="tickets"
            label="Tickets"
            icon={<TicketIcon />}
            currentView={currentView}
            setView={setView}
            isOpen={isOpen}
          />
        </ul>
        <div className="pt-2">
          <NavItem
            view="profile"
            label="Mi Perfil"
            icon={<UserCircleIcon />}
            currentView={currentView}
            setView={setView}
            isOpen={isOpen}
          />
        </div>
        <div className="pt-2 mt-auto border-t border-gray-200">
          <button
            onClick={toggle}
            className={`hidden md:flex items-center p-2 text-base font-normal rounded-lg w-full text-left transition duration-75 group text-gray-900 hover:bg-gray-100 ${!isOpen && 'justify-center'}`}
          >
            <ChevronDoubleLeftIcon
              className={`w-6 h-6 text-gray-500 group-hover:text-gray-900 transition-transform duration-300 flex-shrink-0 ${!isOpen && 'rotate-180'}`}
            />
            <span
              className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}
            >
              Cerrar Menú
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
