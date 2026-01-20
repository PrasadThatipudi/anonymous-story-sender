import React, { useState } from 'react';
import { useCreateInvitation } from '../hooks/useManagers';
import { ManagerRole } from '../types/manager.types';

interface InviteManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteManagerModal: React.FC<InviteManagerModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ManagerRole>(ManagerRole.MANAGER);

  const { mutate: createInvitation, isPending } = useCreateInvitation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvitation(
      { email, role },
      {
        onSuccess: () => {
          setEmail('');
          setRole(ManagerRole.MANAGER);
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Invite Manager</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="manager@example.com"
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as ManagerRole)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isPending}
            >
              <option value={ManagerRole.MANAGER}>Manager (View Only)</option>
              <option value={ManagerRole.ADMIN}>Admin (Full Access)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {role === ManagerRole.ADMIN
                ? 'Admins can view, edit, delete stories, export data, and invite managers'
                : 'Managers can view stories and add notes only'}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                isPending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
              }`}
            >
              {isPending ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

