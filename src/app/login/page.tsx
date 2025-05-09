'use client';

import React, { useState, useContext, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthContext } from '@/app/context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSession, setKeepSession] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const { login } = useContext(AuthContext);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        setError(`Error al iniciar sesión: ${errorMessage}`);
        return;
      }

      const data = await response.json();
      console.log("Respuesta del login:", data);

      // Usa la función login del AuthContext, pasando el token y el flag de sesión persistente.
      login(data.token, keepSession);

      // Redirigir a /inicio o a la URL de callback si se utiliza
      router.push(callbackUrl || '/admin-panel');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error en la solicitud: ${err.message}`);
      } else {
        setError("Error en la solicitud.");
      }
    }
  };

  return (
    <>
     <div>
        <h1 className="mt-3  text-center">Administrador ALBUCHE.</h1>
      </div>
      <div className="min-h-screen bg-black-800 flex items-center justify-center py-8 px-4">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-black">
            Iniciar Sesión
          </h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-black font-medium mb-2">
                Correo electrónico
              </label>
              <input 
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-black rounded px-3 py-2 text-black focus:outline-none focus:ring focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-black font-medium mb-2">
                Contraseña
              </label>
              <input 
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-black rounded px-3 py-2 text-black focus:outline-none focus:ring focus:border-blue-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="keepSession"
                checked={keepSession}
                onChange={(e) => setKeepSession(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="keepSession" className="text-black text-sm">
                Mantener Sesión Iniciada
              </label>
            </div>
            <button 
              type="submit"
              className="w-full bg-green-500 hover:bg-blue-600 text-white py-2 rounded transition-colors"
            >
              Iniciar Sesión
            </button>
          </form>
          <div className="mt-4 text-center">
            {/* <p className="text-sm text-black">
              ¿No tienes cuenta?{' '}
              <Link
                href={`/registro?callbackUrl=${encodeURIComponent(callbackUrl || '/catalogo')}`}
                className="text-blue-500 hover:underline"
              >
                Registrarse
              </Link>
            </p>
            <p className="mt-2 text-sm text-black">
              ¿Olvidaste tu contraseña?{' '}
              <Link href="/restablecer-clave" className="text-blue-500 hover:underline">
                Restablecer
              </Link>
            </p> */}
            <p className="mt-2 text-sm text-black">
              <Link href="/" className="text-greem-500 hover:underline">
                Inicio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const LoginPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  );
};

export default LoginPage;
