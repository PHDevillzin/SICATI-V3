
import React, { useEffect, useCallback } from 'react';
import { XMarkIcon } from './icons/HeroIcons';
import { Company } from '../pages/ManageCompaniesPage';

interface ViewCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
}

const ViewCompanyModal: React.FC<ViewCompanyModalProps> = ({ isOpen, onClose, company }) => {

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Visualização de Empresa</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="max-h-[70vh] pr-2 overflow-y-auto space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Dados da Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="md:col-span-2">
                        <ReadOnlyField label="Nome da Empresa" value={company.name} />
                    </div>
                    <ReadOnlyField label="CNPJ" value={company.cnpj} />
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Contratos Associados</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-md border mt-2">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="py-2 px-4 text-left text-xs font-medium uppercase">Nº de contrato</th>
                                <th className="py-2 px-4 text-left text-xs font-medium uppercase">Data início</th>
                                <th className="py-2 px-4 text-left text-xs font-medium uppercase">Data Encerramento</th>
                                <th className="py-2 px-4 text-left text-xs font-medium uppercase">PSDA</th>
                                <th className="py-2 px-4 text-left text-xs font-medium uppercase">Serviço Prestado</th>
                                <th className="py-2 px-4 text-left text-xs font-medium uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {company.contracts.map(contract => (
                                <tr key={contract.id}>
                                    <td className="py-2 px-4 text-sm font-semibold text-gray-700">{contract.numeroContrato || '—'}</td>
                                    <td className="py-2 px-4 text-sm">{contract.dataInicio}</td>
                                    <td className="py-2 px-4 text-sm">{contract.dataEncerramento || '—'}</td>
                                    <td className="py-2 px-4 text-sm">{contract.psda}</td>
                                    <td className="py-2 px-4 text-sm truncate" title={contract.serviceProvided.join(', ')}>{contract.serviceProvided.join(', ')}</td>
                                    <td className="py-2 px-4 text-sm">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contract.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {contract.status}
                                      </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="flex justify-end items-center border-t pt-4 mt-4">
          <button onClick={handleClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

const ReadOnlyField: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type="text"
            value={value}
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
        />
    </div>
);

export default ViewCompanyModal;
