

import React, { useState } from 'react';
import DashboardCard from '../components/DashboardCard';
import { HomeIcon, UsersIcon, BuildingOfficeIcon, BriefcaseIcon, ChartBarIcon, InformationCircleIcon } from '../components/icons/HeroIcons';
import AboutModal from '../components/AboutModal';
import { useAuth } from '../contexts/AuthContext';

const PortalPage: React.FC = () => {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const { user } = useAuth();

  const canManageUsers = user && (user.profile === 'Gerência de Facilities' || user.profile === 'Gestor de unidade' || user.profile === 'Unidade');
  const canManageCompanies = user && (user.profile === 'Gerência de Facilities' || user.profile === 'Sede');

  return (
    <div className="container mx-auto">
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center">
            <HomeIcon className="w-6 h-6 text-gray-500 mr-3" />
            <h1 className="text-xl font-semibold text-gray-700">Bem-vindo ao Sistema de Cadastro de Terceiros</h1>
        </div>
        <button
          onClick={() => setIsAboutModalOpen(true)}
          className="text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Sobre a aplicação"
          title="Sobre a aplicação"
        >
          <InformationCircleIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {canManageUsers && (
            <DashboardCard
              title="Gerenciar Usuários"
              description="Adicione, edite e remova usuários do sistema."
              icon={<UsersIcon className="w-8 h-8" />}
              buttonText="Gerenciar Usuários"
              buttonColor="bg-sky-500"
              linkTo="/users"
            />
        )}
        <DashboardCard
          title="Gerenciar Terceiros"
          description="Cadastre e administre informações de terceiros."
          icon={<BriefcaseIcon className="w-8 h-8" />}
          buttonText="Gerenciar Terceiros"
          buttonColor="bg-emerald-500"
          linkTo="/third-parties"
        />
        {canManageCompanies && (
          <DashboardCard
            title="Gerenciar Empresas"
            description="Visualize e gerencie as empresas parceiras."
            icon={<BuildingOfficeIcon className="w-8 h-8" />}
            buttonText="Gerenciar Empresas"
            buttonColor="bg-amber-500"
            linkTo="/companies"
          />
        )}
        <DashboardCard
          title="Painel de Controle"
          description="Acesse o dashboard com métricas e relatórios."
          icon={<ChartBarIcon className="w-8 h-8" />}
          buttonText="Acessar Painel"
          buttonColor="bg-purple-500"
          linkTo="/dashboard"
        />
      </div>
    </div>
  );
};

export default PortalPage;
