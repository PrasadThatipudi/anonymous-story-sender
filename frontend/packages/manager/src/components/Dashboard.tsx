import React, { useState } from 'react';
import { useStories, useStats } from '../hooks/useStories';
import { useLogout } from '../hooks/useAuth';
import { useAuth } from '../contexts/AuthContext';
import { StoryCard } from './StoryCard';
import { StoryModal } from './StoryModal';
import { ExportButton } from './ExportButton';
import { InviteManagerModal } from './InviteManagerModal';
import { InvitationsList } from './InvitationsList';
import { ManagersList } from './ManagersList';
import { Story, StoryStatus } from '../types/story.types';

export const Dashboard: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StoryStatus | ''>('');
  const [search, setSearch] = useState('');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teamTab, setTeamTab] = useState<'invitations' | 'managers'>('invitations');

  const { manager, isAdmin } = useAuth();
  const { mutate: logout } = useLogout();
  const { data: stats } = useStats();
  const { data, isLoading, error } = useStories({
    page,
    limit: 20,
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Story Manager Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {manager?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <p className="text-sm text-gray-600 font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 font-medium">New</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.new}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <p className="text-sm text-gray-600 font-medium">Read</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.read}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
              <p className="text-sm text-gray-600 font-medium">Archived</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">{stats.archived}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <p className="text-sm text-gray-600 font-medium">Flagged</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.flagged}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StoryStatus | '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Statuses</option>
              <option value={StoryStatus.NEW}>NEW</option>
              <option value={StoryStatus.READ}>READ</option>
              <option value={StoryStatus.ARCHIVED}>ARCHIVED</option>
              <option value={StoryStatus.FLAGGED}>FLAGGED</option>
            </select>

            {isAdmin && <ExportButton />}
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Team Management</h2>
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-colors"
              >
                Invite Manager
              </button>
            </div>

            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setTeamTab('invitations')}
                  className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                    teamTab === 'invitations'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Pending Invitations
                </button>
                <button
                  onClick={() => setTeamTab('managers')}
                  className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                    teamTab === 'managers'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All Managers
                </button>
              </div>
            </div>

            {teamTab === 'invitations' ? <InvitationsList /> : <ManagersList />}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-gray-600 mt-4">Loading stories...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">Failed to load stories. Please try again.</p>
          </div>
        )}

        {data && data.stories.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No stories found</p>
          </div>
        )}

        {data && data.stories.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data.stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onClick={() => setSelectedStory(story)}
                />
              ))}
            </div>

            {data.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {data.pagination.totalPages}
                </span>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedStory && (
        <StoryModal
          story={selectedStory}
          isOpen={!!selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}

      {isAdmin && (
        <InviteManagerModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
};

