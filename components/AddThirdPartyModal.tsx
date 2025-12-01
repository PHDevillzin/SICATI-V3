
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { XMarkIcon } from './icons/HeroIcons';
import { useToast } from '../contexts/ToastContext';
import { ThirdParty } from '../pages/ManageThirdPartiesPage';
import { Company } from '../pages/ManageCompaniesPage';

interface AddThirdPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (thirdParty: Omit<ThirdParty, 'id' | 'history'>) => void;
  companies: Company[];
}

const unitData = {
    SESI: ["Agudos", "Alumínio", "Álvares Machado", "Americana", "Amparo", "Andradina", "Araçatuba", "Araraquara", "Araras", "Assis", "Avaré", "Bariri", "Barra Bonita", "Barretos", "Batatais", "Bauru", "Birigui", "Botucatu", "Bragança Paulista", "Campinas", "Cotia", "Cruzeiro", "Cubatão", "Diadema", "Guarulhos", "Indaiatuba", "Itapetininga", "Itu", "Jundiaí", "Lençóis Paulista", "Limeira", "Mauá", "Mogi Guaçu", "Osasco", "Piracicaba", "Presidente Epitácio", "Presidente Prudente", "Ribeirão Preto", "Rio Claro", "Salto", "Santa Bárbara D'Oeste", "Santa Cruz do Rio Pardo", "Santa Rita do Passa Quatro", "Santana de Parnaíba", "Santo Anastácio", "Santo André", "Santos", "São Bernardo do Campo", "São Caetano do Sul", "São Carlos", "São João da Boa Vista", "São José do Rio Preto", "São José dos Campos", "SP - Belenzinho", "SP - Ipiranga", "SP - Tatuapé", "SP - Vila Bianca", "SP - Vila Císper", "SP - Vila Carrão", "SP - Vila das Mercês", "SP - Vila Espanhola", "SP - Vila Leopoldina", "SP - Lauzane Paulista", "SP - Cidade A.E. Carvalho", "São Roque", "Sertãozinho", "Suzano", "Taubaté"].map(u => `SESI - ${u}`),
    SENAI: ["Alumínio", "Araras", "Barra Bonita", "Barueri", "Bauru", "Campinas", "Cotia", "Cruzeiro", "Diadema", "Franco da Rocha", "Guarulhos", "Jandira", "Jundiaí", "Lençóis Paulista", "Limeira", "Mairinque", "Mogi das Cruzes", "Mogi Guaçu", "Osasco", "Piracicaba", "Pirassununga", "Presidente Prudente", "Ribeirão Preto", "Rio Claro", "Santo André", "São Bernardo do Campo", "São Caetano do Sul", "São João da Boa Vista", "São José dos Campos", "SP - Barra Funda", "SP - Bom Retiro", "SP - Brás", "SP - Cambuci", "SP - Ipiranga", "SP - Leopoldina", "SP - Mooca", "SP - Pirituba", "SP - Santo Amaro", "SP - Vila Alpina", "SP - Vila Anastácio", "SP - Vila Mariana", "Sertãozinho", "Sorocaba", "Suzano", "Sumaré", "Tatuí", "Taubaté", "Valinhos", "Votuporanga"].map(u => `SENAI - ${u}`)
};

const escolaridadeOptions = ['Não Informado', 'Ensino Fundamental', 'Ensino Médio', 'Ensino Superior', 'Pós-Graduação'];
const generoOptions = ['Não Informado', 'Masculino', 'Feminino', 'Outros'];
const jornadaOptions = ['Jornada 44h Semanais', 'Jornada 12H36', 'Jornada Parcial'];

const formatCPF = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
const formatDate = (v: string) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2');
const formatCEP = (v: string) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');

const initialState: Omit<ThirdParty, 'id' | 'history'> = {
    unidades: [],
    entidade: '',
    razaoSocial: '',
    cnpj: '',
    name: '',
    cpf: '',
    escolaridade: 'Não Informado',
    genero: 'Não Informado',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    uf: '',
    cep: '',
    obsReferencia: '',
    pais: 'Brasil',
    dataNascimento: '',
    cargo: '',
    dataInicioVinculo: '',
    dataInicioAtividades: '',
    dataEncerramentoAtividades: '',
    jornadaTrabalho: 'Jornada 44h Semanais',
    recebeInsalubridade: 'Não',
    naturezaAdicional: undefined,
    dataInicioInsalubridade: '',
    dataTerminoInsalubridade: '',
    status: 'Ativo',
};

type FormState = Omit<ThirdParty, 'id' | 'history'>;
  
const AddThirdPartyModal: React.FC<AddThirdPartyModalProps> = ({ isOpen, onClose, onSave, companies }) => {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [unitSearch, setUnitSearch] = useState('');
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const unitRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  
  const [availableCargos, setAvailableCargos] = useState<string[]>([]);
  
  const resetForm = useCallback(() => {
    setFormState(initialState);
    setAvailableCargos([]);
  }, []);

  const handleClose = useCallback(() => {
    const hasData = JSON.stringify(formState) !== JSON.stringify(initialState);
    if (hasData) {
        showToast('Cadastro cancelado. Nenhuma alteração foi salva.', 'warning');
    }
    resetForm();
    onClose();
  }, [resetForm, onClose, formState, showToast]);
  
  const handleSave = () => {
    const requiredFields: (keyof Omit<FormState, 'naturezaAdicional' | 'genero' | 'escolaridade' | 'dataInicioInsalubridade' | 'dataTerminoInsalubridade' | 'dataEncerramentoAtividades' | 'complemento' | 'obsReferencia' | 'endereco' | 'numero' | 'bairro' | 'cidade' | 'estado' | 'uf' | 'cep' | 'pais'>)[] = [
        'unidades', 'entidade', 'razaoSocial', 'cnpj', 'name', 'cpf', 
        'dataNascimento', 'cargo', 'dataInicioVinculo', 'dataInicioAtividades',
        'jornadaTrabalho', 'recebeInsalubridade'
    ];
    for (const field of requiredFields) {
        const value = formState[field as keyof typeof formState];
        if (!value || (Array.isArray(value) && value.length === 0)) {
            showToast(`O campo "${field}" é obrigatório.`, 'warning');
            return;
        }
    }

    if (formState.recebeInsalubridade === 'Sim') {
        if (!formState.naturezaAdicional) {
            showToast('O campo "Natureza do adicional de insalubridade ou periculosidade." é obrigatório.', 'warning');
            return;
        }
        if (!formState.dataInicioInsalubridade) {
            showToast('O campo "Data início Insalubridade e Periculosidade." é obrigatório.', 'warning');
            return;
        }
        if (formState.naturezaAdicional === 'Temporário' && !formState.dataTerminoInsalubridade) {
            showToast('O campo "Data Término insalubridade e Periculosidade." é obrigatório para natureza temporária.', 'warning');
            return;
        }
    }

    onSave(formState);
  };

  const handleCompanyChange = (razaoSocial: string) => {
    const company = companies.find(c => c.name === razaoSocial);
    let newAvailableCargos: string[] = [];
    let newCnpj = '';

    if (company) {
        newCnpj = company.cnpj;
        const companyServices = new Set<string>();
        // Consolidate unique services from all active contracts
        company.contracts.forEach(contract => {
            if (contract.status === 'Ativo') {
                contract.serviceProvided.forEach(service => companyServices.add(service));
            }
        });
        newAvailableCargos = Array.from(companyServices).sort();
        if (newAvailableCargos.length === 0) {
            showToast(`A empresa "${razaoSocial}" não possui serviços ativos cadastrados.`, 'warning');
        }
    }
    
    setAvailableCargos(newAvailableCargos);
    
    setFormState(prev => {
        // If the current cargo is not in the new list, reset it
        const newCargo = newAvailableCargos.includes(prev.cargo) ? prev.cargo : '';
        return {
            ...prev,
            razaoSocial: razaoSocial,
            cnpj: newCnpj,
            cargo: newCargo,
        };
    });
  };

  const toggleUnit = (unit: string) => {
    setFormState(prev => {
        const newUnidades = prev.unidades.includes(unit)
            ? prev.unidades.filter(u => u !== unit)
            : [...prev.unidades, unit];
        
        const hasSesi = newUnidades.some(u => u.startsWith('SESI'));
        const hasSenai = newUnidades.some(u => u.startsWith('SENAI'));
        
        let entidade = '';
        if (hasSesi && hasSenai) entidade = 'SESI/SENAI';
        else if (hasSesi) entidade = 'SESI';
        else if (hasSenai) entidade = 'SENAI';
        
        return { ...prev, unidades: newUnidades, entidade };
    });
  };
  
  const handleInsalubridadeChange = (val: 'Sim' | 'Não') => {
    setFormState(p => {
        const newState = { ...p, recebeInsalubridade: val };
        if (val === 'Não') {
            newState.naturezaAdicional = undefined;
            newState.dataInicioInsalubridade = '';
            newState.dataTerminoInsalubridade = '';
        }
        return newState;
    });
  };
  
  const handleNaturezaChange = (val: 'Temporário' | 'Definitivo') => {
    setFormState(p => {
        const newState = { ...p, naturezaAdicional: val };
        if (val === 'Definitivo') {
            newState.dataTerminoInsalubridade = '';
        }
        return newState;
    });
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen, resetForm]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleClose]);
  
  const filteredUnits = {
      SESI: unitData.SESI.filter(u => u.toLowerCase().includes(unitSearch.toLowerCase())),
      SENAI: unitData.SENAI.filter(u => u.toLowerCase().includes(unitSearch.toLowerCase())),
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Cadastrar Terceiro</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
        </div>

        <div className="space-y-4 max-h-[70vh] pr-2 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Unidade and Entidade */}
                <div className="md:col-span-2 relative" ref={unitRef}>
                  <label className="block text-sm font-medium text-gray-700">Unidade <span className="text-red-500">*</span></label>
                  <div className="mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[42px]">
                      {formState.unidades.map(unit => (
                          <span key={unit} className="flex items-center bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                              {unit}
                              <button onClick={() => toggleUnit(unit)} className="ml-2 text-red-500 hover:text-red-700"><XMarkIcon className="w-3 h-3" /></button>
                          </span>
                      ))}
                      <input type="text" value={unitSearch} onChange={(e) => setUnitSearch(e.target.value)} onFocus={() => setIsUnitDropdownOpen(true)} placeholder={formState.unidades.length === 0 ? "Selecione..." : ""} className="flex-grow bg-transparent focus:outline-none text-sm" />
                  </div>
                  {isUnitDropdownOpen && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                          {filteredUnits.SESI.length > 0 && <ul>{filteredUnits.SESI.map(unit => <li key={unit} className={`px-3 py-2 cursor-pointer hover:bg-red-100 ${formState.unidades.includes(unit) ? 'bg-red-50' : ''}`} onMouseDown={() => { toggleUnit(unit); setUnitSearch(''); }}>{unit}</li>)}</ul>}
                          {filteredUnits.SENAI.length > 0 && <div><h3 className="px-3 py-2 font-bold text-sm text-gray-500 bg-gray-50 border-t">SENAI</h3><ul>{filteredUnits.SENAI.map(unit => <li key={unit} className={`px-3 py-2 cursor-pointer hover:bg-red-100 ${formState.unidades.includes(unit) ? 'bg-red-50' : ''}`} onMouseDown={() => { toggleUnit(unit); setUnitSearch(''); }}>{unit}</li>)}</ul></div>}
                      </div>
                  )}
                </div>
                <ReadOnlyField label="Entidade" value={formState.entidade} />

                {/* Company Info */}
                <div className="md:col-span-2">
                    <SelectField label="Razão Social da Contratada" value={formState.razaoSocial} onChange={handleCompanyChange} options={companies.map(c => c.name)} required />
                </div>
                <ReadOnlyField label="CNPJ da Contratada" value={formState.cnpj} />

                {/* Personal Info */}
                <div className="md:col-span-2"><InputField label="Nome Completo do Terceiro" value={formState.name} onChange={v => setFormState(p => ({...p, name: v}))} required /></div>
                <InputField label="CPF" value={formState.cpf} onChange={v => setFormState(p => ({...p, cpf: formatCPF(v)}))} required />
                <SelectField label="Escolaridade" value={formState.escolaridade} onChange={v => setFormState(p => ({...p, escolaridade: v as any}))} options={escolaridadeOptions} />
                <SelectField label="Gênero" value={formState.genero} onChange={v => setFormState(p => ({...p, genero: v as any}))} options={generoOptions} />
                <InputField label="Data de nascimento" value={formState.dataNascimento} onChange={v => setFormState(p => ({...p, dataNascimento: formatDate(v)}))} required />

                {/* Address */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-4"><InputField label="Endereço" value={formState.endereco} onChange={v => setFormState(p => ({...p, endereco: v}))} /></div>
                    <div className="md:col-span-2"><InputField label="Número" value={formState.numero} onChange={v => setFormState(p => ({...p, numero: v}))} /></div>
                    <div className="md:col-span-3"><InputField label="Complemento" value={formState.complemento || ''} onChange={v => setFormState(p => ({...p, complemento: v}))} /></div>
                    <div className="md:col-span-3"><InputField label="Bairro" value={formState.bairro} onChange={v => setFormState(p => ({...p, bairro: v}))} /></div>
                    <div className="md:col-span-3"><InputField label="CEP" value={formState.cep} onChange={v => setFormState(p => ({...p, cep: formatCEP(v)}))} /></div>
                    <div className="md:col-span-3"><InputField label="Cidade" value={formState.cidade} onChange={v => setFormState(p => ({...p, cidade: v}))} /></div>
                    <div className="md:col-span-2"><InputField label="Estado" value={formState.estado} onChange={v => setFormState(p => ({...p, estado: v}))} /></div>
                    <div className="md:col-span-1"><InputField label="UF" value={formState.uf} onChange={v => setFormState(p => ({...p, uf: v.toUpperCase()}))} maxLength={2} /></div>
                    <div className="md:col-span-3"><InputField label="País" value={formState.pais} onChange={v => setFormState(p => ({...p, pais: v}))} /></div>
                    <div className="md:col-span-6"><InputField label="OBS/Referência" value={formState.obsReferencia || ''} onChange={v => setFormState(p => ({...p, obsReferencia: v}))} /></div>
                </div>

                {/* Work Info */}
                <div>
                    <label htmlFor="cargo-add" className="block text-sm font-medium text-gray-700">Cargo <span className="text-red-500">*</span></label>
                    <select
                        id="cargo-add"
                        value={formState.cargo}
                        onChange={(e) => setFormState(p => ({...p, cargo: e.target.value}))}
                        disabled={!formState.razaoSocial || availableCargos.length === 0}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="">
                            {!formState.razaoSocial ? 'Selecione uma empresa' : 'Selecione um cargo'}
                        </option>
                        {availableCargos.map(cargo => (
                            <option key={cargo} value={cargo}>
                                {cargo}
                            </option>
                        ))}
                    </select>
                    {availableCargos.length === 0 && formState.razaoSocial && (
                        <p className="text-xs text-gray-500 mt-1">Nenhum cargo/serviço disponível para esta empresa.</p>
                    )}
                </div>
                <InputField label="Data de início do vínculo" value={formState.dataInicioVinculo} onChange={v => setFormState(p => ({...p, dataInicioVinculo: formatDate(v)}))} required />
                <InputField label="Data de início das atividades" value={formState.dataInicioAtividades} onChange={v => setFormState(p => ({...p, dataInicioAtividades: formatDate(v)}))} required />
                <SelectField label="Jornada de Trabalho" value={formState.jornadaTrabalho} onChange={v => setFormState(p => ({...p, jornadaTrabalho: v as any}))} options={jornadaOptions} required/>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Recebe adicional de insalubridade ou periculosidade? <span className="text-red-500">*</span></label>
                    <div className="flex gap-4 mt-2">
                       <RadioOption name="insalubridade" label="Sim" value="Sim" checked={formState.recebeInsalubridade === 'Sim'} onChange={(val) => handleInsalubridadeChange(val as any)} />
                       <RadioOption name="insalubridade" label="Não" value="Não" checked={formState.recebeInsalubridade === 'Não'} onChange={(val) => handleInsalubridadeChange(val as any)} />
                    </div>
                </div>
                {formState.recebeInsalubridade === 'Sim' && (
                  <React.Fragment>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Natureza do adicional de insalubridade ou periculosidade. <span className="text-red-500">*</span></label>
                          <div className="flex gap-4 mt-2">
                             <RadioOption name="naturezaAdicional" label="Temporário" value="Temporário" checked={formState.naturezaAdicional === 'Temporário'} onChange={(val) => handleNaturezaChange(val as any)} />
                             <RadioOption name="naturezaAdicional" label="Definitivo" value="Definitivo" checked={formState.naturezaAdicional === 'Definitivo'} onChange={(val) => handleNaturezaChange(val as any)} />
                          </div>
                      </div>
                      <InputField label="Data início Insalubridade e Periculosidade." value={formState.dataInicioInsalubridade || ''} onChange={v => setFormState(p => ({ ...p, dataInicioInsalubridade: formatDate(v) }))} required />
                      {formState.naturezaAdicional === 'Temporário' && (
                          <InputField label="Data Término insalubridade e Periculosidade." value={formState.dataTerminoInsalubridade || ''} onChange={v => setFormState(p => ({ ...p, dataTerminoInsalubridade: formatDate(v) }))} required />
                      )}
                  </React.Fragment>
                )}
            </div>
        </div>

        <div className="flex justify-between items-center border-t pt-4 mt-4">
            <p className="text-xs text-gray-500">Os campos obrigatórios estão marcados com *</p>
            <div className="space-x-3">
                <button onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">Cancelar</button>
                <button onClick={handleSave} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">Salvar</button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const InputField: React.FC<{label: string, value: string, onChange: (v: string) => void, required?: boolean, maxLength?: number}> = ({label, value, onChange, required, maxLength}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
    </div>
);
const ReadOnlyField: React.FC<{label: string, value: string}> = ({label, value}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input type="text" value={value} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm cursor-not-allowed" />
    </div>
);
const SelectField: React.FC<{label: string, value: string, onChange: (v: string) => void, options: string[], required?: boolean}> = ({label, value, onChange, options, required}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm">
            <option value="">Selecione...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);
const RadioOption: React.FC<{name: string, label: string, value: string, checked: boolean, readOnly?: boolean, onChange?: (value: string) => void}> = ({ name, label, value, checked, readOnly, onChange }) => (
    <label className="flex items-center space-x-2">
        <input 
            type="radio" 
            name={name} 
            value={value} 
            checked={checked} 
            disabled={readOnly}
            onChange={() => onChange && !readOnly ? onChange(value) : undefined}
            className={`h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500 ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);

export default AddThirdPartyModal;
