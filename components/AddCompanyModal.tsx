
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { XMarkIcon } from './icons/HeroIcons';
import { useToast } from '../contexts/ToastContext';
import { Contract } from '../pages/ManageCompaniesPage';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; cnpj: string; firstContract: Omit<Contract, 'id' | 'status'> }) => void;
}

const formatCNPJ = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
};

const formatDate = (value: string) => {
    return value
        .replace(/\D/g, '')
        .slice(0, 8)
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2');
};

const formatPsda = (value: string) => {
    return value
        .replace(/\D/g, '')
        .slice(0, 7)
        .replace(/(\d{5})(\d)/, '$1/$2');
};

const serviceOptions = [
    'Limpeza',
    'Portaria',
    'Jardinagem',
    'Vigilância e seg. patrimonial',
    'Vigia escolar'
];

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [numeroContrato, setNumeroContrato] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [psda, setPsda] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [otherService, setOtherService] = useState('');
  const serviceRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
        prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const filteredServices = serviceOptions.filter(s =>
    s.toLowerCase().includes(serviceSearch.toLowerCase()) && !selectedServices.includes(s)
  );

  const resetForm = useCallback(() => {
    setName('');
    setCnpj('');
    setNumeroContrato('');
    setDataInicio('');
    setPsda('');
    setSelectedServices([]);
    setServiceSearch('');
    setIsServiceDropdownOpen(false);
    setOtherService('');
  }, []);

  const handleClose = useCallback(() => {
    if (name || cnpj || numeroContrato || dataInicio || psda || selectedServices.length > 0 || otherService) {
        showToast('Cadastro cancelado. Nenhuma alteração foi salva.', 'warning');
    }
    resetForm();
    onClose();
  }, [resetForm, onClose, name, cnpj, numeroContrato, dataInicio, psda, selectedServices, otherService, showToast]);

  const handleSave = () => {
    let finalServices = [...selectedServices];
    if (finalServices.includes('Outros')) {
      if (!otherService.trim()) {
        showToast("Por favor, especifique o serviço para a opção 'Outros'.", 'warning');
        return;
      }
      finalServices = finalServices.filter(s => s !== 'Outros').concat(otherService.trim());
    }

    if (!name || !cnpj || !numeroContrato || !dataInicio || !psda || finalServices.length === 0) {
      showToast("Por favor, preencha todos os campos obrigatórios.", 'warning');
      return;
    }
    if (cnpj.replace(/\D/g, '').length !== 14) {
      showToast("CNPJ inválido. Deve conter 14 dígitos.", 'warning');
      return;
    }
    onSave({
      name,
      cnpj,
      firstContract: { numeroContrato, dataInicio, psda, serviceProvided: finalServices }
    });
    resetForm();
  };
  
  useEffect(() => {
    if (!isOpen) {
        resetForm();
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (serviceRef.current && !serviceRef.current.contains(event.target as Node)) {
            setIsServiceDropdownOpen(false);
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
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Cadastrar Nova Empresa e Contrato</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className={`space-y-6 max-h-[70vh] pr-2 ${isServiceDropdownOpen ? 'overflow-visible' : 'overflow-y-auto'}`}>
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Dados da Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="md:col-span-2">
                        <InputField label="Nome da Empresa" value={name} onChange={setName} placeholder="Nome social da empresa" required maxLength={255} />
                    </div>
                    <InputField label="CNPJ" value={cnpj} onChange={(v) => setCnpj(formatCNPJ(v))} placeholder="00.000.000/0000-00" required />
                </div>
            </div>
             <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Dados do Contrato</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <InputField label="Número do Contrato" value={numeroContrato} onChange={setNumeroContrato} placeholder="Contrato" required maxLength={15} />
                    <InputField label="PSDA" value={psda} onChange={(v) => setPsda(formatPsda(v))} placeholder="00000/00" required maxLength={8} />
                    <InputField label="Data inicial" value={dataInicio} onChange={(v) => setDataInicio(formatDate(v))} placeholder="DD/MM/AAAA" required />
                    <div className="md:col-span-3">
                        <div className="relative" ref={serviceRef}>
                            <label className="block text-sm font-medium text-gray-700">Serviço prestado <span className="text-red-500">*</span></label>
                            <div className="mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[42px] bg-white cursor-text" onClick={() => setIsServiceDropdownOpen(true)}>
                                {selectedServices.map(service => (
                                    <span key={service} className="flex items-center bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                        {service}
                                        <button onClick={(e) => { e.stopPropagation(); toggleService(service); }} className="ml-2 text-red-500 hover:text-red-700"><XMarkIcon className="w-3 h-3" /></button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    value={serviceSearch}
                                    onChange={(e) => setServiceSearch(e.target.value)}
                                    onFocus={() => setIsServiceDropdownOpen(true)}
                                    placeholder={selectedServices.length === 0 ? "Selecione um ou mais serviços" : ""}
                                    className="flex-grow bg-transparent focus:outline-none text-sm p-1"
                                />
                            </div>
                            {isServiceDropdownOpen && (
                                <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                    <ul>
                                        {filteredServices.length > 0 ? filteredServices.map(service => (
                                            <li key={service}
                                                className="px-3 py-2 cursor-pointer hover:bg-red-100"
                                                onMouseDown={() => {
                                                    toggleService(service);
                                                    setServiceSearch('');
                                                }}
                                            >
                                                {service}
                                            </li>
                                        )) : <li className="px-3 py-2 text-sm text-gray-500">Nenhum serviço encontrado.</li>}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    {selectedServices.includes('Outros') && (
                        <div className="md:col-span-3">
                            <InputField 
                                label="Especifique o serviço 'Outros'"
                                value={otherService}
                                onChange={setOtherService}
                                placeholder="Ex: Manutenção de Ar Condicionado"
                                required
                            />
                        </div>
                    )}
                </div>
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

const InputField: React.FC<{
    label: string, 
    value: string, 
    onChange: (val: string) => void, 
    placeholder: string,
    required?: boolean,
    maxLength?: number
}> = ({label, value, onChange, placeholder, required, maxLength}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            placeholder={placeholder}
            maxLength={maxLength}
        />
    </div>
);

export default AddCompanyModal;
