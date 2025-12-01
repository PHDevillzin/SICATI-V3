
import React, { useEffect, useCallback } from 'react';
import { XMarkIcon } from './icons/HeroIcons';

interface User {
  id: number;
  nif: string;
  name: string;
  email: string;
  unidade: string;
  profile: string;
  createdBy: string;
  createdAt: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ isOpen, onClose, user }) => {

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
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [handleClose]);

  if (!isOpen || !user) return null;

  const userUnits = user.unidade.split(', ').filter(u => u);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Visualizar usuário</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] pr-2 overflow-y-auto">
          <div>
            <label htmlFor="name-view" className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              id="name-view"
              value={user.name}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="email-view" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              id="email-view"
              value={user.email}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="profile-view" className="block text-sm font-medium text-gray-700">Perfil</label>
            <input
              type="text"
              id="profile-view"
              value={user.profile}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Unidades</label>
            <div className="mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 bg-gray-100 rounded-md min-h-[42px]">
                {userUnits.length > 0 ? userUnits.map(unit => (
                    <span key={unit} className="flex items-center bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                        {unit}
                    </span>
                )) : (
                    <span className="text-sm text-gray-500 px-1">Nenhuma unidade associada.</span>
                )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 border-b pb-2">Log de Alterações</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cadastrado por</label>
                    <input type="text" value={user.createdBy} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data do cadastro</label>
                    <input type="text" value={user.createdAt} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Última edição por</label>
                    <input type="text" value={user.lastEditedBy || '—'} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data da última edição</label>
                    <input type="text" value={user.lastEditedAt || '—'} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm cursor-not-allowed" />
                </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center border-t pt-4 mt-4">
          <button 
            onClick={handleClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;
