import React, { useState } from 'react';
import { Story, StoryStatus, UpdateStoryRequest } from '../types/story.types';
import { useUpdateStory, useDeleteStory } from '../hooks/useStories';

interface StoryModalProps {
  story: Story;
  isOpen: boolean;
  onClose: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ story, isOpen, onClose }) => {
  const [status, setStatus] = useState<StoryStatus>(story.status);
  const [notes, setNotes] = useState(story.notes || '');
  const [isEditing, setIsEditing] = useState(false);

  const { mutate: updateStory, isPending: isUpdating } = useUpdateStory();
  const { mutate: deleteStory, isPending: isDeleting } = useDeleteStory();

  if (!isOpen) return null;

  const handleUpdate = () => {
    const data: UpdateStoryRequest = {};

    if (status !== story.status) {
      data.status = status;
    }

    if (notes !== (story.notes || '')) {
      data.notes = notes;
    }

    if (Object.keys(data).length > 0) {
      updateStory(
        { id: story.id, data },
        {
          onSuccess: () => {
            setIsEditing(false);
            onClose();
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      deleteStory(story.id, {
        onSuccess: onClose,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Story Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Story Content</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{story.content}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as StoryStatus);
                    setIsEditing(true);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  disabled={isUpdating}
                >
                  <option value={StoryStatus.NEW}>NEW</option>
                  <option value={StoryStatus.READ}>READ</option>
                  <option value={StoryStatus.ARCHIVED}>ARCHIVED</option>
                  <option value={StoryStatus.FLAGGED}>FLAGGED</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Submitted</label>
                <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
                  {new Date(story.submittedAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setIsEditing(true);
                }}
                placeholder="Add internal notes about this story..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
                maxLength={5000}
                disabled={isUpdating}
              />
              <p className="text-xs text-gray-500 mt-1">{notes.length} / 5000 characters</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button
                onClick={handleUpdate}
                disabled={!isEditing || isUpdating}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  isEditing && !isUpdating
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                onClick={handleDelete}
                disabled={isDeleting || isUpdating}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Story'}
              </button>
            </div>

            <div className="text-xs text-gray-500 space-y-1 pt-2">
              <p>Story ID: {story.id}</p>
              <p>Last Updated: {new Date(story.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

