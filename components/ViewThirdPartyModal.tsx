import React, { useEffect, useCallback } from 'react';
import { XMarkIcon } from './icons/HeroIcons';
import { ThirdParty } from '../pages/ManageThirdPartiesPage';

interface ViewThirdPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  thirdParty: ThirdParty | null;
}

const ViewThirdPartyModal: React.FC<ViewThirdPartyModalProps> = ({ isOpen, onClose, thirdParty }) => {

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

  if (!isOpen || !thirdParty) return null;

  const creationRecord = thirdParty.history?.find(h => h.changeType === 'Criação') || thirdParty.history?.[0];
  const lastUpdate = thirdParty.history && thirdParty.history.length > 1 ? thirdParty.history[thirdParty.history.length - 1] : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Visualização de Terceiro</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 max-h-[70vh] pr-2 overflow-y-auto">
            {/* Section: Company and Unit Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Informações da Contratada e Unidade</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="md:col-span-2"><ReadOnlyField label="Razão Social da Contratada" value={thirdParty.razaoSocial} /></div>
                <ReadOnlyField label="CNPJ da Contratada" value={thirdParty.cnpj} />
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Unidades</label>
                    <div className="mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 bg-gray-100 rounded-md min-h-[42px]">
                        {thirdParty.unidades.map(unit => (
                            <span key={unit} className="flex items-center bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">{unit}</span>
                        ))}
                    </div>
                </div>
                <ReadOnlyField label="Entidade" value={thirdParty.entidade} />
              </div>
            </div>

            {/* Section: Personal Data */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Dados Pessoais do Colaborador</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="md:col-span-2"><ReadOnlyField label="Nome Completo do Terceiro" value={thirdParty.name} /></div>
                <ReadOnlyField label="CPF" value={thirdParty.cpf} />
                <ReadOnlyField label="Data de nascimento" value={thirdParty.dataNascimento} />
                <ReadOnlyField label="Gênero" value={thirdParty.genero} />
                <ReadOnlyField label="Escolaridade" value={thirdParty.escolaridade} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-4">
                  <div className="md:col-span-4"><ReadOnlyField label="Endereço" value={thirdParty.endereco} /></div>
                  <div className="md:col-span-2"><ReadOnlyField label="Número" value={thirdParty.numero} /></div>
                  <div className="md:col-span-3"><ReadOnlyField label="Complemento" value={thirdParty.complemento || '—'} /></div>
                  <div className="md:col-span-3"><ReadOnlyField label="Bairro" value={thirdParty.bairro} /></div>
                  <div className="md:col-span-3"><ReadOnlyField label="CEP" value={thirdParty.cep} /></div>
                  <div className="md:col-span-3"><ReadOnlyField label="Cidade" value={thirdParty.cidade} /></div>
                  <div className="md:col-span-2"><ReadOnlyField label="Estado" value={thirdParty.estado} /></div>
                  <div className="md:col-span-1"><ReadOnlyField label="UF" value={thirdParty.uf} /></div>
                  <div className="md:col-span-3"><ReadOnlyField label="País" value={thirdParty.pais} /></div>
                  <div className="md:col-span-6"><ReadOnlyField label="OBS/Referência" value={thirdParty.obsReferencia || '—'} /></div>
              </div>
            </div>
            
            {/* Section: Work Contract Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Informações do Vínculo de Trabalho</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <ReadOnlyField label="Cargo" value={thirdParty.cargo} />
                <ReadOnlyField label="Jornada de Trabalho" value={thirdParty.jornadaTrabalho} />
                <ReadOnlyField label="Data de início do vínculo" value={thirdParty.dataInicioVinculo} />
                <ReadOnlyField label="Data de início das atividades" value={thirdParty.dataInicioAtividades} />
                <ReadOnlyField label="Data de encerramento das atividades" value={thirdParty.dataEncerramentoAtividades || '—'} />
                <ReadOnlyField label="Data de encerramento do vínculo" value={thirdParty.dataEncerramentoVinculo || '—'} />
                <div className="md:col-span-3">
                    <ReadOnlyField label="Status" value={thirdParty.status} />
                </div>
              </div>
            </div>
            
            {/* Section: Health & Safety Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Informações de Insalubridade / Periculosidade</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <ReadOnlyField label="Recebe adicional?" value={thirdParty.recebeInsalubridade} />
                {thirdParty.recebeInsalubridade === 'Sim' && (
                    <>
                        <ReadOnlyField label="Natureza do adicional" value={thirdParty.naturezaAdicional || 'Não Informado'} />
                        <ReadOnlyField label="Data início do adicional" value={thirdParty.dataInicioInsalubridade || 'Não Informado'} />
                        {thirdParty.naturezaAdicional === 'Temporário' && (
                            <ReadOnlyField label="Data término do adicional" value={thirdParty.dataTerminoInsalubridade || 'Não Informado'} />
                        )}
                    </>
                )}
              </div>
            </div>

            {/* Section: System Registration Info */}
            {creationRecord && (
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Informações do Cadastro no Sistema</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <ReadOnlyField label="Nome do responsável" value={creationRecord.responsible} />
                        <ReadOnlyField label="Data do cadastro" value={creationRecord.changeDate} />
                        <ReadOnlyField label="Última atualização" value={lastUpdate ? lastUpdate.changeDate : '—'} />
                    </div>
                </div>
            )}
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

export default ViewThirdPartyModal;