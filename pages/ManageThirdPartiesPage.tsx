import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BriefcaseIcon, PlusIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon, EyeIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, ChevronDownIcon, XMarkIcon, ChevronUpIcon, ChevronUpDownIcon } from '../components/icons/HeroIcons';
import AddThirdPartyModal from '../components/AddThirdPartyModal';
import ViewThirdPartyModal from '../components/ViewThirdPartyModal';
import EditThirdPartyModal from '../components/EditThirdPartyModal';
import HistoryThirdPartyModal from '../components/HistoryThirdPartyModal';
import { useToast } from '../contexts/ToastContext';
import { api } from '../src/services/api';
import { Company } from './ManageCompaniesPage';
import { useAuth } from '../contexts/AuthContext';

export interface HistoryEntry {
  changeType: string;
  previousData: string; // Summary of what changed (old value)
  currentData: string; // Summary of what changed (new value)
  snapshotBeforeChange: Omit<ThirdParty, 'history'> | null; // Full object state before this change
  changeDate: string;
  responsible: string;
}

export interface ThirdParty {
  id: number;
  unidades: string[];
  entidade: string;
  razaoSocial: string;
  cnpj: string;
  name: string;
  cpf: string;
  escolaridade: 'Não Informado' | 'Ensino Fundamental' | 'Ensino Médio' | 'Ensino Superior' | 'Pós-Graduação';
  genero: 'Não Informado' | 'Masculino' | 'Feminino' | 'Outros';
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  uf: string;
  cep: string;
  obsReferencia?: string;
  pais: string;
  dataNascimento: string;
  cargo: string;
  dataInicioVinculo: string;
  dataInicioAtividades: string;
  dataEncerramentoAtividades?: string;
  dataEncerramentoVinculo?: string;
  jornadaTrabalho: 'Jornada 44h Semanais' | 'Jornada 12H36' | 'Jornada Parcial';
  recebeInsalubridade: 'Sim' | 'Não';
  naturezaAdicional?: 'Temporário' | 'Definitivo';
  dataInicioInsalubridade?: string;
  dataTerminoInsalubridade?: string;
  status: 'Ativo' | 'Inativo';
  history: HistoryEntry[];
}

// --- Data Generation for New Collaborators ---
// Removed static data generation logic

const escolaridadeOptions: ThirdParty['escolaridade'][] = ['Não Informado', 'Ensino Fundamental', 'Ensino Médio', 'Ensino Superior', 'Pós-Graduação'];
const generoOptions: ThirdParty['genero'][] = ['Não Informado', 'Masculino', 'Feminino', 'Outros'];
const jornadaOptions: ThirdParty['jornadaTrabalho'][] = ['Jornada 44h Semanais', 'Jornada 12H36', 'Jornada Parcial'];
export const cargos = [
    'Limpeza',
    'Portaria',
    'Jardinagem',
    'Vigilância e seg. patrimonial',
    'Vigia escolar',
].sort();

const filterOptions = ['Nome', 'CPF'];

type SortDirection = 'asc' | 'desc';
type SortKey = keyof Pick<ThirdParty, 'name' | 'razaoSocial' | 'cargo' | 'cpf' | 'status' | 'recebeInsalubridade'>;

interface SortConfig {
    key: SortKey;
    direction: SortDirection;
}

const ManageThirdPartiesPage: React.FC = () => {
  const [thirdParties, setThirdParties] = useState<ThirdParty[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [unitData, setUnitData] = useState<{ SESI: string[], SENAI: string[] }>({ SESI: [], SENAI: [] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
        const [tpData, companiesData, unitsData] = await Promise.all([
            api.get('/third-parties'),
            api.get('/companies'),
            api.get('/units')
        ]);
        setThirdParties(tpData.sort((a: ThirdParty, b: ThirdParty) => a.name.localeCompare(b.name)));
        setAllCompanies(companiesData);
        setUnitData(unitsData);
    } catch (error) {
        console.error("Failed to load data", error);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedThirdParty, setSelectedThirdParty] = useState<ThirdParty | null>(null);
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [filterBy, setFilterBy] = useState('Nome');
  const [statusFilter, setStatusFilter] = useState<('Ativo' | 'Inativo')[]>(['Ativo', 'Inativo']);
  const [entityFilter, setEntityFilter] = useState<('SESI' | 'SENAI')[]>(['SESI', 'SENAI']);
  const [insalubridadeFilter, setInsalubridadeFilter] = useState<('Sim' | 'Não')[]>(['Sim', 'Não']);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });

  const [selectedCargos, setSelectedCargos] = useState<string[]>([]);
  const [isCargoDropdownOpen, setIsCargoDropdownOpen] = useState(false);
  const cargoFilterRef = useRef<HTMLDivElement>(null);

  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyFilterRef = useRef<HTMLDivElement>(null);

  const [selectedUnidades, setSelectedUnidades] = useState<string[]>([]);
  const [isUnidadeDropdownOpen, setIsUnidadeDropdownOpen] = useState(false);
  const unidadeFilterRef = useRef<HTMLDivElement>(null);

  const allCargos = useMemo(() => {
    const cargos = new Set(thirdParties.map(tp => tp.cargo));
    return Array.from(cargos).sort();
  }, [thirdParties]);

  const allCompanyNames = useMemo(() => {
    return allCompanies.map(c => c.name).sort();
  }, []);

  const allUnidades = useMemo(() => {
    return [...unitData.SESI, ...unitData.SENAI].sort();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterBy, statusFilter, entityFilter, selectedCargos, selectedUnidades, insalubridadeFilter, selectedCompanies]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (cargoFilterRef.current && !cargoFilterRef.current.contains(event.target as Node)) {
            setIsCargoDropdownOpen(false);
        }
        if (companyFilterRef.current && !companyFilterRef.current.contains(event.target as Node)) {
            setIsCompanyDropdownOpen(false);
        }
        if (unidadeFilterRef.current && !unidadeFilterRef.current.contains(event.target as Node)) {
            setIsUnidadeDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  if (!currentUser) return null;

  // --- Role-based Access Control ---
  const canAdd = currentUser.profile === 'Gerência de Facilities' || currentUser.profile === 'Gestor de unidade' || currentUser.profile === 'Unidade';
  const canEdit = currentUser.profile === 'Gerência de Facilities' || currentUser.profile === 'Gestor de unidade' || currentUser.profile === 'Unidade';
  const isRestrictedView = currentUser.profile === 'Unidade' || currentUser.profile === 'Gestor de unidade';

  const thirdPartiesToDisplay = useMemo(() => {
    if (!isRestrictedView) return thirdParties;
    return thirdParties.filter(tp => tp.unidades.includes(currentUser.unidade));
  }, [thirdParties, isRestrictedView, currentUser.unidade]);


  const handleSaveThirdParty = async (newThirdParty: Omit<ThirdParty, 'id' | 'history'>) => {
    try {
        const createdHistory: HistoryEntry = {
          changeType: 'Criação',
          previousData: '-',
          currentData: 'Cadastro inicial do colaborador',
          snapshotBeforeChange: null,
          changeDate: new Date().toLocaleDateString('pt-BR'),
          responsible: currentUser?.name || 'Sistema'
        };
        
        const payload = {
            ...newThirdParty,
            history: [createdHistory]
        };
        
        await api.post('/third-parties', payload);
        loadData();
        setIsAddModalOpen(false);
        showToast('Terceiro cadastrado com sucesso!', 'success');
    } catch (error) {
        console.error("Error saving third party", error);
        showToast('Erro ao cadastrar terceiro.', 'error');
    }
  };

  const handleUpdateThirdParty = async (updatedThirdParty: ThirdParty) => {
    try {
        await api.put(`/third-parties/${updatedThirdParty.id}`, updatedThirdParty);
        loadData();
        setIsEditModalOpen(false);
        setSelectedThirdParty(null);
        showToast('Terceiro atualizado com sucesso!', 'success');
    } catch (error) {
        console.error("Error updating third party", error);
        showToast('Erro ao atualizar terceiro.', 'error');
    }
  };

  const handleViewThirdParty = (thirdParty: ThirdParty) => {
    setSelectedThirdParty(thirdParty);
    setIsViewModalOpen(true);
  };
  
  const handleEditThirdParty = (thirdParty: ThirdParty) => {
    setSelectedThirdParty(thirdParty);
    setIsEditModalOpen(true);
  };

  const handleViewHistory = (thirdParty: ThirdParty) => {
    setSelectedThirdParty(thirdParty);
    setIsHistoryModalOpen(true);
  };
  
  const handleStatusFilterChange = (status: 'Ativo' | 'Inativo') => {
    setStatusFilter(prev => {
        if (prev.includes(status)) {
            return prev.filter(s => s !== status); // Uncheck: remove from array
        } else {
            return [...prev, status]; // Check: add to array
        }
    });
  };

  const handleEntityFilterChange = (entity: 'SESI' | 'SENAI') => {
    setEntityFilter(prev => {
        if (prev.includes(entity)) {
            return prev.filter(e => e !== entity);
        } else {
            return [...prev, entity];
        }
    });
  };

  const handleInsalubridadeFilterChange = (value: 'Sim' | 'Não') => {
    setInsalubridadeFilter(prev => {
        if (prev.includes(value)) {
            return prev.filter(v => v !== value);
        } else {
            return [...prev, value];
        }
    });
  };

  const handleCargoFilterChange = (cargo: string) => {
    setSelectedCargos(prev => {
        if (prev.includes(cargo)) {
            return prev.filter(c => c !== cargo);
        } else {
            return [...prev, cargo];
        }
    });
  };

  const handleCompanyFilterChange = (company: string) => {
    setSelectedCompanies(prev => {
        if (prev.includes(company)) {
            return prev.filter(c => c !== company);
        } else {
            return [...prev, company];
        }
    });
  };

  const handleUnidadeFilterChange = (unidade: string) => {
    setSelectedUnidades(prev => {
        if (prev.includes(unidade)) {
            return prev.filter(u => u !== unidade);
        } else {
            return [...prev, unidade];
        }
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterBy('Nome');
    setStatusFilter(['Ativo', 'Inativo']);
    setEntityFilter(['SESI', 'SENAI']);
    setInsalubridadeFilter(['Sim', 'Não']);
    setSelectedCargos([]);
    setSelectedCompanies([]);
    setSelectedUnidades([]);
    setIsAdvancedFilterOpen(false);
    showToast('Filtros redefinidos.', 'success');
  };

  const filteredThirdParties = useMemo(() => thirdPartiesToDisplay.filter(tp => {
    if (!statusFilter.includes(tp.status)) {
        return false;
    }
    if (!entityFilter.includes(tp.entidade as 'SESI' | 'SENAI')) {
        return false;
    }
    if (!insalubridadeFilter.includes(tp.recebeInsalubridade)) {
        return false;
    }
    if (selectedCargos.length > 0 && !selectedCargos.includes(tp.cargo)) {
        return false;
    }
    if (selectedCompanies.length > 0 && !selectedCompanies.includes(tp.razaoSocial)) {
        return false;
    }
    if (selectedUnidades.length > 0 && !tp.unidades.some(unidade => selectedUnidades.includes(unidade))) {
        return false;
    }

    const term = searchTerm.trim().toLowerCase();
    if (!term) {
        return true;
    }

    switch (filterBy) {
      case 'CPF':
        return tp.cpf.replace(/\D/g, '').includes(term.replace(/\D/g, ''));
      case 'Nome':
      default:
        return tp.name.toLowerCase().includes(term);
    }
  }), [thirdPartiesToDisplay, searchTerm, filterBy, statusFilter, entityFilter, selectedCargos, selectedCompanies, selectedUnidades, insalubridadeFilter]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedThirdParties = useMemo(() => {
    let sortableItems = [...filteredThirdParties];
    if (sortConfig.key) {
        sortableItems.sort((a, b) => {
            const valA = a[sortConfig.key];
            const valB = b[sortConfig.key];

            if (valA < valB) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }
    return sortableItems;
  }, [filteredThirdParties, sortConfig]);


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedThirdParties.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedThirdParties.length / itemsPerPage);
  
  const SortableHeader: React.FC<{
    columnKey: SortKey;
    title: string;
  }> = ({ columnKey, title }) => {
    const isSorted = sortConfig.key === columnKey;
    const icon = isSorted
        ? (sortConfig.direction === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />)
        : <ChevronUpDownIcon className="h-4 w-4 text-red-300" />;

    return (
        <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider">
            <button
                type="button"
                onClick={() => requestSort(columnKey)}
                className="flex items-center gap-1 hover:text-red-200 transition-colors"
            >
                {title}
                {icon}
            </button>
        </th>
    );
  };

  return (
    <div className="container mx-auto">
      {canAdd && <AddThirdPartyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveThirdParty} companies={allCompanies} />}
      <ViewThirdPartyModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} thirdParty={selectedThirdParty} />
      {canEdit && <EditThirdPartyModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleUpdateThirdParty}
        thirdParty={selectedThirdParty}
        companies={allCompanies}
      />}
      <HistoryThirdPartyModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} thirdParty={selectedThirdParty} />

      <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center">
            <BriefcaseIcon className="w-6 h-6 text-gray-500 mr-3" />
            <h1 className="text-xl font-semibold text-gray-700">Lista de Terceiros</h1>
        </div>
        {canAdd && (
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                <PlusIcon className="w-5 h-5 mr-2" />
                Adicionar Terceiro
            </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center w-full sm:w-auto max-w-md">
                <input 
                    type="text"
                    placeholder={`Procurar por ${filterBy}...`}
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
                <div className="w-full pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-x-8 items-start">
                    {/* Column 1: Search Filter */}
                    <div>
                        <span className="block text-sm font-medium text-gray-700 mb-2">Buscar em:</span>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {filterOptions.map(option => (
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
                    
                    {/* Column 2 & 3: Dropdown Filters */}
                    <div className="space-y-6 md:border-l md:pl-6 md:col-span-2">
                        {/* Cargo/Função filter */}
                        <div className="relative" ref={cargoFilterRef}>
                            <span className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Função:</span>
                            <button onClick={() => setIsCargoDropdownOpen(prev => !prev)} className="w-full text-left bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm" aria-haspopup="listbox" aria-expanded={isCargoDropdownOpen}>
                                <span className="block truncate">{selectedCargos.length === 0 ? "Todas" : selectedCargos.length === 1 ? selectedCargos[0] : `${selectedCargos.length} funções selecionadas`}</span>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><ChevronDownIcon className="h-5 w-5 text-gray-400" /></span>
                            </button>
                            {isCargoDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border rounded-md max-h-60 overflow-auto">
                                    <ul className="py-1" role="listbox">
                                        {selectedCargos.length > 0 && (<li className="text-sm text-red-600 font-semibold hover:bg-red-50 cursor-pointer px-3 py-2 border-b" onClick={() => setSelectedCargos([])} role="option">Limpar Seleção</li>)}
                                        {allCargos.map(cargo => (<li key={cargo} className="text-sm text-gray-900 hover:bg-red-50" role="option" aria-selected={selectedCargos.includes(cargo)}><label className="flex items-center space-x-3 w-full cursor-pointer px-3 py-2"><input type="checkbox" checked={selectedCargos.includes(cargo)} onChange={() => handleCargoFilterChange(cargo)} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" /><span>{cargo}</span></label></li>))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {/* Company filter */}
                        <div className="relative" ref={companyFilterRef}>
                            <span className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Empresa Contratada:</span>
                            <button onClick={() => setIsCompanyDropdownOpen(prev => !prev)} className="w-full text-left bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm" aria-haspopup="listbox" aria-expanded={isCompanyDropdownOpen}>
                                <span className="block truncate">{selectedCompanies.length === 0 ? "Todas" : selectedCompanies.length === 1 ? selectedCompanies[0] : `${selectedCompanies.length} empresas selecionadas`}</span>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><ChevronDownIcon className="h-5 w-5 text-gray-400" /></span>
                            </button>
                            {isCompanyDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border rounded-md">
                                    <ul className="py-1 max-h-52 overflow-auto" role="listbox">
                                        {selectedCompanies.length > 0 && (<li className="text-sm text-red-600 font-semibold hover:bg-red-50 cursor-pointer px-3 py-2 border-b" onClick={() => setSelectedCompanies([])} role="option">Limpar Seleção</li>)}
                                        {allCompanyNames.map(company => (<li key={company} className="text-sm text-gray-900 hover:bg-red-50" role="option" aria-selected={selectedCompanies.includes(company)}><label className="flex items-center space-x-3 w-full cursor-pointer px-3 py-2"><input type="checkbox" checked={selectedCompanies.includes(company)} onChange={() => handleCompanyFilterChange(company)} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" /><span>{company}</span></label></li>))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {/* Unidade filter */}
                        <div className="relative" ref={unidadeFilterRef}>
                            <span className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Unidade:</span>
                            <button onClick={() => setIsUnidadeDropdownOpen(prev => !prev)} className="w-full text-left bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm" aria-haspopup="listbox" aria-expanded={isUnidadeDropdownOpen}>
                                <span className="block truncate">{selectedUnidades.length === 0 ? "Todas" : selectedUnidades.length === 1 ? selectedUnidades[0] : `${selectedUnidades.length} unidades selecionadas`}</span>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><ChevronDownIcon className="h-5 w-5 text-gray-400" /></span>
                            </button>
                            {isUnidadeDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border rounded-md max-h-60 overflow-auto">
                                    <ul className="py-1" role="listbox">
                                        {selectedUnidades.length > 0 && (<li className="text-sm text-red-600 font-semibold hover:bg-red-50 cursor-pointer px-3 py-2 border-b" onClick={() => setSelectedUnidades([])} role="option">Limpar Seleção</li>)}
                                        {allUnidades.map(unidade => (<li key={unidade} className="text-sm text-gray-900 hover:bg-red-50" role="option" aria-selected={selectedUnidades.includes(unidade)}><label className="flex items-center space-x-3 w-full cursor-pointer px-3 py-2"><input type="checkbox" checked={selectedUnidades.includes(unidade)} onChange={() => handleUnidadeFilterChange(unidade)} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" /><span>{unidade}</span></label></li>))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Column 4: Checkbox Filters */}
                    <div className="space-y-4 md:border-l md:pl-6">
                        {/* Status filter */}
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Status:</span>
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                {(['Ativo', 'Inativo'] as const).map(status => (
                                    <label key={status} className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={statusFilter.includes(status)} onChange={() => handleStatusFilterChange(status)} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                                        <span className="text-sm text-gray-800">{status}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {/* Entity filter */}
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Entidade:</span>
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                {(['SESI', 'SENAI'] as const).map(entity => (
                                    <label key={entity} className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={entityFilter.includes(entity)} onChange={() => handleEntityFilterChange(entity)} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                                        <span className="text-sm text-gray-800">{entity}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {/* Insalubridade filter */}
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Insalubridade:</span>
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                <label key="Sim" className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={insalubridadeFilter.includes('Sim')} onChange={() => handleInsalubridadeFilterChange('Sim')} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                                    <span className="text-sm text-gray-800">Recebe</span>
                                </label>
                                <label key="Não" className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={insalubridadeFilter.includes('Não')} onChange={() => handleInsalubridadeFilterChange('Não')} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                                    <span className="text-sm text-gray-800">Não recebe</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full">
            <thead className="bg-[#800000] text-white">
                <tr>
                    <SortableHeader columnKey="name" title="Nome" />
                    <SortableHeader columnKey="razaoSocial" title="Empresa Contratada" />
                    <SortableHeader columnKey="cargo" title="Função" />
                    <SortableHeader columnKey="cpf" title="CPF" />
                    <SortableHeader columnKey="recebeInsalubridade" title="Insalubridade" />
                    <SortableHeader columnKey="status" title="Status" />
                    <th className="py-3 px-6 text-center text-xs font-medium uppercase tracking-wider">Ações</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map(tp => (
                    <tr key={tp.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6 text-sm font-medium text-gray-900 truncate" title={tp.name}>{tp.name}</td>
                        <td className="py-4 px-6 text-sm text-gray-500 truncate" title={tp.razaoSocial}>{tp.razaoSocial}</td>
                        <td className="py-4 px-6 text-sm text-gray-500 truncate">{tp.cargo}</td>
                        <td className="py-4 px-6 text-sm text-gray-500">{tp.cpf}</td>
                        <td className="py-4 px-6 text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tp.recebeInsalubridade === 'Sim' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                            {tp.recebeInsalubridade}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tp.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {tp.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-center text-sm font-medium">
                            <button onClick={() => handleViewThirdParty(tp)} className="text-red-600 hover:text-red-900 inline-block" title="Visualizar">
                                <EyeIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleViewHistory(tp)} className="text-red-600 hover:text-red-900 inline-block ml-4" title="Histórico">
                                <ClockIcon className="w-5 h-5" />
                            </button>
                            {canEdit && (
                                <button onClick={() => handleEditThirdParty(tp)} className="text-red-600 hover:text-red-900 inline-block ml-4" title="Editar">
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
                    Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, sortedThirdParties.length)}</span> de <span className="font-medium">{sortedThirdParties.length}</span> colaboradores
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

export default ManageThirdPartiesPage;