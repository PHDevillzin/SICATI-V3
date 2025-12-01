import React, { useEffect, useCallback, useState } from 'react';
import { XMarkIcon } from './icons/HeroIcons';
import { ThirdParty, HistoryEntry } from '../pages/ManageThirdPartiesPage';

// Helper to get a display-friendly name for a field key
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

const changeTypeDisplayMap: Record<string, string> = {
    "Criação": "Criação",
    "Encerramento das atividades na unidade.": "Encerramento unidade",
    "Encerramento de vínculo com a contratada e início com nova contratada.": "Alteração de vínculo",
    "Encerramento do contrato de trabalho.": "Encerramento contrato",
    "Alteração na jornada de trabalho.": "Alteração de jornada",
    "Percepção temporária de adicional de insalubridade ou periculosidade.": "Insalubridade/Periculosidade",
    "Alteração de dados cadastrais": "Alteração de dados",
    "Transferência e readimissão": "Transferência/Readmissão",
};

const fieldsToShowMap: Record<string, (keyof Omit<ThirdParty, 'history' | 'id'>)[]> = {
    "Encerramento das atividades na unidade.": ['dataEncerramentoAtividades', 'status'],
    "Encerramento do contrato de trabalho.": ['dataEncerramentoAtividades', 'dataEncerramentoVinculo', 'status'],
    "Alteração na jornada de trabalho.": ['jornadaTrabalho'],
    "Percepção temporária de adicional de insalubridade ou periculosidade.": ['recebeInsalubridade', 'naturezaAdicional', 'dataInicioInsalubridade', 'dataTerminoInsalubridade'],
    "Alteração de dados cadastrais": ['cpf', 'name', 'dataNascimento', 'dataInicioAtividades', 'escolaridade', 'genero', 'status', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'uf', 'cep', 'obsReferencia', 'pais'],
};


// Helper to format values for display
const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
};

// The component that shows the details of a change
const ChangeDetails: React.FC<{ entry: HistoryEntry; afterState: Omit<ThirdParty, 'history'> | null }> = ({ entry, afterState }) => {
    const beforeState = entry.snapshotBeforeChange;

    // Case 1: 'Criação' entry
    if (!beforeState) {
        if (!afterState) return <div className="p-4 text-center text-gray-500">Dados de criação indisponíveis.</div>;
        
        const allFields = (Object.keys(afterState) as (keyof typeof afterState)[]).filter(
             (key): key is keyof Omit<ThirdParty, 'history' | 'id'> => key !== 'id'
        );
        
        return (
            <div className="p-4 bg-slate-50">
                <h4 className="font-semibold text-gray-700 mb-2">Dados Cadastrados:</h4>
                <ul className="space-y-1 text-sm grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    {allFields.map(field => (
                        <li key={field} className="grid grid-cols-2 gap-2 py-1 border-b border-slate-200">
                            <span className="font-medium text-gray-600 col-span-1">{getFieldLabel(field)}:</span>
                            <span className="text-gray-800 col-span-1">{formatValue(afterState[field])}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
    
    if (!afterState) return <div className="p-4 text-center text-gray-500">Não foi possível comparar as alterações.</div>;

    // Case 2: Special 'New Contract' entry
    if (entry.changeType === "Encerramento de vínculo com a contratada e início com nova contratada." || entry.changeType === "Transferência e readimissão") {
        const fieldsToCompare: (keyof Omit<ThirdParty, 'history' | 'id'>)[] = [ 'unidades', 'entidade', 'razaoSocial', 'cnpj', 'dataInicioVinculo', 'dataInicioAtividades', 'jornadaTrabalho', 'cargo', 'recebeInsalubridade' ];
        
        if (beforeState.recebeInsalubridade === 'Sim' || afterState.recebeInsalubridade === 'Sim') {
            fieldsToCompare.push('naturezaAdicional', 'dataInicioInsalubridade', 'dataTerminoInsalubridade');
        }

        return (
            <div className="p-4 bg-slate-50">
                <table className="w-full text-sm">
                    <thead className="text-left">
                        <tr>
                            <th className="font-semibold text-gray-700 p-2 w-1/4">Campo</th>
                            <th className="font-semibold text-gray-700 p-2 w-1/3 border-l">Contrato Anterior</th>
                            <th className="font-semibold text-gray-700 p-2 w-1/3 border-l">Novo Contrato</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                         {fieldsToCompare.map((field) => (
                            <tr key={field}>
                                <td className="p-2 font-medium text-gray-600">{getFieldLabel(field)}</td>
                                <td className="p-2 text-gray-500 border-l">{formatValue(beforeState[field])}</td>
                                <td className="p-2 text-gray-800 font-medium border-l">{formatValue(afterState[field])}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
    
    // Case 3: All other changes
    const fieldsToCompareFromMap = fieldsToShowMap[entry.changeType];
    const allPossibleFields = (Object.keys(beforeState) as (keyof typeof beforeState)[]).filter(
        (key): key is keyof Omit<ThirdParty, 'history' | 'id'> => key !== 'id'
    );
    const fieldsToCompare = fieldsToCompareFromMap || allPossibleFields;

    const diffs = fieldsToCompare
        .map(field => ({
            field,
            before: formatValue(beforeState[field]),
            after: formatValue(afterState[field]),
        }))
        .filter(d => d.before !== d.after);

    if (diffs.length === 0) {
        return <div className="p-4 text-center text-gray-500">Nenhuma alteração de dados encontrada para este evento.</div>;
    }

    return (
        <div className="p-4 bg-slate-50">
            <table className="w-full text-sm">
                <thead className="text-left">
                    <tr>
                        <th className="font-semibold text-gray-700 p-2 w-1/3">Campo</th>
                        <th className="font-semibold text-gray-700 p-2 w-1/3 border-l">Valor Anterior</th>
                        <th className="font-semibold text-gray-700 p-2 w-1/3 border-l">Valor Atual</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {diffs.map(({ field, before, after }) => (
                        <tr key={field}>
                            <td className="p-2 font-medium text-gray-600">{getFieldLabel(field)}</td>
                            <td className="p-2 text-gray-500 border-l">{before}</td>
                            <td className="p-2 text-gray-800 font-medium border-l">{after}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

interface HistoryThirdPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  thirdParty: ThirdParty | null;
}

const HistoryThirdPartyModal: React.FC<HistoryThirdPartyModalProps> = ({ isOpen, onClose, thirdParty }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  const handleClose = useCallback(() => {
    setExpandedIndex(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleClose]);
  
  useEffect(() => {
    if (!isOpen) {
        setExpandedIndex(null);
    }
  }, [isOpen]);

  if (!isOpen || !thirdParty) return null;
  
  const historyReversed = [...thirdParty.history].reverse();

  const getAfterState = (reversedIndex: number, tp: ThirdParty): Omit<ThirdParty, 'history'> | null => {
      const originalIndex = tp.history.length - 1 - reversedIndex;
      if (originalIndex === tp.history.length - 1) {
          const { history, ...currentState } = tp;
          return currentState;
      }
      return tp.history[originalIndex + 1]?.snapshotBeforeChange || null;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={handleClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Histórico</h2>
                <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
                <table className="min-w-full border-collapse">
                    <thead className="bg-[#800000] text-white">
                        <tr>
                            <th className="py-2 px-4 text-left text-sm font-semibold w-1/4">Data da alteração</th>
                            <th className="py-2 px-4 text-left text-sm font-semibold w-1/2">Tipo da alteração</th>
                            <th className="py-2 px-4 text-left text-sm font-semibold w-1/4">Responsável</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyReversed.map((entry, index) => (
                            <React.Fragment key={`${entry.changeDate}-${index}`}>
                                <tr 
                                    className="border-b cursor-pointer hover:bg-gray-50"
                                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                >
                                    <td className="py-3 px-4 text-sm text-gray-700">{entry.changeDate}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{changeTypeDisplayMap[entry.changeType] || entry.changeType}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{entry.responsible}</td>
                                </tr>
                                {expandedIndex === index && (
                                    <tr className="border-b bg-gray-50">
                                        <td colSpan={3} className="p-0">
                                            <ChangeDetails 
                                                entry={entry}
                                                afterState={getAfterState(index, thirdParty)}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="flex justify-end items-center p-4 border-t mt-auto">
                <button 
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
            </div>
        </div>
    </div>
  );
};

export default HistoryThirdPartyModal;