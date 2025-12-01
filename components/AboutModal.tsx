import React, { useEffect, useCallback, useRef } from 'react';
import { XMarkIcon } from './icons/HeroIcons';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [handleClose, isOpen]);

  useEffect(() => {
      if (isOpen) {
          modalRef.current?.focus();
      }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 id="about-modal-title" className="text-xl font-semibold text-gray-800">Sobre a Aplicação</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600" aria-label="Fechar modal">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] pr-2 overflow-y-auto text-gray-600">
          <p>
            O <strong>SICAT (Sistema de Cadastro de Terceiros)</strong> é uma aplicação web desenvolvida para otimizar e centralizar a gestão de colaboradores terceirizados, empresas parceiras e usuários do sistema no âmbito do SESI/SENAI.
          </p>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Funcionalidades Principais:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Gerenciamento de Usuários:</strong> Cadastro e controle de perfis de acesso ao sistema, com permissões baseadas no nível de atuação (Unidade, Gestor, Sede, etc.).</li>
              <li><strong>Gerenciamento de Terceiros:</strong> Registro detalhado de colaboradores terceirizados, incluindo dados pessoais, informações contratuais, histórico de alocação e status.</li>
              <li><strong>Gerenciamento de Empresas:</strong> Base de dados das empresas contratadas, com seus respectivos contratos e vínculos com os colaboradores.</li>
              <li><strong>Dashboard Interativo:</strong> Visualização de dados consolidados e métricas importantes, como o número de funcionários por unidade, por empresa ou por cargo.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Objetivo:</h3>
            <p>
              Prover uma ferramenta robusta, segura e intuitiva que garanta a conformidade dos dados, facilite o acesso à informação e melhore a eficiência operacional dos gestores de unidades e da Gerência de Facilities.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center border-t pt-4 mt-6">
          <p className="text-xs text-gray-500">
            Sistema SICAT: V2.0.0 - GSTI - Sesi/Senai
          </p>
          <button 
            onClick={handleClose}
            className="px-6 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;