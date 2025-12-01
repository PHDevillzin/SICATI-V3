
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { XMarkIcon } from './icons/HeroIcons';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  nif: string;
  name: string;
  email: string;
  unidade: string;
  profile: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user: User | null;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const [profile, setProfile] = useState('');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  
  const [unitSearch, setUnitSearch] = useState('');
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const unitRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const unitData = {
    SESI: [
        "Agudos", "Alumínio", "Álvares Machado", "Americana", "Amparo", "Andradina", "Araçatuba", "Araraquara", "Araras", "Assis", "Avaré", "Bariri", "Barra Bonita", "Barretos", "Batatais", "Bauru", "Birigui", "Botucatu", "Bragança Paulista", "Campinas", "Cotia", "Cruzeiro", "Cubatão", "Diadema", "Guarulhos", "Indaiatuba", "Itapetininga", "Itu", "Jundiaí", "Lençóis Paulista", "Limeira", "Mauá", "Mogi Guaçu", "Osasco", "Piracicaba", "Presidente Epitácio", "Presidente Prudente", "Ribeirão Preto", "Rio Claro", "Salto", "Santa Bárbara D'Oeste", "Santa Cruz do Rio Pardo", "Santa Rita do Passa Quatro", "Santana de Parnaíba", "Santo Anastácio", "Santo André", "Santos", "São Bernardo do Campo", "São Caetano do Sul", "São Carlos", "São João da Boa Vista", "São José do Rio Preto", "São José dos Campos", "SP - Belenzinho", "SP - Ipiranga", "SP - Tatuapé", "SP - Vila Bianca", "SP - Vila Císper", "SP - Vila Carrão", "SP - Vila das Mercês", "SP - Vila Espanhola", "SP - Vila Leopoldina", "SP - Lauzane Paulista", "SP - Cidade A.E. Carvalho", "São Roque", "Sertãozinho", "Suzano", "Taubaté"
    ].map(u => `SESI - ${u}`),
    SENAI: [
        "Alumínio", "Araras", "Barra Bonita", "Barueri", "Bauru", "Campinas", "Cotia", "Cruzeiro", "Diadema", "Franco da Rocha", "Guarulhos", "Jandira", "Jundiaí", "Lençóis Paulista", "Limeira", "Mairinque", "Mogi das Cruzes", "Mogi Guaçu", "Osasco", "Piracicaba", "Pirassununga", "Presidente Prudente", "Ribeirão Preto", "Rio Claro", "Santo André", "São Bernardo do Campo", "São Caetano do Sul", "São João da Boa Vista", "São José dos Campos", "SP - Barra Funda", "SP - Bom Retiro", "SP - Brás", "SP - Cambuci", "SP - Ipiranga", "SP - Leopoldina", "SP - Mooca", "SP - Pirituba", "SP - Santo Amaro", "SP - Vila Alpina", "SP - Vila Anastácio", "SP - Vila Mariana", "Sertãozinho", "Sorocaba", "Suzano", "Sumaré", "Tatuí", "Taubaté", "Valinhos", "Votuporanga"
    ].map(u => `SENAI - ${u}`)
  };

  const availableUnits = useMemo(() => {
    if (!currentUser) return { SESI: [], SENAI: [] };

    if (currentUser.profile === 'Gestor de unidade' || currentUser.profile === 'Unidade') {
        const userUnits = currentUser.unidade.split(',').map(u => u.trim());
        const sesiUnits = userUnits.filter(u => u.startsWith('SESI'));
        const senaiUnits = userUnits.filter(u => u.startsWith('SENAI'));
        
        return {
            SESI: sesiUnits,
            SENAI: senaiUnits,
        };
    }
    return unitData;
  }, [currentUser]);

  const isUnitFieldDisabled = profile === 'Gerência de Facilities' || profile === 'Sede';
  
  const isFormDisabled = useMemo(() => {
    if (!currentUser || !user) return false;
    // The form is disabled if a user with 'Sede' profile is being edited
    // by anyone other than 'Gerência de Facilities'.
    return user.profile === 'Sede' && currentUser.profile !== 'Gerência de Facilities';
  }, [currentUser, user]);

  const profileOptions = useMemo(() => {
    if (!currentUser) return [];

    let options: string[];
    if (currentUser.profile === 'Gerência de Facilities') {
        options = ['Gerência de Facilities', 'Sede', 'Gestor de unidade', 'Unidade'];
    } else if (currentUser.profile === 'Gestor de unidade') {
        // Gestor de unidade can ONLY assign Unidade profile
        options = ['Unidade'];
    } else if (currentUser.profile === 'Unidade') {
        options = ['Unidade'];
    } else {
        // For other profiles (e.g. Sede), they cannot assign profiles
        options = [];
    }

    // Ensure the user's current profile is always in the list to prevent a blank dropdown
    if (user && !options.includes(user.profile)) {
        options.push(user.profile);
    }
    return options;
  }, [currentUser, user]);


  useEffect(() => {
    if (user) {
        setProfile(user.profile);
        setSelectedUnits(user.unidade.split(', ').filter(Boolean));
    } else {
        // Reset form if no user is provided (e.g., when modal closes)
        setProfile('');
        setSelectedUnits([]);
    }
  }, [user, isOpen]);
  
  useEffect(() => {
    if (isUnitFieldDisabled) {
      setSelectedUnits([]);
    }
  }, [isUnitFieldDisabled, profile]);


  const handleClose = useCallback(() => {
    if (user) {
        const originalProfile = user.profile;
        const originalUnits = user.unidade.split(', ').filter(Boolean).sort().join(',');
        
        const currentProfile = profile;
        const currentUnits = [...selectedUnits].sort().join(',');

        if (originalProfile !== currentProfile || originalUnits !== currentUnits) {
            showToast('Edição cancelada. Nenhuma alteração foi salva.', 'warning');
        }
    }
    setUnitSearch('');
    setIsUnitDropdownOpen(false);
    onClose();
  }, [onClose, user, profile, selectedUnits, showToast]);

  const handleSave = () => {
    if (isFormDisabled) {
        showToast("Você não tem permissão para editar um usuário com perfil Sede.", 'error');
        return;
    }
    if (!profile) {
      showToast("Por favor, selecione um perfil.", 'warning');
      return;
    }
    if (!isUnitFieldDisabled && selectedUnits.length === 0) {
      showToast("Para este perfil, é necessário selecionar ao menos uma unidade.", 'warning');
      return;
    }
    if (user) {
        onSave({ ...user, profile, unidade: selectedUnits.join(', ') });
    }
  };

  const toggleUnit = (unit: string) => {
      setSelectedUnits(prev => 
          prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]
      );
  };

  const filteredUnits = {
      SESI: availableUnits.SESI.filter(u => u.toLowerCase().includes(unitSearch.toLowerCase())),
      SENAI: availableUnits.SENAI.filter(u => u.toLowerCase().includes(unitSearch.toLowerCase())),
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (unitRef.current && !unitRef.current.contains(event.target as Node)) {
            setIsUnitDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [handleClose]);


  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Editar usuários</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className={`space-y-4 max-h-[70vh] pr-2 ${isUnitDropdownOpen ? 'overflow-visible' : 'overflow-y-auto'}`}>
           <div>
            <label htmlFor="name-edit" className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              id="name-edit"
              value={user.name}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="email-edit" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              id="email-edit"
              value={user.email}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="profile-edit" className="block text-sm font-medium text-gray-700">Perfil <span className="text-red-500">*</span></label>
            <select
              id="profile-edit"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              disabled={isFormDisabled}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            >
              <option value="">Selecione um perfil</option>
              {profileOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          
          <div className="relative" ref={unitRef}>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unidades <span className="text-red-500">*</span></label>
            <div className={`mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[42px] ${isUnitFieldDisabled || isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                {selectedUnits.map(unit => (
                    <span key={unit} className="flex items-center bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                        {unit}
                        <button 
                            onClick={() => toggleUnit(unit)} 
                            className={`ml-2 text-red-500 hover:text-red-700 ${isUnitFieldDisabled || isFormDisabled ? 'cursor-not-allowed' : ''}`}
                            disabled={isUnitFieldDisabled || isFormDisabled}
                        >
                            <XMarkIcon className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={unitSearch}
                    onChange={(e) => setUnitSearch(e.target.value)}
                    onFocus={() => !(isUnitFieldDisabled || isFormDisabled) && setIsUnitDropdownOpen(true)}
                    placeholder={selectedUnits.length === 0 ? "Selecione uma ou mais unidades" : ""}
                    className="flex-grow bg-transparent focus:outline-none text-sm"
                    disabled={isUnitFieldDisabled || isFormDisabled}
                />
            </div>
             {isUnitDropdownOpen && !(isUnitFieldDisabled || isFormDisabled) && (
                 <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {filteredUnits.SESI.length > 0 && (
                        <div>
                            <h3 className="px-3 py-2 font-bold text-sm text-gray-500 bg-gray-50">Escolas SESI em SP</h3>
                            <ul>
                                {filteredUnits.SESI.map(unit => (
                                     <li key={unit} 
                                        className={`px-3 py-2 cursor-pointer hover:bg-red-100 ${selectedUnits.includes(unit) ? 'bg-red-50' : ''}`}
                                        onMouseDown={() => {
                                            toggleUnit(unit);
                                            setUnitSearch('');
                                        }}
                                    >
                                        {unit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                     {filteredUnits.SENAI.length > 0 && (
                        <div>
                            <h3 className="px-3 py-2 font-bold text-sm text-gray-500 bg-gray-50 border-t">Escolas SENAI em SP</h3>
                            <ul>
                                {filteredUnits.SENAI.map(unit => (
                                     <li key={unit} 
                                        className={`px-3 py-2 cursor-pointer hover:bg-red-100 ${selectedUnits.includes(unit) ? 'bg-red-50' : ''}`}
                                        onMouseDown={() => {
                                            toggleUnit(unit);
                                            setUnitSearch('');
                                        }}
                                    >
                                        {unit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                 </div>
             )}
          </div>
        </div>

        <div className="flex justify-between items-center border-t pt-4 mt-4">
          <p className="text-xs text-gray-500">Os campos obrigatórios estão marcados com *</p>
          <div className="space-x-3">
            <button 
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isFormDisabled}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
