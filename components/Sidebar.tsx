
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SesiSenaiLogo from './icons/SesiSenaiLogo';
import { 
    HomeIcon, 
    ChevronDownIcon, 
    ChevronRightIcon, 
    ArrowLeftOnRectangleIcon, 
    ChevronDoubleLeftIcon, 
    ChevronDoubleRightIcon,
    UsersIcon,
    BriefcaseIcon,
    BuildingOfficeIcon,
    ChartBarIcon
} from './icons/HeroIcons';
import { AuthUser } from '../contexts/AuthContext';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isCollapsed: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, children, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      title={isCollapsed ? String(children) : undefined}
      className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-red-900 text-white'
          : 'text-red-100 hover:bg-red-800 hover:text-white'
      } ${isCollapsed ? 'justify-center' : ''}`}
    >
      {icon}
      {!isCollapsed && <span className="ml-3">{children}</span>}
    </Link>
  );
};

const SubNavLink: React.FC<{ to: string; children: React.ReactNode; }> = ({ to, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`block px-2 py-1.5 text-sm rounded-md transition-colors ${
          isActive
            ? 'text-white font-semibold'
            : 'text-red-100 hover:text-white'
        }`}
      >
        {children}
      </Link>
    );
  };

interface CollapsibleMenuProps {
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
    isCollapsed: boolean;
    isOpen: boolean;
    onToggle: () => void;
}

const CollapsibleMenu: React.FC<CollapsibleMenuProps> = ({ title, icon, children, isCollapsed, isOpen, onToggle }) => {
    if (isCollapsed) {
        return (
             <div className="flex items-center justify-center px-4 py-2.5 text-red-100 cursor-pointer" title={title}>
                {icon}
            </div>
        )
    }

    return (
        <div>
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-left text-red-100 hover:bg-red-800 hover:text-white rounded-md transition-colors"
            >
                <span className="flex items-center">
                    {icon}
                    <span className="ml-3">{title}</span>
                </span>
                {isOpen ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
            </button>
            {isOpen && <div className="mt-1 ml-4 pl-4 border-l-2 border-red-700">{children}</div>}
        </div>
    );
}

interface SidebarProps {
    onLogout: () => void;
    user: AuthUser;
    isCollapsed: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, user, isCollapsed, onToggle }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const canManageUsers = user.profile === 'Gerência de Facilities' || user.profile === 'Gestor de unidade' || user.profile === 'Unidade';
  const canManageCompanies = user.profile === 'Gerência de Facilities' || user.profile === 'Sede';
    
  const handleMenuToggle = (title: string) => {
    setOpenMenu(prevOpenMenu => (prevOpenMenu === title ? null : title));
  };

  return (
    <aside className={`hidden md:flex flex-col bg-[#800000] transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center h-16 px-4 border-b border-red-900 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <SesiSenaiLogo className="w-32" />}
        <button onClick={onToggle} className="text-red-200 hover:text-white">
            {isCollapsed ? <ChevronDoubleRightIcon className="h-6 w-6" /> : <ChevronDoubleLeftIcon className="h-6 w-6" />}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
            <NavLink to="/" icon={<HomeIcon className="w-5 h-5" />} isCollapsed={isCollapsed}>Home</NavLink>
            
            {canManageUsers && (
                <CollapsibleMenu 
                    title="Gerenciar usuários" 
                    icon={<UsersIcon className="w-5 h-5" />} 
                    isCollapsed={isCollapsed}
                    isOpen={openMenu === 'Gerenciar usuários'}
                    onToggle={() => handleMenuToggle('Gerenciar usuários')}
                >
                    <div className="flex flex-col space-y-1 py-1">
                        <SubNavLink to="/users">Lista de usuários</SubNavLink>
                    </div>
                </CollapsibleMenu>
            )}
            
            <CollapsibleMenu 
                title="Gerenciar terceiros" 
                icon={<BriefcaseIcon className="w-5 h-5" />} 
                isCollapsed={isCollapsed}
                isOpen={openMenu === 'Gerenciar terceiros'}
                onToggle={() => handleMenuToggle('Gerenciar terceiros')}
            >
                 <div className="flex flex-col space-y-1 py-1">
                    <SubNavLink to="/third-parties">Lista de terceiros colaboradores</SubNavLink>
                </div>
            </CollapsibleMenu>
            
            {canManageCompanies && (
                 <CollapsibleMenu 
                    title="Gerenciar Empresas" 
                    icon={<BuildingOfficeIcon className="w-5 h-5" />} 
                    isCollapsed={isCollapsed}
                    isOpen={openMenu === 'Gerenciar Empresas'}
                    onToggle={() => handleMenuToggle('Gerenciar Empresas')}
                 >
                    <div className="flex flex-col space-y-1 py-1">
                        <SubNavLink to="/companies">Lista de Empresas</SubNavLink>
                    </div>
                </CollapsibleMenu>
            )}

            <CollapsibleMenu 
                title="Painel de controle" 
                icon={<ChartBarIcon className="w-5 h-5" />} 
                isCollapsed={isCollapsed}
                isOpen={openMenu === 'Painel de controle'}
                onToggle={() => handleMenuToggle('Painel de controle')}
            >
                <div className="flex flex-col space-y-1 py-1">
                    <SubNavLink to="/dashboard">Dashbboard</SubNavLink>
                </div>
            </CollapsibleMenu>
        </nav>
      </div>
      <div className="p-4 border-t border-red-900">
        <div className="flex flex-col items-center mb-4">
            <img className="h-16 w-16 rounded-full object-cover mb-3" src="https://picsum.photos/100" alt="User" />
            {!isCollapsed && (
                <div className="text-center">
                    <p className="text-sm font-medium text-white truncate w-48" title={user.email}>{user.email}</p>
                    <p className="text-xs text-red-200">{user.profile}</p>
                </div>
            )}
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          title={isCollapsed ? 'Sair' : undefined}
        >
          <ArrowLeftOnRectangleIcon className={`w-5 h-5 ${!isCollapsed ? 'mr-2' : ''}`} />
          {!isCollapsed && 'Sair'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
