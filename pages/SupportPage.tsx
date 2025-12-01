import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SesiSenaiLogo from '../components/icons/SesiSenaiLogo';
import { ChevronDownIcon, ChevronUpIcon, ComputerDesktopIcon } from '../components/icons/HeroIcons';


const SupportPageHeader: React.FC = () => (
    <header className="bg-gradient-to-r from-[#6a0000] to-[#a00000] p-4 shadow-md">
        <div className="max-w-7xl mx-auto">
            <SesiSenaiLogo className="h-8" />
        </div>
    </header>
);

const Notice: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-red-50 border border-red-200 rounded-lg mb-6">
            <button 
                className="w-full flex justify-between items-center p-4 text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="font-bold text-red-800">Intermitência na ura</h3>
                {isOpen ? <ChevronUpIcon className="w-5 h-5 text-red-600" /> : <ChevronDownIcon className="w-5 h-5 text-red-600" />}
            </button>
            {isOpen && (
                <div className="px-4 pb-4 text-sm text-red-700">
                    <p>Informamos que no momento estamos com intermitência no recebimento de chamadas da Central de Serviços.</p>
                    <p>Se possível contatar a equipe da central de serviços por teams ou abra um chamado!</p>
                    <p>Está causando uma demora nos atendimentos das ligações. As equipes técnicas estão trabalhando junto a operadora para normalização dos nossos serviços.</p>
                    <p>Obrigado pela compreensão.</p>
                </div>
            )}
        </div>
    );
};


const SupportForm: React.FC = () => (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
        <div className="mb-6">
            <p className="text-sm text-yellow-600">Central de Ajuda Sesi Senai / Central de Serviços & SAP</p>
            <h1 className="text-3xl font-bold text-gray-800 mt-1">Central de Serviços & SAP</h1>
            <p className="mt-2 text-gray-600">Boas-vindas! É possível criar uma solicitação para Central de Serviços & SAP usando as opções oferecidas.</p>
            <p className="text-sm text-gray-500 mt-2">Telefone da Central de Serviços & SAP: (11) 3254-3525</p>
            <p className="text-sm text-gray-500">Horário de atendimento humanizado: de Segunda à Sexta-feira das 7h às 21h e aos Sábados das 8h às 18h.</p>
        </div>

        <form className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entre em contato conosco a respeito de:</label>
                <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option>Estou com uma dúvida ou preciso fazer uma solicitação</option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Como podemos ajudar você?</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ComputerDesktopIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <select className="w-full p-3 pl-10 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none">
                        <option>Sistemas Corporativos</option>
                    </select>
                     <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecione a atividade <span className="text-red-600">*</span>
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option>Selecionar...</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Os campos obrigatórios estão marcados com asterisco *</p>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assunto <span className="text-red-600">*</span>
                </label>
                <input type="text" className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
        </form>
    </div>
);

const SupportPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
           <SupportPageHeader />
           <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <Notice />
                <SupportForm />
                <div className="mt-8 text-center">
                    <Link to="/login" className="px-6 py-2 bg-[#8B0000] text-white rounded-md hover:bg-red-800 transition-colors">
                        Voltar ao Login
                    </Link>
                </div>
           </main>
        </div>
    );
}

export default SupportPage;
