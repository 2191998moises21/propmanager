
import React, { useState } from 'react';
import { BuildingOffice2Icon, UsersIcon } from '@heroicons/react/24/solid';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Owner } from '../types';

interface LoginPageProps {
    onLogin: (email: string, role: 'owner' | 'tenant') => boolean;
    onRegister: (ownerData: Omit<Owner, 'id' | 'fotoUrl'>) => boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [role, setRole] = useState<'owner' | 'tenant'>('owner');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // State for registration form
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regAddress, setRegAddress] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [regError, setRegError] = useState('');


    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLogin(email, role);
        if (!success) {
            setError('Email o rol incorrecto. Por favor, intente de nuevo.');
        }
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setRegError('');
        if (regPassword !== regConfirmPassword) {
            setRegError('Las contraseñas no coinciden.');
            return;
        }
        
        const success = onRegister({
            nombre_completo: regName,
            email: regEmail,
            telefono: regPhone,
            direccion: regAddress,
        });

        if (!success) {
            setRegError('El correo electrónico ya está en uso.');
        }
    };
    
    const getPlaceholderText = () => {
        return role === 'owner' 
            ? 'Pruebe con: carlos.prop@email.com'
            : 'Pruebe con: maria.r@email.com o carlos.silva@email.com.br';
    }

    const renderLoginForm = () => (
        <>
            <div className="p-2">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setRole('owner')}
                        className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${role === 'owner' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <BuildingOffice2Icon className="w-5 h-5" />
                        Soy Propietario
                    </button>
                    <button
                        onClick={() => setRole('tenant')}
                        className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${role === 'tenant' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <UsersIcon className="w-5 h-5" />
                        Soy Inquilino
                    </button>
                </div>

                <form onSubmit={handleLoginSubmit} className="pt-6 pb-2 px-4 space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Correo Electrónico
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                            <p className="mt-2 text-xs text-gray-500">{getPlaceholderText()}</p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                            Contraseña
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-primary hover:text-blue-700">
                                ¿Olvidó su contraseña?
                            </a>
                        </div>
                    </div>

                    <div>
                        <Button type="submit" className="w-full">
                            Ingresar
                        </Button>
                    </div>
                </form>
            </div>
            <div className="text-center py-4 bg-gray-50 border-t rounded-b-lg">
                <p className="text-sm text-gray-600">
                    ¿No tienes una cuenta de propietario?{' '}
                    <button onClick={() => { setMode('register'); setError(''); }} className="font-medium text-primary hover:text-blue-700">
                        Regístrate aquí
                    </button>
                </p>
            </div>
        </>
    );

    const renderRegisterForm = () => (
         <>
            <div className="p-6">
                <h2 className="text-center text-2xl font-bold text-gray-800 mb-4">Registro de Propietario</h2>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="regName" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                        <input id="regName" type="text" value={regName} onChange={e => setRegName(e.target.value)} required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="regEmail" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                        <input id="regEmail" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="regPhone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input id="regPhone" type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="regAddress" className="block text-sm font-medium text-gray-700">Dirección</label>
                        <input id="regAddress" type="text" value={regAddress} onChange={e => setRegAddress(e.target.value)} required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="regPassword"className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input id="regPassword" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="regConfirmPassword"className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                        <input id="regConfirmPassword" type="password" value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    
                    {regError && <p className="text-sm text-red-600 text-center">{regError}</p>}
                    
                    <div className="pt-2">
                        <Button type="submit" className="w-full">
                            Registrarme
                        </Button>
                    </div>
                </form>
            </div>
            <div className="text-center py-4 bg-gray-50 border-t rounded-b-lg">
                <p className="text-sm text-gray-600">
                    ¿Ya tienes una cuenta?{' '}
                    <button onClick={() => { setMode('login'); setRegError(''); }} className="font-medium text-primary hover:text-blue-700">
                        Inicia sesión
                    </button>
                </p>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="text-center mb-8">
                <BuildingOffice2Icon className="w-16 h-16 text-primary mx-auto" />
                <h1 className="text-4xl font-bold text-primary mt-2">PropManager</h1>
                <p className="text-gray-600">Su solución integral de gestión de propiedades.</p>
            </div>
            <Card className="max-w-md w-full !shadow-lg">
                {mode === 'login' ? renderLoginForm() : renderRegisterForm()}
            </Card>
        </div>
    );
};
