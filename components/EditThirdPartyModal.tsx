
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { XMarkIcon } from './icons/HeroIcons';
import { useToast } from '../contexts/ToastContext';
import { ThirdParty, HistoryEntry } from '../pages/ManageThirdPartiesPage';
import { Company } from '../pages/ManageCompaniesPage';
import { useAuth } from '../contexts/AuthContext';

interface EditThirdPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (thirdParty: ThirdParty) => void;
  thirdParty: ThirdParty | null;
  companies: Company[];
}

interface NewContractState {
    unidades: string[];
    entidade: string;
    razaoSocial: string;
    cnpj: string;
    dataInicioVinculo: string;
    dataInicioAtividades: string;
    jornadaTrabalho: ThirdParty['jornadaTrabalho'];
    cargo: string;
    recebeInsalubridade: 'Sim' | 'Não';
    naturezaAdicional?: 'Temporário' | 'Definitivo';
    dataInicioInsalubridade?: string;
    dataTerminoInsalubridade?: string;
}

const unitData = {
    SESI: ["Agudos", "Alumínio", "Álvares Machado", "Americana", "Amparo", "Andradina", "Araçatuba", "Araraquara", "Araras", "Assis", "Avaré", "Bariri", "Barra Bonita", "Barretos", "Batatais", "Bauru", "Birigui", "Botucatu", "Bragança Paulista", "Campinas", "Cotia", "Cruzeiro", "Cubatão", "Diadema", "Guarulhos", "Indaiatuba", "Itapetininga", "Itu", "Jundiaí", "Lençóis Paulista", "Limeira", "Mauá", "Mogi Guaçu", "Osasco", "Piracicaba", "Presidente Epitácio", "Presidente Prudente", "Ribeirão Preto", "Rio Claro", "Salto", "Santa Bárbara D'Oeste", "Santa Cruz do Rio Pardo", "Santa Rita do Passa Quatro", "Santana de Parnaíba", "Santo Anastácio", "Santo André", "Santos", "São Bernardo do Campo", "São Caetano do Sul", "São Carlos", "São João da Boa Vista", "São José do Rio Preto", "São José dos Campos", "SP - Belenzinho", "SP - Ipiranga", "SP - Tatuapé", "SP - Vila Bianca", "SP - Vila Císper", "SP - Vila Carrão", "SP - Vila das Mercês", "SP - Vila Espanhola", "SP - Vila Leopoldina", "SP - Lauzane Paulista", "SP - Cidade A.E. Carvalho", "São Roque", "Sertãozinho", "Suzano", "Taubaté"].map(u => `SESI - ${u}`),
    SENAI: ["Alumínio", "Araras", "Barra Bonita", "Barueri", "Bauru", "Campinas", "Cotia", "Cruzeiro", "Diadema", "Franco da Rocha", "Guarulhos", "Jandira", "Jundiaí", "Lençóis Paulista", "Limeira", "Mairinque", "Mogi das Cruzes", "Mogi Guaçu", "Osasco", "Piracicaba", "Pirassununga", "Presidente Prudente", "Ribeirão Preto", "Rio Claro", "Santo André", "São Bernardo do Campo", "São Caetano do Sul", "São João da Boa Vista", "São José dos Campos", "SP - Barra Funda", "SP - Bom Retiro", "SP - Brás", "SP - Cambuci", "SP - Ipiranga", "SP - Leopoldina", "SP - Mooca", "SP - Pirituba", "SP - Santo Amaro", "SP - Vila Alpina", "SP - Vila Anastácio", "SP - Vila Mariana", "Sertãozinho", "Sorocaba", "Suzano", "Sumaré", "Tatuí", "Taubaté", "Valinhos", "Votuporanga"].map(u => `SENAI - ${u}`)
};

const escolaridadeOptions = ['Não Informado', 'Ensino Fundamental', 'Ensino Médio', 'Ensino Superior', 'Pós-Graduação'];
const generoOptions = ['Não Informado', 'Masculino', 'Feminino', 'Outros'];
const jornadaOptions = ['Jornada 44h Semanais', 'Jornada 12H36', 'Jornada Parcial'];

const changeTypeOptions = [
    "Encerramento das atividades na unidade.",
    "Encerramento de vínculo com a contratada e início com nova contratada.",
    "Encerramento do contrato de trabalho.",
    "Alteração na jornada de trabalho.",
    "Percepção temporária de adicional de insalubridade ou periculosidade.",
    "Alteração de dados cadastrais",
];

const formatDate = (v: string) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2');
const formatCEP = (v: string) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');


const getFieldLabel = (field: keyof Omit<ThirdParty, 'history' | 'id'>): string => {
    const labels: Record<keyof Omit<ThirdParty, 'history' | 'id'>, string> = {
        unidades: 'Unidades',
        entidade: 'Entidade',
        razaoSocial: 'Razão Social',
        cnpj: 'CNPJ',
        name: 'Nome Completo',
        cpf: 'CPF',
        escolaridade: 'Escolaridade',
        genero: 'Gênero',
        endereco: 'Endereço',
        numero: 'Número',
        complemento: 'Complemento',
        bairro: 'Bairro',
        cidade: 'Cidade',
        estado: 'Estado',
        uf: 'UF',
        cep: 'CEP',
        obsReferencia: 'OBS/Referência',
        pais: 'País',
        dataNascimento: 'Data de Nascimento',
        cargo: 'Cargo',
        dataInicioVinculo: 'Início do Vínculo',
        dataInicioAtividades: 'Início das Atividades',
        dataEncerramentoAtividades: 'Data de encerramento das atividades na unidade',
        dataEncerramentoVinculo: 'Data encerramento do vínculo com a contratada',
        jornadaTrabalho: 'Jornada de Trabalho',
        recebeInsalubridade: 'Recebe Insalubridade',
        naturezaAdicional: 'Natureza do Adicional',
        dataInicioInsalubridade: 'Início Insalubridade',
        dataTerminoInsalubridade: 'Término Insalubridade',
        status: 'Status',
    };
    return labels[field] || field;
};

const getFieldConfig = (changeType: string) => {
    const defaultConfig = {
        unidades: { visible: true, disabled: true },
        entidade: { visible: true, disabled: true },
        razaoSocial: { visible: true, disabled: true },
        cnpj: { visible: true, disabled: true },
        name: { visible: true, disabled: true },
        cpf: { visible: true, disabled: true },
        escolaridade: { visible: true, disabled: true },
        genero: { visible: true, disabled: true },
        dataNascimento: { visible: true, disabled: true },
        endereco: { visible: true, disabled: true },
        numero: { visible: true, disabled: true },
        complemento: { visible: true, disabled: true },
        bairro: { visible: true, disabled: true },
        cidade: { visible: true, disabled: true },
        estado: { visible: true, disabled: true },
        uf: { visible: true, disabled: true },
        cep: { visible: true, disabled: true },
        obsReferencia: { visible: true, disabled: true },
        pais: { visible: true, disabled: true },
        cargo: { visible: true, disabled: true },
        dataInicioVinculo: { visible: true, disabled: true },
        dataInicioAtividades: { visible: true, disabled: true },
        dataEncerramentoAtividades: { visible: false, disabled: true },
        dataEncerramentoVinculo: { visible: false, disabled: true },
        jornadaTrabalho: { visible: true, disabled: true },
        recebeInsalubridade: { visible: true, disabled: true },
        naturezaAdicional: { visible: true, disabled: true },
        dataInicioInsalubridade: { visible: true, disabled: true },
        dataTerminoInsalubridade: { visible: true, disabled: true },
        status: { visible: true, disabled: true },
    };

    if (!changeType) {
        return defaultConfig;
    }

    const hideAllBut = (fields: (keyof typeof defaultConfig)[]) => {
        const config = { ...defaultConfig };
        (Object.keys(config) as (keyof typeof config)[]).forEach(key => {
            if (!fields.includes(key)) {
                config[key] = { visible: false, disabled: true };
            }
        });
        return config;
    };

    switch (changeType) {
        case "Encerramento das atividades na unidade.":
            return {
                ...hideAllBut(['unidades', 'entidade', 'razaoSocial', 'cnpj', 'name', 'cpf', 'cargo', 'dataInicioAtividades', 'dataEncerramentoAtividades']),
                dataEncerramentoAtividades: { visible: true, disabled: false },
            };
        case "Encerramento do contrato de trabalho.":
             return {
                ...hideAllBut(['unidades', 'entidade', 'razaoSocial', 'cnpj', 'name', 'cpf', 'cargo', 'dataInicioAtividades', 'dataEncerramentoAtividades', 'dataEncerramentoVinculo']),
                dataEncerramentoAtividades: { visible: true, disabled: false },
                dataEncerramentoVinculo: { visible: true, disabled: false },
            };
        case "Percepção temporária de adicional de insalubridade ou periculosidade.":
            return {
                ...hideAllBut(['unidades', 'entidade', 'razaoSocial', 'cnpj', 'name', 'cpf', 'cargo', 'recebeInsalubridade', 'naturezaAdicional', 'dataInicioInsalubridade', 'dataTerminoInsalubridade']),
                recebeInsalubridade: { visible: true, disabled: false },
                naturezaAdicional: { visible: true, disabled: false },
                dataInicioInsalubridade: { visible: true, disabled: false },
                dataTerminoInsalubridade: { visible: true, disabled: false },
            };
        case "Alteração de dados cadastrais":
            return {
                ...defaultConfig,
                cpf: { visible: true, disabled: false },
                name: { visible: true, disabled: false },
                dataNascimento: { visible: true, disabled: false },
                dataInicioAtividades: { visible: true, disabled: false },
                escolaridade: { visible: true, disabled: false },
                genero: { visible: true, disabled: false },
                endereco: { visible: true, disabled: false },
                numero: { visible: true, disabled: false },
                complemento: { visible: true, disabled: false },
                bairro: { visible: true, disabled: false },
                cidade: { visible: true, disabled: false },
                estado: { visible: true, disabled: false },
                uf: { visible: true, disabled: false },
                cep: { visible: true, disabled: false },
                obsReferencia: { visible: true, disabled: false },
                pais: { visible: true, disabled: false },
                status: { visible: true, disabled: false },
                dataEncerramentoAtividades: { visible: false, disabled: true },
                dataInicioVinculo: { visible: false, disabled: true },
                jornadaTrabalho: { visible: false, disabled: true },
                recebeInsalubridade: { visible: false, disabled: true },
                naturezaAdicional: { visible: false, disabled: true },
                dataInicioInsalubridade: { visible: false, disabled: true },
                dataTerminoInsalubridade: { visible: false, disabled: true },
            };
        case "Alteração na jornada de trabalho.":
             return {
                ...hideAllBut(['unidades', 'entidade', 'razaoSocial', 'cnpj', 'name', 'cpf', 'cargo', 'jornadaTrabalho']),
            };
        case "Encerramento de vínculo com a contratada e início com nova contratada.":
            // Hide all standard fields; this case has a custom layout
            return Object.keys(defaultConfig).reduce((acc, key) => {
                acc[key as keyof typeof defaultConfig] = { visible: false, disabled: true };
                return acc;
            }, {} as typeof defaultConfig);
        default:
            return defaultConfig;
    }
};


const EditThirdPartyModal: React.FC<EditThirdPartyModalProps> = ({ isOpen, onClose, onSave, thirdParty, companies }) => {
  const [formState, setFormState] = useState<ThirdParty | null>(null);
  const [changeType, setChangeType] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [newJornadaTrabalho, setNewJornadaTrabalho] = useState('');
  const [newContractData, setNewContractData] = useState<NewContractState | null>(null);
  const unitRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  
  const [newContractAvailableCargos, setNewContractAvailableCargos] = useState<string[]>([]);

  const fieldConfig = useMemo(() => getFieldConfig(changeType), [changeType]);

  const resetState = useCallback(() => {
    if (thirdParty) {
      setFormState(JSON.parse(JSON.stringify(thirdParty))); // Deep copy
    } else {
      setFormState(null);
    }
    setChangeType('');
    setNewJornadaTrabalho('');
    setNewContractData(null);
    setNewContractAvailableCargos([]);
  }, [thirdParty]);

  useEffect(() => {
    if (isOpen) {
        resetState();
    }
  }, [thirdParty, isOpen, resetState]);

  const handleClose = useCallback(() => {
    // Per user request, show the warning every time the modal is closed without saving.
    showToast('Edição cancelada. Nenhuma alteração foi salva.', 'warning');
    
    // Reset local UI state for a clean open next time
    setUnitSearch('');
    setIsUnitDropdownOpen(false);

    onClose();
  }, [onClose, showToast]);

  const handleSave = () => {
    if (!formState || !thirdParty) return;

    if (!changeType) {
        showToast('O campo "Tipo de alteração" é obrigatório.', 'warning');
        return;
    }
    
    let updatedState = { ...formState };
    let previousData = '';
    let currentData = '';
    
    // Create a deep copy of the original state for the history snapshot
    const { history, ...snapshot } = thirdParty;
    const snapshotBeforeChange = JSON.parse(JSON.stringify(snapshot));


    // Handle validations and state updates for each change type
    switch (changeType) {
        case "Encerramento das atividades na unidade.":
            if (!updatedState.dataEncerramentoAtividades) {
                showToast('O campo "Data de encerramento das atividades na unidade" é obrigatório.', 'warning');
                return;
            }
            previousData = `Status: ${thirdParty.status}`;
            updatedState.status = 'Inativo';
            currentData = `Status: ${updatedState.status}\nData de Encerramento: ${updatedState.dataEncerramentoAtividades}`;
            break;

        case "Encerramento do contrato de trabalho.":
            if (!updatedState.dataEncerramentoAtividades) {
                showToast('O campo "Data de encerramento das atividades na unidade" é obrigatório.', 'warning');
                return;
            }
            if (!updatedState.dataEncerramentoVinculo) {
                showToast('O campo "Data encerramento do vínculo com a contratada" é obrigatório.', 'warning');
                return;
            }
            previousData = `Status: ${thirdParty.status}`;
            updatedState.status = 'Inativo';
            currentData = `Status: ${updatedState.status}\nEncerramento Atividades: ${updatedState.dataEncerramentoAtividades}\nEncerramento Vínculo: ${updatedState.dataEncerramentoVinculo}`;
            break;

        case "Percepção temporária de adicional de insalubridade ou periculosidade.":
            if (updatedState.recebeInsalubridade === 'Sim') {
                if (!updatedState.naturezaAdicional) { showToast('O campo "Natureza do adicional de insalubridade ou periculosidade." é obrigatório.', 'warning'); return; }
                if (!updatedState.dataInicioInsalubridade) { showToast('O campo "Data início Insalubridade e Periculosidade." é obrigatório.', 'warning'); return; }
                if (updatedState.naturezaAdicional === 'Temporário' && !updatedState.dataTerminoInsalubridade) { showToast('O campo "Data Término insalubridade e Periculosidade." é obrigatório.', 'warning'); return; }
            }
            previousData = `Recebe: ${thirdParty.recebeInsalubridade}\nNatureza: ${thirdParty.naturezaAdicional || '-'}\nInício: ${thirdParty.dataInicioInsalubridade || '-'}`;
            currentData = `Recebe: ${updatedState.recebeInsalubridade}\nNatureza: ${updatedState.naturezaAdicional || '-'}\nInício: ${updatedState.dataInicioInsalubridade || '-'}`;
            if (updatedState.naturezaAdicional === 'Temporário' || thirdParty.naturezaAdicional === 'Temporário') {
                previousData += `\nFim: ${thirdParty.dataTerminoInsalubridade || '-'}`;
                currentData += `\nFim: ${updatedState.dataTerminoInsalubridade || '-'}`;
            }
            break;

        case "Alteração de dados cadastrais":
            const changes: string[] = [];
            const fieldsToCompare: (keyof ThirdParty)[] = ['name', 'cpf', 'escolaridade', 'genero', 'dataNascimento', 'status', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'uf', 'cep', 'obsReferencia', 'pais'];
            
            fieldsToCompare.forEach(field => {
                 if (thirdParty[field as keyof typeof thirdParty] !== updatedState[field as keyof typeof updatedState]) {
                    changes.push(`${getFieldLabel(field as any)}: '${thirdParty[field as keyof typeof thirdParty] || ''}' -> '${updatedState[field as keyof typeof updatedState] || ''}'`);
                }
            });

            if (changes.length === 0) {
                showToast('Nenhuma alteração detectada.', 'warning');
                return;
            }
            previousData = 'Dados originais dos campos alterados.';
            currentData = changes.join('\n');
            break;

        case "Alteração na jornada de trabalho.":
            if (!newJornadaTrabalho) {
                showToast('O campo "Nova Jornada de Trabalho" é obrigatório.', 'warning');
                return;
            }
            previousData = `Jornada: ${thirdParty.jornadaTrabalho}`;
            updatedState.jornadaTrabalho = newJornadaTrabalho as any;
            currentData = `Jornada: ${updatedState.jornadaTrabalho}`;
            break;
            
        case "Encerramento de vínculo com a contratada e início com nova contratada.":
            if (!newContractData) return;
            // Validation for newContractData
            if (newContractData.unidades.length === 0) { showToast('O campo "Entidade/Unidade (Novo Contrato)" é obrigatório.', 'warning'); return; }
            if (!newContractData.razaoSocial) { showToast('O campo "Empresa (Novo Contrato)" é obrigatório.', 'warning'); return; }
            if (!newContractData.cargo) { showToast('O campo "Cargo (Novo Contrato)" é obrigatório.', 'warning'); return; }
            if (!newContractData.dataInicioVinculo) { showToast('O campo "Data de início do vínculo (Novo Contrato)" é obrigatório.', 'warning'); return; }
            if (!newContractData.dataInicioAtividades) { showToast('O campo "Data de início das atividades (Novo Contrato)" é obrigatório.', 'warning'); return; }
            if (!newContractData.jornadaTrabalho) { showToast('O campo "Jornada de Trabalho (Novo Contrato)" é obrigatório.', 'warning'); return; }
            
            if (newContractData.recebeInsalubridade === 'Sim') {
                if (!newContractData.naturezaAdicional) { showToast('O campo "Natureza do adicional de insalubridade ou periculosidade." (Novo Contrato) é obrigatório.', 'warning'); return; }
                if (!newContractData.dataInicioInsalubridade) { showToast('O campo "Data início Insalubridade e Periculosidade." (Novo Contrato) é obrigatório.', 'warning'); return; }
                if (newContractData.naturezaAdicional === 'Temporário' && !newContractData.dataTerminoInsalubridade) { showToast('O campo "Data Término insalubridade e Periculosidade." (Novo Contrato) é obrigatório.', 'warning'); return; }
            }
            previousData = `Empresa: ${thirdParty.razaoSocial}\nInício Atividades: ${thirdParty.dataInicioAtividades}`;
            updatedState = { ...updatedState, ...newContractData };
            currentData = `Nova Empresa: ${updatedState.razaoSocial}\nNovo Início Atividades: ${updatedState.dataInicioAtividades}`;
            break;
    }

    const newHistoryEntry: HistoryEntry = {
      changeType,
      previousData,
      currentData,
      snapshotBeforeChange,
      changeDate: new Date().toLocaleDateString('pt-BR'),
      responsible: currentUser?.name || 'Sistema',
    };

    updatedState.history = [...updatedState.history, newHistoryEntry];
    onSave(updatedState);
  };
  
  const handleChangeType = (newType: string) => {
    setChangeType(newType);
    if (newType === "Encerramento de vínculo com a contratada e início com nova contratada." && thirdParty) {
        setNewContractData({
            unidades: thirdParty.unidades, // Pre-fill
            entidade: thirdParty.entidade, // Pre-fill
            razaoSocial: '',
            cnpj: '',
            dataInicioVinculo: '',
            dataInicioAtividades: '',
            jornadaTrabalho: 'Jornada 44h Semanais',
            cargo: thirdParty.cargo,
            recebeInsalubridade: 'Não',
        });
    } else {
        setNewContractData(null);
    }
  };

  const handleNewContractCompanyChange = (razaoSocial: string) => {
    const company = companies.find(c => c.name === razaoSocial);
    let newAvailableCargos: string[] = [];
    let newCnpj = '';
    
    if (company) {
        newCnpj = company.cnpj;
        const companyServices = new Set<string>();
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
    
    setNewContractAvailableCargos(newAvailableCargos);

    setNewContractData(prev => {
        if (!prev) return null;
        const newCargo = newAvailableCargos.includes(prev.cargo) ? prev.cargo : '';
        return { ...prev, razaoSocial, cnpj: newCnpj, cargo: newCargo };
    });
  };

  const toggleNewContractUnit = (unit: string) => {
    setNewContractData(prev => {
        if (!prev) return null;
        const newUnidades = prev.unidades.includes(unit) ? prev.unidades.filter(u => u !== unit) : [...prev.unidades, unit];
        const hasSesi = newUnidades.some(u => u.startsWith('SESI'));
        const hasSenai = newUnidades.some(u => u.startsWith('SENAI'));
        let entidade = '';
        if (hasSesi && hasSenai) entidade = 'SESI/SENAI';
        else if (hasSesi) entidade = 'SESI';
        else if (hasSenai) entidade = 'SENAI';
        return { ...prev, unidades: newUnidades, entidade };
    });
  };

  const handleInsalubridadeChange = (val: 'Sim' | 'Não', isNewContract: boolean) => {
    const setState = isNewContract ? setNewContractData : setFormState;
    setState(p => {
        if (!p) return null;
        const newState = { ...p, recebeInsalubridade: val };
        if (val === 'Não') {
            newState.naturezaAdicional = undefined;
            newState.dataInicioInsalubridade = undefined;
            newState.dataTerminoInsalubridade = undefined;
        }
        return newState as any;
    });
  };

  const handleNaturezaChange = (val: 'Temporário' | 'Definitivo', isNewContract: boolean) => {
    const setState = isNewContract ? setNewContractData : setFormState;
    setState(p => {
        if (!p) return null;
        const newState = { ...p, naturezaAdicional: val };
        if (val === 'Definitivo') {
            newState.dataTerminoInsalubridade = undefined;
        }
        return newState as any;
    });
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (unitRef.current && !unitRef.current.contains(event.target as Node)) setIsUnitDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen || !formState) return null;
  
  const filteredUnits = {
      SESI: unitData.SESI.filter(u => u.toLowerCase().includes(unitSearch.toLowerCase())),
      SENAI: unitData.SENAI.filter(u => u.toLowerCase().includes(unitSearch.toLowerCase())),
  };
  
  const renderStandardForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {fieldConfig.unidades.visible && <ReadOnlyField label="Unidade" value={formState.unidades.join(', ')} containerClassName="md:col-span-2" />}
        {fieldConfig.entidade.visible && <ReadOnlyField label="Entidade" value={formState.entidade} />}
        {fieldConfig.razaoSocial.visible && <ReadOnlyField label="Razão Social" value={formState.razaoSocial} containerClassName="md:col-span-2" />}
        {fieldConfig.cnpj.visible && <ReadOnlyField label="CNPJ" value={formState.cnpj} />}
        {fieldConfig.name.visible && <InputField label="Nome Completo" value={formState.name} onChange={v => setFormState(p => p ? ({...p, name: v}) : null)} required disabled={fieldConfig.name.disabled} containerClassName="md:col-span-2" />}
        {fieldConfig.cpf.visible && <InputField label="CPF" value={formState.cpf} onChange={v => setFormState(p => p ? ({...p, cpf: v}) : null)} required disabled={fieldConfig.cpf.disabled} />}
        {fieldConfig.escolaridade.visible && <SelectField label="Escolaridade" value={formState.escolaridade} onChange={v => setFormState(p => p ? ({...p, escolaridade: v as any}) : null)} options={escolaridadeOptions} disabled={fieldConfig.escolaridade.disabled} />}
        {fieldConfig.genero.visible && <SelectField label="Gênero" value={formState.genero} onChange={v => setFormState(p => p ? ({...p, genero: v as any}) : null)} options={generoOptions} disabled={fieldConfig.genero.disabled} />}
        {fieldConfig.dataNascimento.visible && <InputField label="Data de nascimento" value={formState.dataNascimento} onChange={v => setFormState(p => p ? ({...p, dataNascimento: formatDate(v)}) : null)} required disabled={fieldConfig.dataNascimento.disabled} />}
        
        {fieldConfig.endereco.visible && (
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-4"><InputField label="Endereço" value={formState.endereco} onChange={v => setFormState(p => p ? ({...p, endereco: v}) : null)} disabled={fieldConfig.endereco.disabled} /></div>
                <div className="md:col-span-2"><InputField label="Número" value={formState.numero} onChange={v => setFormState(p => p ? ({...p, numero: v}) : null)} disabled={fieldConfig.numero.disabled} /></div>
                <div className="md:col-span-3"><InputField label="Complemento" value={formState.complemento || ''} onChange={v => setFormState(p => p ? ({...p, complemento: v}) : null)} disabled={fieldConfig.complemento.disabled} /></div>
                <div className="md:col-span-3"><InputField label="Bairro" value={formState.bairro} onChange={v => setFormState(p => p ? ({...p, bairro: v}) : null)} disabled={fieldConfig.bairro.disabled} /></div>
                <div className="md:col-span-3"><InputField label="CEP" value={formState.cep} onChange={v => setFormState(p => p ? ({...p, cep: formatCEP(v)}) : null)} disabled={fieldConfig.cep.disabled} /></div>
                <div className="md:col-span-3"><InputField label="Cidade" value={formState.cidade} onChange={v => setFormState(p => p ? ({...p, cidade: v}) : null)} disabled={fieldConfig.cidade.disabled} /></div>
                <div className="md:col-span-2"><InputField label="Estado" value={formState.estado} onChange={v => setFormState(p => p ? ({...p, estado: v}) : null)} disabled={fieldConfig.estado.disabled} /></div>
                <div className="md:col-span-1"><InputField label="UF" value={formState.uf} onChange={v => setFormState(p => p ? ({...p, uf: v.toUpperCase()}) : null)} maxLength={2} disabled={fieldConfig.uf.disabled} /></div>
                <div className="md:col-span-3"><InputField label="País" value={formState.pais} onChange={v => setFormState(p => p ? ({...p, pais: v}) : null)} disabled={fieldConfig.pais.disabled} /></div>
                <div className="md:col-span-6"><InputField label="OBS/Referência" value={formState.obsReferencia || ''} onChange={v => setFormState(p => p ? ({...p, obsReferencia: v}) : null)} disabled={fieldConfig.obsReferencia.disabled} /></div>
            </div>
        )}

        {fieldConfig.cargo.visible && <InputField label="Cargo" value={formState.cargo} onChange={v => setFormState(p => p ? ({...p, cargo: v}) : null)} required disabled={fieldConfig.cargo.disabled} />}
        {fieldConfig.dataInicioVinculo.visible && <InputField label="Data de início do vínculo" value={formState.dataInicioVinculo} onChange={v => setFormState(p => p ? ({...p, dataInicioVinculo: formatDate(v)}) : null)} required disabled={fieldConfig.dataInicioVinculo.disabled} />}
        {fieldConfig.dataInicioAtividades.visible && <InputField label="Data de início das atividades" value={formState.dataInicioAtividades} onChange={v => setFormState(p => p ? ({...p, dataInicioAtividades: formatDate(v)}) : null)} required disabled={fieldConfig.dataInicioAtividades.disabled} />}
        {fieldConfig.dataEncerramentoAtividades.visible && <InputField label="Data de encerramento das atividades" value={formState.dataEncerramentoAtividades || ''} onChange={v => setFormState(p => p ? ({ ...p, dataEncerramentoAtividades: formatDate(v) }) : null)} required disabled={fieldConfig.dataEncerramentoAtividades.disabled} />}
        {fieldConfig.dataEncerramentoVinculo.visible && <InputField label="Data encerramento do vínculo" value={formState.dataEncerramentoVinculo || ''} onChange={v => setFormState(p => p ? ({ ...p, dataEncerramentoVinculo: formatDate(v) }) : null)} required disabled={fieldConfig.dataEncerramentoVinculo.disabled} />}
        {fieldConfig.jornadaTrabalho.visible && <SelectField label={changeType === 'Alteração na jornada de trabalho.' ? 'Jornada de Trabalho (Atual)' : 'Jornada de Trabalho'} value={formState.jornadaTrabalho} onChange={v => setFormState(p => p ? ({...p, jornadaTrabalho: v as any}) : null)} options={jornadaOptions} required disabled={fieldConfig.jornadaTrabalho.disabled} />}
        {changeType === 'Alteração na jornada de trabalho.' && <SelectField label="Nova Jornada de Trabalho" value={newJornadaTrabalho} onChange={setNewJornadaTrabalho} options={jornadaOptions} required />}
        {fieldConfig.recebeInsalubridade.visible && <RadioGroup label="Recebe adicional de insalubridade ou periculosidade?" value={formState.recebeInsalubridade} onChange={(v) => handleInsalubridadeChange(v as any, false)} disabled={fieldConfig.recebeInsalubridade.disabled} required={!fieldConfig.recebeInsalubridade.disabled} />}
        {formState.recebeInsalubridade === 'Sim' && fieldConfig.naturezaAdicional.visible && <RadioGroup label="Natureza do adicional de insalubridade ou periculosidade." value={formState.naturezaAdicional || ''} onChange={(v) => handleNaturezaChange(v as any, false)} options={['Temporário', 'Definitivo']} disabled={fieldConfig.naturezaAdicional.disabled} required={!fieldConfig.naturezaAdicional.disabled} />}
        {formState.recebeInsalubridade === 'Sim' && fieldConfig.dataInicioInsalubridade.visible && <InputField label="Data início Insalubridade e Periculosidade." value={formState.dataInicioInsalubridade || ''} onChange={v => setFormState(p => p ? ({ ...p, dataInicioInsalubridade: formatDate(v) }) : null)} required disabled={fieldConfig.dataInicioInsalubridade.disabled} />}
        {formState.recebeInsalubridade === 'Sim' && formState.naturezaAdicional === 'Temporário' && fieldConfig.dataTerminoInsalubridade.visible && <InputField label="Data Término insalubridade e Periculosidade." value={formState.dataTerminoInsalubridade || ''} onChange={v => setFormState(p => p ? ({ ...p, dataTerminoInsalubridade: formatDate(v) }) : null)} required disabled={fieldConfig.dataTerminoInsalubridade.disabled} />}
        {fieldConfig.status.visible && <SelectField label="Status" value={formState.status} onChange={v => setFormState(p => p ? ({...p, status: v as any}) : null)} options={['Ativo', 'Inativo']} disabled={fieldConfig.status.disabled} />}
    </div>
  );

  const renderNewContractForm = () => newContractData && (
    <>
        <div className="pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Contrato Atual</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <ReadOnlyField label="Unidade (Vínculo Atual)" value={formState.unidades.join(', ')} containerClassName="md:col-span-2" />
                <ReadOnlyField label="Entidade" value={formState.entidade} />
                <ReadOnlyField label="Empresa (Contrato Atual)" value={formState.razaoSocial} containerClassName="md:col-span-2" />
                <ReadOnlyField label="CNPJ" value={formState.cnpj} />
                <ReadOnlyField label="Nome Completo" value={formState.name} containerClassName="md:col-span-2" />
                <ReadOnlyField label="CPF" value={formState.cpf} />
                <ReadOnlyField label="Cargo (Vínculo Atual)" value={formState.cargo} />
            </div>
        </div>
        <div className="pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Novo Contrato</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                 <div className="md:col-span-2 relative" ref={unitRef}>
                    <label className="block text-sm font-medium text-gray-700">Entidade/Unidade (Novo Contrato)<span className="text-red-500">*</span></label>
                    <div className="mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[42px]">
                        {newContractData.unidades.map(unit => (
                            <span key={unit} className="flex items-center bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                {unit} <button onClick={() => toggleNewContractUnit(unit)} className="ml-2 text-red-500 hover:text-red-700"><XMarkIcon className="w-3 h-3" /></button>
                            </span>
                        ))}
                        <input type="text" value={unitSearch} onChange={(e) => setUnitSearch(e.target.value)} onFocus={() => setIsUnitDropdownOpen(true)} className="flex-grow bg-transparent focus:outline-none text-sm" />
                    </div>
                    {isUnitDropdownOpen && <div className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">{filteredUnits.SESI.map(unit => <li key={unit} className={`px-3 py-2 cursor-pointer list-none hover:bg-red-100 ${newContractData.unidades.includes(unit) ? 'bg-red-50' : ''}`} onMouseDown={() => { toggleNewContractUnit(unit); setUnitSearch(''); }}>{unit}</li>)}{filteredUnits.SENAI.map(unit => <li key={unit} className={`px-3 py-2 cursor-pointer list-none hover:bg-red-100 ${newContractData.unidades.includes(unit) ? 'bg-red-50' : ''}`} onMouseDown={() => { toggleNewContractUnit(unit); setUnitSearch(''); }}>{unit}</li>)}</div>}
                 </div>
                 <ReadOnlyField label="Entidade" value={newContractData.entidade} />
                 <div className="md:col-span-2"><SelectField label="Empresa (Novo Contrato)" value={newContractData.razaoSocial} onChange={handleNewContractCompanyChange} options={companies.map(c => c.name)} required /></div>
                 <ReadOnlyField label="CNPJ" value={newContractData.cnpj} />
                 <div>
                    <label htmlFor="new-contract-cargo" className="block text-sm font-medium text-gray-700">Cargo (Novo Contrato)<span className="text-red-500">*</span></label>
                    <select
                        id="new-contract-cargo"
                        value={newContractData.cargo}
                        onChange={(e) => setNewContractData(p => p ? {...p, cargo: e.target.value} : null)}
                        disabled={!newContractData.razaoSocial || newContractAvailableCargos.length === 0}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="">
                            {!newContractData.razaoSocial ? 'Selecione uma empresa' : 'Selecione um cargo'}
                        </option>
                        {newContractAvailableCargos.map(cargo => (
                            <option key={cargo} value={cargo}>
                                {cargo}
                            </option>
                        ))}
                    </select>
                    {newContractAvailableCargos.length === 0 && newContractData.razaoSocial && (
                        <p className="text-xs text-gray-500 mt-1">Nenhum cargo/serviço disponível para esta empresa.</p>
                    )}
                 </div>
                 <InputField label="Data de início do vínculo (Novo Contrato)" value={newContractData.dataInicioVinculo} onChange={v => setNewContractData(p => p ? {...p, dataInicioVinculo: formatDate(v)} : null)} required />
                 <InputField label="Data de início das atividades (Novo Contrato)" value={newContractData.dataInicioAtividades} onChange={v => setNewContractData(p => p ? {...p, dataInicioAtividades: formatDate(v)} : null)} required />
                 <SelectField label="Jornada de Trabalho (Novo Contrato)" value={newContractData.jornadaTrabalho} onChange={v => setNewContractData(p => p ? {...p, jornadaTrabalho: v as any} : null)} options={jornadaOptions} required />
                 <RadioGroup label="Recebe adicional de insalubridade ou periculosidade?" value={newContractData.recebeInsalubridade} onChange={(v) => handleInsalubridadeChange(v as any, true)} required />
                 {newContractData.recebeInsalubridade === 'Sim' && <RadioGroup label="Natureza do adicional de insalubridade ou periculosidade." value={newContractData.naturezaAdicional || ''} onChange={(v) => handleNaturezaChange(v as any, true)} options={['Temporário', 'Definitivo']} required />}
                 {newContractData.recebeInsalubridade === 'Sim' && <InputField label="Data início Insalubridade e Periculosidade." value={newContractData.dataInicioInsalubridade || ''} onChange={v => setNewContractData(p => p ? ({ ...p, dataInicioInsalubridade: formatDate(v) }) : null)} required />}
                 {newContractData.recebeInsalubridade === 'Sim' && newContractData.naturezaAdicional === 'Temporário' && <InputField label="Data Término insalubridade e Periculosidade." value={newContractData.dataTerminoInsalubridade || ''} onChange={v => setNewContractData(p => p ? ({ ...p, dataTerminoInsalubridade: formatDate(v) }) : null)} required />}
            </div>
        </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Editar Terceiro</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
        </div>

        <div className="space-y-4 max-h-[70vh] pr-2 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                    <SelectField
                        label="Tipo de alteração"
                        value={changeType}
                        onChange={handleChangeType}
                        options={changeTypeOptions}
                        required
                    />
                </div>
            </div>
            
            {changeType === "Encerramento de vínculo com a contratada e início com nova contratada." 
                ? renderNewContractForm()
                : changeType 
                    ? renderStandardForm()
                    : null
            }
        </div>

        <div className="flex justify-between items-center border-t pt-4 mt-4">
            <p className="text-xs text-gray-500">Os campos obrigatórios estão marcados com *</p>
            <div className="space-x-3">
                <button onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">Cancelar</button>
                <button onClick={handleSave} disabled={!changeType} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">Salvar</button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const InputField: React.FC<{label: string, value: string, onChange: (v: string) => void, required?: boolean, disabled?: boolean, containerClassName?: string, maxLength?: number}> = ({label, value, onChange, required, disabled, containerClassName, maxLength}) => (
    <div className={containerClassName}>
        <label className="block text-sm font-medium text-gray-700">{label} {required && !disabled && <span className="text-red-500">*</span>}</label>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} maxLength={maxLength} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} />
    </div>
);
const ReadOnlyField: React.FC<{label: string, value: string, containerClassName?: string}> = ({label, value, containerClassName}) => (
    <div className={containerClassName}>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input type="text" value={value} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm cursor-not-allowed" />
    </div>
);
const SelectField: React.FC<{label: string, value: string, onChange: (v: string) => void, options: string[], required?: boolean, disabled?: boolean}> = ({label, value, onChange, options, required, disabled}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label} {required && !disabled && <span className="text-red-500">*</span>}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}>
            <option value="">Selecione...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);
const RadioGroup: React.FC<{label: string, value: string, onChange: (v: string) => void, disabled?: boolean, options?: string[], required?: boolean}> = ({ label, value, onChange, disabled, options=['Sim', 'Não'], required }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label} {required && !disabled && <span className="text-red-500">*</span>}</label>
        <div className="flex gap-4 mt-2">
            {options.map(opt => (
                <label className="flex items-center space-x-2" key={opt}>
                    <input type="radio" name={`${label}-${opt}`} value={opt} checked={value === opt} disabled={disabled} onChange={() => onChange(opt)} className={`h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`} />
                    <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{opt}</span>
                </label>
            ))}
        </div>
    </div>
);

export default EditThirdPartyModal;
