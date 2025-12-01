
import React, { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from './icons/HeroIcons';
import { useToast } from '../contexts/ToastContext';
import { Company, Contract } from '../pages/ManageCompaniesPage';

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: Company) => void;
  company: Company | null;
}

const EditCompanyModal: React.FC<EditCompanyModalProps> = ({ isOpen, onClose, onSave, company }) => {
  const [editableCompany, setEditableCompany] = useState<Company | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (company) {
      // Deep copy to prevent modifying the original object directly
      setEditableCompany(JSON.parse(JSON.stringify(company)));
    } else {
      setEditableCompany(null);
    }
  }, [company, isOpen]);

  const handleClose = useCallback(() => {
    if (company && editableCompany) {
      if (JSON.stringify(company) !== JSON.stringify(editableCompany)) {
        showToast('Edição cancelada. Nenhuma alteração foi salva.', 'warning');
      }
    }
    onClose();
  }, [onClose, company, editableCompany, showToast]);

  const handleSave = () => {
    if (editableCompany) {
      if (!editableCompany.name) {
        showToast("O nome da empresa é obrigatório.", 'warning');
        return;
      }
      onSave(editableCompany);
    }
  };

  const handleContractStatusChange = (contractId: number, newStatus: 'Ativo' | 'Inativo') => {
    setEditableCompany(prev => {
      if (!prev) return null;

      const getTodayDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        const year = today.getFullYear();
        return `${day}/${month}/${year}`;
      };

      return {
        ...prev,
        contracts: prev.contracts.map(c => {
          if (c.id === contractId) {
            // Check if status actually changed to avoid unnecessary updates
            if (c.status !== newStatus) {
              return {
                ...c,
                status: newStatus,
                dataEncerramento: newStatus === 'Inativo' ? getTodayDate() : undefined
              };
            }
            return c; // No change
          }
          return c;
        })
      };
    });
  };

  const handleNameChange = (newName: string) => {
     setEditableCompany(prev => {
      if (!prev) return null;
      return { ...prev, name: newName };
    });
  }

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  if (!isOpen || !editableCompany) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Editar Empresa</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="max-h-[70vh] pr-2 overflow-y-auto space-y-6">
            <div>
                 <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Dados da Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="md:col-span-2">
                        <EditableField label="Nome da Empresa" value={editableCompany.name} onChange={handleNameChange} required />
                    </div>
                    <ReadOnlyField label="CNPJ" value={editableCompany.cnpj} />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Gerenciar Contratos</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-md border mt-2">
                         <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="py-2 px-4 text-left text-xs font-medium uppercase w-1/6">Nº de contrato</th>
                                <th className="py-2 px-4 text-left text-xs font-medium uppercase w-1/6">Data início</th>
                                <th className="py-2 px-4 text-left text-xs font-medium uppercase w-1/6">Data Encerramento</th>
                                <th className="py-2 px-4 text-left text-xs font-medium uppercase w-1/6">PSDA</th>
                                <th className="py-2 px-4 text-left text-xs font-medium uppercase w-1/4">Serviço Prestado</th>
                                <th className="py-2 px-4 text-left text-xs font-medium uppercase w-auto">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                             {editableCompany.contracts.map(contract => (
                                <tr key={contract.id}>
                                    <td className="py-2 px-4 text-sm text-gray-500 font-semibold">{contract.numeroContrato || '—'}</td>
                                    <td className="py-2 px-4 text-sm text-gray-500">{contract.dataInicio}</td>
                                    <td className="py-2 px-4 text-sm text-gray-500">{contract.dataEncerramento || '—'}</td>
                                    <td className="py-2 px-4 text-sm text-gray-500">{contract.psda}</td>
                                    <td className="py-2 px-4 text-sm text-gray-500 truncate" title={contract.serviceProvided.join(', ')}>{contract.serviceProvided.join(', ')}</td>
                                    <td className="py-2 px-4">
                                        <select
                                            value={contract.status}
                                            onChange={(e) => handleContractStatusChange(contract.id, e.target.value as 'Ativo' | 'Inativo')}
                                            className={`w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 ${contract.status === 'Ativo' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                                        >
                                            <option value="Ativo">Ativo</option>
                                            <option value="Inativo">Inativo</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

const ReadOnlyField: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input type="text" value={value} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm cursor-not-allowed" />
    </div>
);

const EditableField: React.FC<{ 
    label: string, 
    value: string, 
    onChange: (val: string) => void,
    required?: boolean,
}> = ({ label, value, onChange, required }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
        />
    </div>
);

export default EditCompanyModal;
