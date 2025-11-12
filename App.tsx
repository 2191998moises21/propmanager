
import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/views/Dashboard';
import { Properties } from './components/views/Properties';
import { Tenants } from './components/views/Tenants';
import { Contracts } from './components/views/Contracts';
import { Payments } from './components/views/Payments';
import { mockProperties, mockTenants, mockContracts, mockPayments } from './data/mockData';
import { Property, Tenant, Contract, Payment } from './types';

export type View = 'dashboard' | 'properties' | 'tenants' | 'contracts' | 'payments' | 'tickets';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  
  const addProperty = (property: Omit<Property, 'id' | 'imageUrl'>) => {
    const newProperty: Property = {
      ...property,
      id: `prop${properties.length + 1}`,
      imageUrl: `https://picsum.photos/seed/${properties.length + 1}/400/300`,
    };
    setProperties(prev => [newProperty, ...prev]);
    setView('properties');
  };

  const content = useMemo(() => {
    switch (view) {
      case 'dashboard':
        return <Dashboard properties={properties} contracts={contracts} payments={payments} setView={setView} />;
      case 'properties':
        return <Properties properties={properties} addProperty={addProperty} />;
      case 'tenants':
        return <Tenants tenants={tenants} />;
      case 'contracts':
        return <Contracts contracts={contracts} properties={properties} tenants={tenants} />;
      case 'payments':
        return <Payments payments={payments} contracts={contracts} tenants={tenants} properties={properties} />;
      default:
        return <Dashboard properties={properties} contracts={contracts} payments={payments} setView={setView} />;
    }
  }, [view, properties, contracts, payments, tenants]);

  return (
    <div className="flex h-screen bg-background text-text-primary">
      <Sidebar currentView={view} setView={setView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6 md:p-8">
          {content}
        </main>
      </div>
    </div>
  );
};

export default App;
