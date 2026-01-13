import React from 'react';
import { Story, StoryStatus } from '../types/story.types';

interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

const statusColors: Record<StoryStatus, string> = {
  [StoryStatus.NEW]: 'bg-blue-100 text-blue-800',
  [StoryStatus.READ]: 'bg-green-100 text-green-800',
  [StoryStatus.ARCHIVED]: 'bg-gray-100 text-gray-800',
  [StoryStatus.FLAGGED]: 'bg-red-100 text-red-800',
};

export const StoryCard: React.FC<StoryCardProps> = ({ story, onClick }) => {
  const preview = story.content.length > 150 ? story.content.substring(0, 150) + '...' : story.content;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 p-6 cursor-pointer border border-gray-200 hover:border-purple-300"
    >
      <div className="flex justify-between items-start mb-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            statusColors[story.status]
          }`}
        >
          {story.status}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(story.submittedAt).toLocaleDateString()}
        </span>
      </div>

      <p className="text-gray-700 mb-3 line-clamp-3">{preview}</p>

      {story.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            Note: {story.notes.substring(0, 60)}
            {story.notes.length > 60 && '...'}
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>ID: {story.id.substring(0, 8)}...</span>
        <span>Click to view full story</span>
      </div>
    </div>
  );
};

