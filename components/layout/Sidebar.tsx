
import React from 'react';
import { View } from '../../App';
import { HomeIcon, BuildingOffice2Icon, UsersIcon, DocumentTextIcon, BanknotesIcon, TicketIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const NavItem: React.FC<{
  view: View;
  label: string;
  icon: React.ReactNode;
  currentView: View;
  setView: (view: View) => void;
}> = ({ view, label, icon, currentView, setView }) => {
  const isActive = currentView === view;
  return (
    <li>
      <button
        onClick={() => setView(view)}
        className={`flex items-center p-2 text-base font-normal rounded-lg w-full text-left transition duration-75 group
          ${isActive 
            ? 'bg-primary text-white' 
            : 'text-gray-900 hover:bg-gray-100'
          }`}
      >
        {React.cloneElement(icon as React.ReactElement, {
          className: `w-6 h-6 transition duration-75 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}`
        })}
        <span className="ml-3">{label}</span>
      </button>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  return (
    <aside className="w-64" aria-label="Sidebar">
      <div className="overflow-y-auto h-full py-4 px-3 bg-white border-r border-gray-200">
        <a href="#" className="flex items-center pl-2.5 mb-5">
          <span className="self-center text-xl font-semibold whitespace-nowrap text-primary">PropManager</span>
        </a>
        <ul className="space-y-2">
          <NavItem view="dashboard" label="Dashboard" icon={<HomeIcon />} currentView={currentView} setView={setView} />
          <NavItem view="properties" label="Propiedades" icon={<BuildingOffice2Icon />} currentView={currentView} setView={setView} />
          <NavItem view="tenants" label="Inquilinos" icon={<UsersIcon />} currentView={currentView} setView={setView} />
          <NavItem view="contracts" label="Contratos" icon={<DocumentTextIcon />} currentView={currentView} setView={setView} />
          <NavItem view="payments" label="Pagos" icon={<BanknotesIcon />} currentView={currentView} setView={setView} />
          <NavItem view="tickets" label="Tickets" icon={<TicketIcon />} currentView={currentView} setView={setView} />
        </ul>
      </div>
    </aside>
  );
};

// Dummy icons for compilation
const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>);
const BuildingOffice2Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M8.25 21V3.75h7.5V21h-7.5zM12 21V12h3m-3 0V3.75M12 12h-3m3 0V3.75" /></svg>);
const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663c.11-.256.217-.512.321-.766l.001-.004M12 15a.75.75 0 00.75-.75V7.5a.75.75 0 00-1.5 0v6.75A.75.75 0 0012 15zm-3 0a.75.75 0 00.75-.75V7.5a.75.75 0 00-1.5 0v6.75a.75.75 0 00.75.75z" /></svg>);
const DocumentTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>);
const BanknotesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.192.658.658 0 01.217.437V21h-18v-2.25a60.07 60.07 0 011.68-5.918 3.75 3.75 0 013.15-2.066 3.75 3.75 0 013.15 2.066 60.07 60.07 0 015.733 4.155c.346.33.72.632 1.107.899m-1.107-.9a60.07 60.07 0 00-5.733-4.155 3.75 3.75 0 00-3.15-2.066 3.75 3.75 0 00-3.15 2.066 60.07 60.07 0 00-1.68 5.918m17.49-5.918a3.75 3.75 0 00-3.15-2.066 3.75 3.75 0 00-3.15 2.066 60.07 60.07 0 00-5.733 4.155c-.346.33-.72.632-1.107.899m1.107-.9a60.07 60.07 0 015.733-4.155 3.75 3.75 0 013.15-2.066 3.75 3.75 0 013.15 2.066 60.07 60.07 0 011.68 5.918" /></svg>);
const TicketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h3m-3 0h-1.5m3 0h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
