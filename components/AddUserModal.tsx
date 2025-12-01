
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { XMarkIcon } from './icons/HeroIcons';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

interface NewUser {
    name: string;
    email: string;
    profile: string;
    units: string[];
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: NewUser) => void;
}

const potentialUsers = [
    { name: 'Ana Silva', email: 'ana.silva@sesisenaisp.org.br' },
    { name: 'Carlos Pereira', email: 'carlos.pereira@sesisenaisp.org.br' },
    { name: 'Ricardo de Lima', email: 'ricardo.lima@sesisenaisp.org.br' },
    { name: 'Silvia Salva', email: 'silvia.salva@sesisenaisp.org.br' },
    { name: 'Zelita Zeta', email: 'zelita.zeta@sesisenaisp.org.br' },
].sort((a, b) => a.name.localeCompare(b.name));

const unitData = {
    SESI: [
        "Agudos", "Alumínio", "Álvares Machado", "Americana", "Amparo", "Andradina", "Araçatuba", "Araraquara", "Araras", "Assis", "Avaré", "Bariri", "Barra Bonita", "Barretos", "Batatais", "Bauru", "Birigui", "Botucatu", "Bragança Paulista", "Campinas", "Cotia", "Cruzeiro", "Cubatão", "Diadema", "Guarulhos", "Indaiatuba", "Itapetininga", "Itu", "Jundiaí", "Lençóis Paulista", "Limeira", "Mauá", "Mogi Guaçu", "Osasco", "Piracicaba", "Presidente Epitácio", "Presidente Prudente", "Ribeirão Preto", "Rio Claro", "Salto", "Santa Bárbara D'Oeste", "Santa Cruz do Rio Pardo", "Santa Rita do Passa Quatro", "Santana de Parnaíba", "Santo Anastácio", "Santo André", "Santos", "São Bernardo do Campo", "São Caetano do Sul", "São Carlos", "São João da Boa Vista", "São José do Rio Preto", "São José dos Campos", "SP - Belenzinho", "SP - Ipiranga", "SP - Tatuapé", "SP - Vila Bianca", "SP - Vila Císper", "SP - Vila Carrão", "SP - Vila das Mercês", "SP - Vila Espanhola", "SP - Vila Leopoldina", "SP - Lauzane Paulista", "SP - Cidade A.E. Carvalho", "São Roque", "Sertãozinho", "Suzano", "Taubaté"
    ].map(u => `SESI - ${u}`),
    SENAI: [
        "Alumínio", "Araras", "Barra Bonita", "Barueri", "Bauru", "Campinas", "Cotia", "Cruzeiro", "Diadema", "Franco da Rocha", "Guarulhos", "Jandira", "Jundiaí", "Lençóis Paulista", "Limeira", "Mairinque", "Mogi das Cruzes", "Mogi Guaçu", "Osasco", "Piracicaba", "Pirassununga", "Presidente Prudente", "Ribeirão Preto", "Rio Claro", "Santo André", "São Bernardo do Campo", "São Caetano do Sul", "São João da Boa Vista", "São José dos Campos", "SP - Barra Funda", "SP - Bom Retiro", "SP - Brás", "SP - Cambuci", "SP - Ipiranga", "SP - Leopoldina", "SP - Mooca", "SP - Pirituba", "SP - Santo Amaro", "SP - Vila Alpina", "SP - Vila Anastácio", "SP - Vila Mariana", "Sertãozinho", "Sorocaba", "Suzano", "Sumaré", "Tatuí", "Taubaté", "Valinhos", "Votuporanga"
    ].map(u => `SENAI - ${u}`)
};


const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState('');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  const [suggestions, setSuggestions] = useState<typeof potentialUsers>([]);
  const [isNameInputActive, setIsNameInputActive] = useState(false);
  
  const [unitSearch, setUnitSearch] = useState('');
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const unitRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const isUnitFieldDisabled = profile === 'Gerência de Facilities' || profile === 'Sede';

  const profileOptions = useMemo(() => {
    if (!currentUser) return [];

    if (currentUser.profile === 'Gerência de Facilities') {
        return ['Gerência de Facilities', 'Sede', 'Gestor de unidade', 'Unidade'];
    }
    if (currentUser.profile === 'Gestor de unidade') {
      // Gestor de unidade can ONLY create Unidade users
      return ['Unidade'];
    }
    if (currentUser.profile === 'Unidade') {
      return ['Unidade'];
    }
    // For other profiles (e.g. Sede), they cannot create users (should be blocked by parent component anyway).
    return [];
  }, [currentUser]);

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

  useEffect(() => {
    if (isUnitFieldDisabled) {
      setSelectedUnits([]);
    }
  }, [isUnitFieldDisabled]);


  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setProfile('');
    setSelectedUnits([]);
    setSuggestions([]);
    setIsNameInputActive(false);
    setUnitSearch('');
    setIsUnitDropdownOpen(false);
  }, []);

  const handleClose = useCallback(() => {
    const hasData = name || email || profile || selectedUnits.length > 0;
    if (hasData) {
        showToast('Cadastro cancelado. Nenhuma alteração foi salva.', 'warning');
    }
    resetForm();
    onClose();
  }, [resetForm, onClose, name, email, profile, selectedUnits.length, showToast]);
  
  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);

    const filtered = potentialUsers.filter(user => 
      user.name.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
    
    const exactMatch = potentialUsers.find(u => u.name.toLowerCase() === value.toLowerCase());
    setEmail(exactMatch ? exactMatch.email : '');
  };
  
  const handleNameInputFocus = () => {
    setIsNameInputActive(true);
    const filtered = potentialUsers.filter(user => 
        user.name.toLowerCase().includes(name.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    const user = potentialUsers.find(u => u.email.toLowerCase() === value.toLowerCase());
    if (user) {
        setName(user.name);
    }
  };
  
  const handleSuggestionClick = (user: typeof potentialUsers[0]) => {
      setName(user.name);
      setEmail(user.email);
      setSuggestions([]);
      setIsNameInputActive(false);
  };

  const handleSave = () => {
    if (!name || !email || !profile) {
      showToast("Por favor, preencha todos os campos obrigatórios.", 'warning');
      return;
    }
    if (!isUnitFieldDisabled && selectedUnits.length === 0) {
        showToast("Para este perfil, é necessário selecionar ao menos uma unidade.", 'warning');
        return;
    }
    onSave({ name, email, profile, units: selectedUnits });
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
    if (!isOpen) {
        resetForm();
    }
  }, [isOpen, resetForm]);

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


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Cadastrar perfil de usuário</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className={`space-y-4 max-h-[70vh] pr-2 ${isUnitDropdownOpen ? 'overflow-visible' : 'overflow-y-auto'}`}>
          <div className="relative">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameInputChange}
              onFocus={handleNameInputFocus}
              onBlur={() => setTimeout(() => setIsNameInputActive(false), 200)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="Digite para buscar um usuário"
              autoComplete="off"
            />
             {isNameInputActive && suggestions.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                {suggestions.map(user => (
                  <li 
                    key={user.email} 
                    className="px-3 py-2 cursor-pointer hover:bg-red-100"
                    onMouseDown={() => handleSuggestionClick(user)}
                  >
                    {user.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail <span className="text-red-500">*</span></label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="Digite o e-mail ou selecione um nome"
            />
          </div>

          <div>
            <label htmlFor="profile" className="block text-sm font-medium text-gray-700">Perfil <span className="text-red-500">*</span></label>
            <select
              id="profile"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            >
              <option value="">Selecione um perfil</option>
              {profileOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          
          <div className="relative" ref={unitRef}>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unidades <span className="text-red-500">*</span></label>
            <div className={`mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[42px] ${isUnitFieldDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                {selectedUnits.map(unit => (
                    <span key={unit} className="flex items-center bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                        {unit}
                        <button 
                            onClick={() => toggleUnit(unit)} 
                            className={`ml-2 text-red-500 hover:text-red-700 ${isUnitFieldDisabled ? 'cursor-not-allowed' : ''}`}
                            disabled={isUnitFieldDisabled}
                        >
                            <XMarkIcon className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={unitSearch}
                    onChange={(e) => setUnitSearch(e.target.value)}
                    onFocus={() => !isUnitFieldDisabled && setIsUnitDropdownOpen(true)}
                    placeholder={selectedUnits.length === 0 ? "Selecione uma ou mais unidades" : ""}
                    className="flex-grow bg-transparent focus:outline-none text-sm"
                    disabled={isUnitFieldDisabled}
                />
            </div>
             {isUnitDropdownOpen && !isUnitFieldDisabled && (
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
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
