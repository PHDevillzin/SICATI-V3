
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SicatLogo from '../components/icons/SicatLogo';
import SesiSenaiLogo from '../components/icons/SesiSenaiLogo';
import { AuthUser } from '../contexts/AuthContext';


interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [nif, setNif] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error on new submission

    // Check for blank fields
    if (!nif || !password) {
        setError("Preencha NIF e senha.");
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3001/users');
        if (!response.ok) {
             throw new Error('Falha ao buscar usuários');
        }
        const users: any[] = await response.json();

        // For this demo, we assume the password is '123456' for everyone as per the seed data / previous hardcoded logic
        // In a real app, we would verify the password hash.
        // The seed data doesn't have passwords, so we'll just check if the user exists by NIF for now,
        // OR we can assume a default password if not present.
        // The previous hardcoded logic had '123456'.
        // Let's enforce '123456' for now since the backend doesn't store passwords yet.
        
        const userByLogin = users.find(user => user.nif && user.nif.toUpperCase() === nif.toUpperCase());

        if (!userByLogin) {
            setError("NIF inválido.");
            return;
        }

        if (password !== '123456') {
            setError("Senha invalida");
            return;
        }
        
        onLogin({ 
          name: userByLogin.name,
          email: userByLogin.email, 
          profile: userByLogin.profile,
          unidade: userByLogin.unidade,
        });

    } catch (err) {
        console.error("Login error:", err);
        setError("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Banner */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-[#8B0000] text-white p-12">
        <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold mb-8">Sistema de Cadastro de Terceiros</h1>
            <div className="relative w-64 h-64">
                <SicatLogo className="w-full h-full text-white" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32">
                        <SesiSenaiLogo />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-100 p-8">
        <div className="max-w-md w-full">
            <div className="flex justify-center mb-8 lg:hidden">
                 <h1 className="text-2xl font-bold text-[#8B0000]">SICAT</h1>
            </div>
          <div className="flex justify-center mb-8">
            <SesiSenaiLogo className="w-48"/>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="NIF"
                value={nif}
                onChange={(e) => setNif(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            
            {error && (
              <div className="mb-4 text-center text-red-600 text-sm font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-md transition duration-300"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;