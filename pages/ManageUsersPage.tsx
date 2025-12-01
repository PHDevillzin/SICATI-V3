
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { UsersIcon, PlusIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon, EyeIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon, ChevronDownIcon } from '../components/icons/HeroIcons';
import AddUserModal from '../components/AddUserModal';
import ViewUserModal from '../components/ViewUserModal';
import EditUserModal from '../components/EditUserModal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../src/services/api';

interface User {
  id: number;
  nif: string;
  name: string;
  email: string;
  unidade: string;
  profile: string;
  createdBy: string;
  createdAt: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

// FIX: Apply 'as const' to the literal array declaration to create a readonly tuple type.
// This ensures type safety for the filterBy state.
const filterOptions = ['Nome', 'E-mail'] as const;

const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [unitData, setUnitData] = useState<{ SESI: string[], SENAI: string[] }>({ SESI: [], SENAI: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [filterBy, setFilterBy] = useState<'Nome' | 'E-mail'>('Nome');

  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileFilterRef = useRef<HTMLDivElement>(null);

  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const unitFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      loadData();
  }, []);

  const loadData = async () => {
      try {
          const [usersData, unitsData] = await Promise.all([
              api.get('/users'),
              api.get('/units')
          ]);
          setUsers(usersData.sort((a: User, b: User) => a.name.localeCompare(b.name)));
          setUnitData(unitsData);
      } catch (error) {
          console.error("Failed to load data", error);
      }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterBy, selectedProfiles, selectedUnits]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileFilterRef.current && !profileFilterRef.current.contains(event.target as Node)) {
            setIsProfileDropdownOpen(false);
        }
        if (unitFilterRef.current && !unitFilterRef.current.contains(event.target as Node)) {
            setIsUnitDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  if (!currentUser) return <Navigate to="/login" />; // Should not happen in protected route, but good for safety

  const canManageUsers = currentUser.profile === 'Gerência de Facilities' || currentUser.profile === 'Gestor de unidade' || currentUser.profile === 'Unidade';

  if (!canManageUsers) {
    return <Navigate to="/" />;
  }

  // --- Role-based Access Control ---
  const canAdd = currentUser.profile === 'Gerência de Facilities' || currentUser.profile === 'Gestor de unidade' || currentUser.profile === 'Unidade';
  const canEdit = currentUser.profile === 'Gerência de Facilities' || currentUser.profile === 'Gestor de unidade' || currentUser.profile === 'Unidade';
  const isRestrictedView = currentUser.profile === 'Gestor de unidade' || currentUser.profile === 'Unidade';

  const usersToDisplay = useMemo(() => {
    if (!isRestrictedView) return users;
    
    // Split current user's units into an array
    const currentUserUnits = currentUser.unidade.split(',').map(u => u.trim());
    
    return users.filter(user => {
        // Check if any of the user's units match any of the current user's units
        if (!user.unidade) return false;
        const userUnits = user.unidade.split(',').map(u => u.trim());
        return userUnits.some(unit => currentUserUnits.includes(unit));
    });
  }, [users, isRestrictedView, currentUser.unidade]);
  
  const allProfiles = useMemo(() => {
      const profiles = new Set(usersToDisplay.map(u => u.profile));
      return Array.from(profiles).sort();
  }, [usersToDisplay]);

  const allUnits = useMemo(() => {
      return [...unitData.SESI, ...unitData.SENAI].sort();
  }, []);


  const handleSaveUser = async (newUser: { name: string; email: string; profile: string; units: string[] }) => {
    try {
        const createdByUser = currentUser?.name || 'Sistema';
        const createdAtDate = new Date().toLocaleDateString('pt-BR');
        const newUnidade = newUser.units.join(', ');
        const isSesi = newUnidade.startsWith('SESI');
        
        // Generate NIF logic should ideally be in backend, but for now we can do it here or let backend handle it.
        // Backend User model doesn't auto-generate NIF.
        // I'll fetch current users to calculate NIF? No, that's race-condition prone.
        // I'll assume for now we just generate a random one or let backend handle it if I update backend.
        // But the requirement is "logic... must function the same".
        // The frontend logic was:
        /*
          const sesiNifs = prevUsers.filter(u => u.nif.startsWith('SS')).map(u => parseInt(u.nif.substring(2)));
          const senaiNifs = prevUsers.filter(u => u.nif.startsWith('SN')).map(u => parseInt(u.nif.substring(2)));
          const maxSesi = sesiNifs.length > 0 ? Math.max(...sesiNifs) : 0;
          const maxSenai = senaiNifs.length > 0 ? Math.max(...senaiNifs) : 0;
          const newNif = isSesi ? ... : ...;
        */
        // I can do this with the `users` state I have.
        
        const sesiNifs = users.filter(u => u.nif && u.nif.startsWith('SS')).map(u => parseInt(u.nif!.substring(2)));
        const senaiNifs = users.filter(u => u.nif && u.nif.startsWith('SN')).map(u => parseInt(u.nif!.substring(2)));
        const maxSesi = sesiNifs.length > 0 ? Math.max(...sesiNifs) : 0;
        const maxSenai = senaiNifs.length > 0 ? Math.max(...senaiNifs) : 0;
        
        const newNif = isSesi
           ? `SS${String(maxSesi + 1).padStart(4, '0')}`
           : `SN${String(maxSenai + 1).padStart(4, '0')}`;

        const payload = {
            name: newUser.name,
            email: newUser.email,
            profile: newUser.profile,
            unidade: newUnidade,
            nif: newNif,
            createdBy: createdByUser,
            createdAt: createdAtDate
        };
        
        await api.post('/users', payload);
        loadData();
        setIsAddModalOpen(false);
        showToast('Usuário cadastrado com sucesso!', 'success');
    } catch (error) {
        console.error("Error saving user", error);
        showToast('Erro ao cadastrar usuário.', 'error');
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
        const lastEditedByUser = currentUser?.name || 'Sistema';
        const lastEditedAtDate = new Date().toLocaleDateString('pt-BR');
        
        const payload = {
            ...updatedUser,
            lastEditedBy: lastEditedByUser,
            lastEditedAt: lastEditedAtDate
        };

        await api.put(`/users/${updatedUser.id}`, payload);
        loadData();
        setIsEditModalOpen(false);
        setSelectedUser(null);
        showToast('Usuário atualizado com sucesso!', 'success');
    } catch (error) {
        console.error("Error updating user", error);
        showToast('Erro ao atualizar usuário.', 'error');
    }
  };


  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterBy('Nome');
    setSelectedProfiles([]);
    setSelectedUnits([]);
    setIsAdvancedFilterOpen(false);
    showToast('Filtros redefinidos.', 'success');
  };
  
  const handleProfileFilterChange = (profile: string) => {
    setSelectedProfiles(prev => {
        if (prev.includes(profile)) {
            return prev.filter(p => p !== profile);
        } else {
            return [...prev, profile];
        }
    });
  };

  const handleUnitFilterChange = (unit: string) => {
    setSelectedUnits(prev => {
        if (prev.includes(unit)) {
            return prev.filter(u => u !== unit);
        } else {
            return [...prev, unit];
        }
    });
  };

  const filteredUsers = useMemo(() => usersToDisplay.filter(user => {
    const term = searchTerm.trim().toLowerCase();
    
    if (term) {
        let match = false;
        switch (filterBy) {
            case 'E-mail':
                match = user.email.toLowerCase().includes(term);
                break;
            case 'Nome':
            default:
                match = user.name.toLowerCase().includes(term);
                break;
        }
        if (!match) return false;
    }

    if (selectedProfiles.length > 0 && !selectedProfiles.includes(user.profile)) {
        return false;
    }

    if (selectedUnits.length > 0) {
        const userUnits = user.unidade.split(', ');
        if (!userUnits.some(unit => selectedUnits.includes(unit))) {
            return false;
        }
    }

    return true;
  }), [usersToDisplay, searchTerm, filterBy, selectedProfiles, selectedUnits]);
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  

  return (
    <div className="container mx-auto">
      {canAdd && <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveUser} />}
      <ViewUserModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} user={selectedUser} />
      {canEdit && <EditUserModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleUpdateUser}
        user={selectedUser}
      />}

      {/* Header */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center">
            <UsersIcon className="w-6 h-6 text-gray-500 mr-3" />
            <h1 className="text-xl font-semibold text-gray-700">Lista de Usuários</h1>
        </div>
        {canAdd && (
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                <PlusIcon className="w-5 h-5 mr-2" />
                Adicionar Usuário
            </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center w-full sm:w-auto max-w-md">
                <input 
                    type="text"
                    placeholder={`Procurar por ${filterBy.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button className="px-4 py-2 bg-red-600 text-white rounded-r-md hover:bg-red-700">
                    <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleClearFilters}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                    title="Limpar todos os filtros"
                >
                    <XMarkIcon className="w-5 h-5 mr-2" />
                    Limpar Filtros
                </button>
                <button 
                    onClick={() => setIsAdvancedFilterOpen(prev => !prev)}
                    className={`flex items-center px-4 py-2 border rounded-md transition-colors ${
                        isAdvancedFilterOpen ? 'bg-red-100 border-red-300 text-red-800' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                    Filtros Avançados
                </button>
            </div>
          </div>
          {isAdvancedFilterOpen && (
                <div className="w-full pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                    {/* Search filter */}
                    <div>
                        <span className="block text-sm font-medium text-gray-700 mb-2">Buscar em:</span>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {(filterOptions).map(option => (
                                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="filterBy"
                                        value={option}
                                        checked={filterBy === option}
                                        onChange={() => setFilterBy(option)}
                                        className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                                    />
                                    <span className="text-sm text-gray-800">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     {/* Profile filter */}
                    <div className="relative md:border-l md:border-gray-200 md:pl-6" ref={profileFilterRef}>
                        <span className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Perfil:</span>
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileDropdownOpen(prev => !prev)}
                                className="w-full text-left bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                aria-haspopup="listbox"
                                aria-expanded={isProfileDropdownOpen}
                            >
                                <span className="block truncate">
                                    {selectedProfiles.length === 0
                                        ? "Todos"
                                        : selectedProfiles.length === 1
                                            ? selectedProfiles[0]
                                            : `${selectedProfiles.length} perfis selecionados`}
                                </span>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                                </span>
                            </button>
                             {isProfileDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border rounded-md max-h-60 overflow-auto">
                                    <ul className="py-1" role="listbox">
                                        {selectedProfiles.length > 0 && (
                                            <li className="text-sm text-red-600 font-semibold hover:bg-red-50 cursor-pointer px-3 py-2 border-b" onClick={() => setSelectedProfiles([])} role="option">
                                                Limpar Seleção
                                            </li>
                                        )}
                                        {allProfiles.map(profile => (
                                            <li key={profile} className="text-sm text-gray-900 hover:bg-red-50" role="option" aria-selected={selectedProfiles.includes(profile)}>
                                                <label className="flex items-center space-x-3 w-full cursor-pointer px-3 py-2">
                                                    <input type="checkbox" checked={selectedProfiles.includes(profile)} onChange={() => handleProfileFilterChange(profile)} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                                                    <span>{profile}</span>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Unit filter */}
                    <div className="relative lg:border-l lg:border-gray-200 lg:pl-6" ref={unitFilterRef}>
                        <span className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Unidade:</span>
                         <div className="relative">
                            <button
                                onClick={() => setIsUnitDropdownOpen(prev => !prev)}
                                className="w-full text-left bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                aria-haspopup="listbox"
                                aria-expanded={isUnitDropdownOpen}
                            >
                                <span className="block truncate">
                                    {selectedUnits.length === 0
                                        ? "Todas"
                                        : selectedUnits.length === 1
                                            ? selectedUnits[0]
                                            : `${selectedUnits.length} unidades selecionadas`}
                                </span>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                                </span>
                            </button>
                             {isUnitDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border rounded-md">
                                    <ul className="py-1 max-h-52 overflow-auto" role="listbox">
                                        {selectedUnits.length > 0 && (
                                            <li className="text-sm text-red-600 font-semibold hover:bg-red-50 cursor-pointer px-3 py-2 border-b" onClick={() => setSelectedUnits([])} role="option">
                                                Limpar Seleção
                                            </li>
                                        )}
                                        {allUnits.map(unit => (
                                            <li key={unit} className="text-sm text-gray-900 hover:bg-red-50" role="option" aria-selected={selectedUnits.includes(unit)}>
                                                <label className="flex items-center space-x-3 w-full cursor-pointer px-3 py-2">
                                                    <input type="checkbox" checked={selectedUnits.includes(unit)} onChange={() => handleUnitFilterChange(unit)} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                                                    <span>{unit}</span>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full table-fixed">
            <thead className="bg-[#800000] text-white">
                <tr>
                    <th className="w-1/4 py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">Nome</th>
                    <th className="w-1/4 py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">Unidade</th>
                    <th className="w-[15%] py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">Perfil</th>
                    <th className="w-1/4 py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                    <th className="w-[10%] py-3 px-6 text-center text-xs font-medium uppercase tracking-wider">Ações</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6 text-sm font-medium text-gray-900 truncate" title={user.name}>{user.name}</td>
                        <td className="py-4 px-6 text-sm text-gray-500 truncate" title={user.unidade}>{user.unidade.split(', ')[0]}</td>
                        <td className="py-4 px-6 text-sm text-gray-500 truncate" title={user.profile}>{user.profile}</td>
                        <td className="py-4 px-6 text-sm text-gray-500 truncate" title={user.email}>{user.email}</td>
                        <td className="py-4 px-6 whitespace-nowrap text-center text-sm font-medium">
                            <button onClick={() => handleViewUser(user)} className="text-red-600 hover:text-red-900 inline-block" title="Visualizar">
                                <EyeIcon className="w-5 h-5" />
                            </button>
                            {canEdit && (
                                <button onClick={() => handleEditUser(user)} className="text-red-600 hover:text-red-900 inline-block ml-4" title="Editar">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      {totalPages > 1 && (
         <div className="flex items-center justify-between mt-4 bg-white px-4 py-3 rounded-xl shadow">
             <div>
                <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, filteredUsers.length)}</span> de <span className="font-medium">{filteredUsers.length}</span> usuários
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeftIcon className="w-5 h-5 mr-1" />
                    Anterior
                </button>
                <span className="text-sm text-gray-700">Página {currentPage} de {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Próximo
                    <ChevronRightIcon className="w-5 h-5 ml-1" />
                </button>
            </div>
        </div>
       )}
    </div>
  );
};

export default ManageUsersPage;
